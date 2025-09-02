type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
interface HttpResponse<T = unknown> {
    data: T;
    status: number;
    headers: Record<string, string>;
    timestamp: number;
}
interface RequestOptions {
    path: string;
    method: HttpMethod;
    headers?: Record<string, string>;
    body?: Record<string, unknown>;
    timeout?: number;
    retries?: number;
}
interface RateLimitInfo {
    limit: number;
    remaining: number;
    reset: number;
}
declare enum ErrorCode {
    VALIDATION_ERROR = "VALIDATION_ERROR",
    RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
    AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
    NETWORK_ERROR = "NETWORK_ERROR",
    TIMEOUT_ERROR = "TIMEOUT_ERROR",
    SERVER_ERROR = "SERVER_ERROR",
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
    METHOD_NOT_ALLOWED = "METHOD_NOT_ALLOWED",
    DUPLICATE_EMAIL = "DUPLICATE_EMAIL",
    INVALID_DATE = "INVALID_DATE",
    INSUFFICIENT_CREDITS = "INSUFFICIENT_CREDITS",
    MISSING_AWS_CONFIG = "MISSING_AWS_CONFIG",
    MISSING_PARAMETERS = "MISSING_PARAMETERS"
}
interface ErrorDetails {
    code: ErrorCode;
    message: string;
    status: number;
    details?: Record<string, unknown>;
}
declare class BluefoxError extends Error {
    readonly code: ErrorCode;
    readonly status: number;
    readonly details?: Record<string, unknown>;
    constructor(error: ErrorDetails);
    static validation(message: string, details?: Record<string, unknown>): BluefoxError;
    static rateLimit(reset: number): BluefoxError;
    static duplicateEmail(email: string, details?: Record<string, unknown>): BluefoxError;
    static invalidDate(message?: string, details?: Record<string, unknown>): BluefoxError;
    static methodNotAllowed(message?: string, details?: Record<string, unknown>): BluefoxError;
    static insufficientCredits(details?: Record<string, unknown>): BluefoxError;
    static missingAwsConfig(details?: Record<string, unknown>): BluefoxError;
    static missingParameters(message?: string, details?: Record<string, unknown>): BluefoxError;
}
interface BluefoxClientConfig {
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
    responseInterceptor?: <T>(response: HttpResponse<T>) => Promise<HttpResponse<T>>;
}
interface BluefoxContext {
    config: BluefoxClientConfig;
    readonly baseUrl: string;
    rateLimiter: RateLimiter;
}
declare class RateLimiter {
    private limit;
    private remaining;
    private reset;
    updateFromHeaders(headers: Record<string, string>): void;
    checkRateLimit(): Promise<void>;
}
type Result<T> = Ok<T> | Err;
type Ok<T> = {
    ok: true;
    value: T;
};
type Err = {
    ok: false;
    error: BluefoxError;
};
declare abstract class BluefoxModule {
    protected context: BluefoxContext;
    private readonly maxRetries;
    private readonly requestTimeout;
    private readonly debug;
    protected constructor(context: BluefoxContext);
    protected logDebug(name: string, data: unknown): void;
    protected logError(name: string, error: Error | unknown): void;
    private handleError;
    protected validateRequiredFields(fields: Record<string, unknown>): void;
    protected validateEmail(email: string): void;
    protected validateAttachments(attachments: Array<{
        fileName: string;
        content: string;
    }>): void;
    protected request<T = Json>({ path, method, headers, body, }: RequestOptions): Promise<Result<HttpResponse<T>>>;
    private executeRequest;
    private performRequest;
    private createErrorFromResponse;
    private getErrorCodeFromStatus;
    private normalizeError;
    private shouldRetry;
    private delay;
}
declare enum BluefoxEndpoints {
    subscriberLists = "subscriber-lists",
    sendTriggered = "send-triggered"
}
type Json = Record<string, unknown>;

export { type BluefoxClientConfig, type BluefoxContext, BluefoxEndpoints, BluefoxError, BluefoxModule, type Err, ErrorCode, type ErrorDetails, type HttpMethod, type HttpResponse, type Json, type Ok, type RateLimitInfo, RateLimiter, type RequestOptions, type Result };
