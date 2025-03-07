/** Version 1 of the Bluefox API https://bluefox.email/docs/api/ */
export namespace V1 {
  /**
   * A configuration object for initializing a BluefoxClient.
   *
   * @example
   * const bluefox = new BluefoxClient({
   *   apiKey: "your-api-key",
   *   debug: true,
   *   requestTimeout: 30_000,
   *   maxRetries: 5,
   * });
   */
  export type BluefoxClientConfig = {
    /** The API key for the Bluefox API */
    apiKey: string;
    /** Whether to enable debug logging */
    debug?: boolean;
    /** The maximum time in milliseconds to wait for a request to complete */
    requestTimeout?: number;
    /** The maximum number of times to retry a request before giving up */
    maxRetries?: number;
  };

  /** A context object shared between all Bluefox API modules. */
  export interface BluefoxContext {
    /** The configuration for the BluefoxClient */
    config: BluefoxClientConfig;
    /** The base URL for all API requests */
    readonly baseUrl: string;
  }

  /**
   * A type representing a JSON object.
   */
  export type Json = Record<string, unknown>;

  /**
   * A type representing the result of a request to the Bluefox API.
   *
   * @example
   * const result: Result<{ data: Json; status: number; timestamp: number }> = {
   *   ok: true,
   *   value: {
   *     data: { foo: "bar" },
   *     status: 200,
   *     timestamp: 1678902345,
   *   },
   * };
   */
  export type Result<T> = Ok<T> | Err;

  /**
   * A type representing a successful response from the Bluefox API.
   *
   * @example
   * const result: Ok<{ data: Json; status: number; timestamp: number }> = {
   *   ok: true,
   *   value: {
   *     data: { foo: "bar" },
   *     status: 200,
   *     timestamp: 1678902345,
   *   },
   * };
   */
  export type Ok<T> = { ok: true; value: T };

  /**
   * A type representing a failed response from the Bluefox API.
   *
   * @example
   * const result: Err = {
   *   ok: false,
   *   error: new BluefoxError("Failed to parse JSON response", 400),
   * };
   */
  export type Err = { ok: false; error: BluefoxError };

  /**
   * A class that represents an error that occurred when using the Bluefox API.
   *
   * @example
   * throw new BluefoxError("There was an error sending the email", 500);
   */
  export class BluefoxError extends Error {
    /** The HTTP status code of the error */
    public readonly status: number;

    /**
     * Create a new BluefoxError
     *
     * @param message The error message
     * @param status The HTTP status code of the error
     */
    public constructor(message: string, status?: number) {
      super(message);
      this.status = status || 500;
    }
  }

  /**
   * A base class for all Bluefox API modules.
   */
  export abstract class BluefoxModule {
    /** Shared state between all Bluefox API modules */
    protected context: BluefoxContext;
    /** The maximum number of retries for a request */
    private readonly MAX_RETRIES: number;
    /** The timeout duration for a request in milliseconds */
    private readonly REQUEST_TIMEOUT: number;

    protected constructor(context: BluefoxContext) {
      this.MAX_RETRIES = context.config.maxRetries || 3;
      this.REQUEST_TIMEOUT = context.config.requestTimeout || 15_000;
      this.context = context;
    }

    /**
     * A helper method to make a request to the Bluefox API.
     *
     * @param path The path of the API endpoint
     * @param method The HTTP method to use
     * @param headers The headers to include with the request
     * @param body The body of the request
     * @returns A result object with the response data, status, and timestamp
     */
    protected async request({
      path,
      method,
      headers = {},
      body,
    }: {
      path: string;
      method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
      body: string;
      headers?: Record<string, string>;
    }): Promise<Result<{ data: Json; status: number; timestamp: number }>> {
      console.debug(`[Bluefox REQUEST] ${method} ${path}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.REQUEST_TIMEOUT
      );

      let attempt = 0;
      let lastError: BluefoxError | null = null;

      while (attempt < this.MAX_RETRIES) {
        try {
          const response = await fetch(`${this.context.baseUrl}/${path}`, {
            method,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.context.config.apiKey}`,
              ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            let errorData;
            try {
              errorData = await response.json();
            } catch {
              errorData = { message: "Unknown error" };
            }

            lastError = new BluefoxError(
              `Request failed: ${errorData.message || response.statusText}`,
              response.status
            );

            // **Only retry on 5xx errors, not client errors**
            if (
              !this.isRetryableError(lastError) ||
              attempt >= this.MAX_RETRIES - 1
            ) {
              return { ok: false, error: lastError }; // Return early on non-retryable errors
            }

            // **Exponential backoff before retrying**
            const delay = Math.pow(2, attempt) * 500;
            await this.sleep(delay);
            attempt++;
            continue;
          }

          let data: Json;
          try {
            data = await response.json();
          } catch {
            return {
              ok: false,
              error: new BluefoxError(
                "Failed to parse JSON response",
                response.status
              ),
            };
          }

          return {
            ok: true,
            value: {
              data,
              status: response.status,
              timestamp: Date.now(),
            },
          };
        } catch (error) {
          lastError =
            error instanceof DOMException && error.name === "AbortError"
              ? new BluefoxError("Request timeout exceeded", 408)
              : new BluefoxError("Network error occurred", 0);

          if (
            attempt >= this.MAX_RETRIES - 1 ||
            !this.isRetryableError(error)
          ) {
            return { ok: false, error: lastError };
          }

          const delay = Math.pow(2, attempt) * 500; // Exponential backoff (500ms, 1s, 2s)
          await this.sleep(delay);
          attempt++;
        }
      }

      return { ok: false, error: lastError! };
    }

    private isRetryableError(error: unknown): boolean {
      return (
        error instanceof BluefoxError &&
        error.status >= 500 &&
        error.status < 600
      );
    }

    private sleep(ms: number): Promise<void> {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
  }

  export enum BluefoxEndpoints {
    subscriberLists = "/subscriber-lists",
    sendTriggered = "/send-triggered",
  }

  export enum BluefoxErrorCodes {
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    SERVER_ERROR = 500,
  }
}
