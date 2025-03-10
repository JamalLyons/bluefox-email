import { DEBUG, ERROR } from "@bluefox-email/utils";

// HTTP Methods and Response Types
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
  timestamp: number;
}

export interface RequestOptions {
  path: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retries?: number;
}

// Rate Limiting Types
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

// Error Types
export enum ErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  SERVER_ERROR = "SERVER_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  status: number;
  details?: Record<string, unknown>;
}

export class BluefoxError extends Error {
  public readonly code: ErrorCode;
  public readonly status: number;
  public readonly details?: Record<string, unknown>;

  constructor(error: ErrorDetails) {
    super(error.message);
    this.code = error.code;
    this.status = error.status;
    this.details = error.details;
    this.name = "BluefoxError";
  }

  static validation(
    message: string,
    details?: Record<string, unknown>,
  ): BluefoxError {
    return new BluefoxError({
      code: ErrorCode.VALIDATION_ERROR,
      message,
      status: 400,
      details,
    });
  }

  static rateLimit(reset: number): BluefoxError {
    return new BluefoxError({
      code: ErrorCode.RATE_LIMIT_ERROR,
      message: `Rate limit exceeded. Resets at ${new Date(reset).toISOString()}`,
      status: 429,
      details: { reset },
    });
  }
}

// Configuration Types
export interface BluefoxClientConfig {
  /** The API key for the Bluefox API */
  apiKey: string;
  /** Whether to enable debug logging */
  debug?: boolean;
  /** The maximum time in milliseconds to wait for a request to complete */
  requestTimeout?: number;
  /** The maximum number of times to retry a request before giving up */
  maxRetries?: number;
  /** Base URL override for the API */
  baseUrl?: string;
  /** Custom request interceptor */
  requestInterceptor?: (options: RequestOptions) => Promise<RequestOptions>;
  /** Custom response interceptor */
  responseInterceptor?: <T>(
    response: HttpResponse<T>,
  ) => Promise<HttpResponse<T>>;
}

export interface BluefoxContext {
  config: BluefoxClientConfig;
  readonly baseUrl: string;
  rateLimiter: RateLimiter;
}

// Rate Limiter
export class RateLimiter {
  private limit: number = Infinity;
  private remaining: number = Infinity;
  private reset: number = 0;

  updateFromHeaders(headers: Record<string, string>): void {
    this.limit = parseInt(headers["x-ratelimit-limit"] || String(Infinity), 10);
    this.remaining = parseInt(
      headers["x-ratelimit-remaining"] || String(Infinity),
      10,
    );
    this.reset = parseInt(headers["x-ratelimit-reset"] || "0", 10) * 1000;
  }

  async checkRateLimit(): Promise<void> {
    if (this.remaining <= 0) {
      const now = Date.now();
      if (now < this.reset) {
        throw BluefoxError.rateLimit(this.reset);
      }
    }
  }
}

// Result Types
export type Result<T> = Ok<T> | Err;
export type Ok<T> = { ok: true; value: T };
export type Err = { ok: false; error: BluefoxError };

// Base Module Implementation
export abstract class BluefoxModule {
  protected context: BluefoxContext;
  private readonly maxRetries: number;
  private readonly requestTimeout: number;
  private readonly debug: boolean;

  protected constructor(context: BluefoxContext) {
    this.context = context;
    this.maxRetries = context.config.maxRetries || 3;
    this.requestTimeout = context.config.requestTimeout || 15_000;
    this.debug = context.config.debug || false;
  }

  protected logDebug(name: string, data: unknown): void {
    if (this.debug) {
      DEBUG(name, data);
    }
  }

  protected logError(name: string, error: Error | unknown): void {
    ERROR(name, error);
    if (this.debug) {
      this.logDebug(`${name}.Details`, error);
    }
  }

  private handleError(error: unknown): Result<never> {
    const normalizedError = this.normalizeError(error);
    this.logError("BluefoxError", normalizedError);
    return { ok: false, error: normalizedError };
  }

  protected async request<T = Json>({
    path,
    method,
    headers = {},
    body,
  }: RequestOptions): Promise<Result<HttpResponse<T>>> {
    let options: RequestOptions = { path, method, headers, body };

    this.logDebug("Request", {
      url: `${this.context.baseUrl}/${path}`,
      method,
      headers: {
        ...headers,
        Authorization: "Bearer [REDACTED]",
      },
      body,
    });

    // Apply request interceptor if configured
    if (this.context.config.requestInterceptor) {
      try {
        options = await this.context.config.requestInterceptor(options);
        this.logDebug("RequestInterceptor", {
          modifiedOptions: {
            ...options,
            headers: {
              ...options.headers,
              Authorization: "Bearer [REDACTED]",
            },
          },
        });
      } catch (error) {
        this.logError("RequestInterceptorError", error);
        return this.handleError(error);
      }
    }

    // Check rate limits before making request
    try {
      await this.context.rateLimiter.checkRateLimit();
    } catch (error) {
      this.logError("RateLimitError", error);
      return this.handleError(error);
    }

    return this.executeRequest<T>(options);
  }

  private async executeRequest<T>(
    options: RequestOptions,
  ): Promise<Result<HttpResponse<T>>> {
    let attempt = 0;
    let lastError: BluefoxError | null = null;

    while (attempt < this.maxRetries) {
      if (attempt > 0) {
        this.logDebug("RetryAttempt", { attempt, maxRetries: this.maxRetries });
      }

      try {
        const response = await this.performRequest<T>(options);

        // Update rate limit info
        this.context.rateLimiter.updateFromHeaders(response.headers);

        this.logDebug("Response", {
          status: response.status,
          headers: response.headers,
          data: response.data,
        });

        // Apply response interceptor if configured
        if (this.context.config.responseInterceptor) {
          try {
            const interceptedResponse =
              await this.context.config.responseInterceptor(response);
            this.logDebug("ResponseInterceptor", {
              modifiedResponse: interceptedResponse,
            });
            return { ok: true, value: interceptedResponse };
          } catch (error) {
            this.logError("ResponseInterceptorError", error);
            return this.handleError(error);
          }
        }

        return { ok: true, value: response };
      } catch (error) {
        lastError = this.normalizeError(error);

        this.logError("RequestError", {
          attempt,
          error: lastError,
          willRetry: this.shouldRetry(lastError, attempt),
        });

        if (!this.shouldRetry(lastError, attempt)) {
          return { ok: false, error: lastError };
        }

        await this.delay(attempt);
        attempt++;
      }
    }

    return { ok: false, error: lastError! };
  }

  private async performRequest<T>(
    options: RequestOptions,
  ): Promise<HttpResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      options.timeout || this.requestTimeout,
    );

    try {
      const url = `${this.context.baseUrl}/${options.path}`;
      this.logDebug("FetchRequest", {
        url,
        method: options.method,
        headers: {
          ...options.headers,
          Authorization: "Bearer [REDACTED]",
        },
        bodySize: options.body ? JSON.stringify(options.body).length : 0,
      });

      const response = await fetch(url, {
        method: options.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.context.config.apiKey}`,
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await this.createErrorFromResponse(response);
      }

      const data = await response.json();
      const result = {
        data,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        timestamp: Date.now(),
      };

      this.logDebug("FetchResponse", {
        status: result.status,
        headers: result.headers,
        dataSize: JSON.stringify(result.data).length,
      });

      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async createErrorFromResponse(
    response: Response,
  ): Promise<BluefoxError> {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }

    return new BluefoxError({
      code: this.getErrorCodeFromStatus(response.status),
      message: errorData.message || response.statusText,
      status: response.status,
      details: errorData,
    });
  }

  private getErrorCodeFromStatus(status: number): ErrorCode {
    if (status === 429) return ErrorCode.RATE_LIMIT_ERROR;
    if (status === 401 || status === 403) return ErrorCode.AUTHENTICATION_ERROR;
    if (status >= 500) return ErrorCode.SERVER_ERROR;
    return ErrorCode.UNKNOWN_ERROR;
  }

  private normalizeError(error: unknown): BluefoxError {
    if (error instanceof BluefoxError) return error;
    if (error instanceof DOMException && error.name === "AbortError") {
      return new BluefoxError({
        code: ErrorCode.TIMEOUT_ERROR,
        message: "Request timeout exceeded",
        status: 408,
      });
    }
    return new BluefoxError({
      code: ErrorCode.NETWORK_ERROR,
      message:
        error instanceof Error ? error.message : "Network error occurred",
      status: 0,
    });
  }

  private shouldRetry(error: BluefoxError, attempt: number): boolean {
    return (
      attempt < this.maxRetries - 1 &&
      (error.code === ErrorCode.SERVER_ERROR ||
        error.code === ErrorCode.NETWORK_ERROR)
    );
  }

  private delay(attempt: number): Promise<void> {
    const ms = Math.min(1000 * Math.pow(2, attempt), 10000);
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// API Endpoints
export enum BluefoxEndpoints {
  subscriberLists = "subscriber-lists",
  sendTriggered = "send-triggered",
}

// Common Types
export type Json = Record<string, unknown>;
