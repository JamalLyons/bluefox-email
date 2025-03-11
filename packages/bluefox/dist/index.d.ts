import { BluefoxModule, BluefoxContext, Result, HttpResponse, BluefoxClientConfig } from '@bluefox-email/api';

/**
 * I made this type from reading the debug logs from testing.
 * Not 100% sure if this is accurate
 */
interface Subscriber {
    _id: string;
    accountId: string;
    projectId: string;
    subscriberListId: string;
    name: string;
    email: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    pausedUntil?: string;
}
interface SubscriberList {
    items: Subscriber[];
    count: number;
}

/**
 * A client for the Bluefox.email API.
 *
 * @example
 * ```typescript
 * const bluefox = new BluefoxClient({
 *   apiKey: "your-api-key",
 *   debug: true,
 *   requestTimeout: 30000,
 * });
 *
 * // Manage subscribers
 * await bluefox.subscriber.add("list-123", "John Doe", "john@example.com");
 *
 * // Send emails
 * await bluefox.email.sendTransactional({
 *   to: "john@example.com",
 *   transactionalId: "welcome-email",
 *   data: { name: "John" }
 * });
 * ```
 */
declare class BluefoxClient extends BluefoxModule {
    /**
     * Module for managing subscribers.
     * @see https://bluefox.email/docs/api/subscriber-list-management
     */
    readonly subscriber: BluefoxSubscriber;
    /**
     * Module for sending emails.
     * @see https://bluefox.email/docs/api/send-transactional-email
     */
    readonly email: BluefoxEmail;
    constructor(config: BluefoxClientConfig);
}
/**
 * Module for managing subscribers.
 */
declare class BluefoxSubscriber extends BluefoxModule {
    constructor(context: BluefoxContext);
    /**
     * Subscribes a new member to the specified subscriber list.
     *
     * @param subscriberListId - The ID of the subscriber list
     * @param name - The subscriber's name
     * @param email - The subscriber's email address
     * @returns A promise that resolves to the subscriber details
     *
     * @throws {BluefoxError} If validation fails or the request fails
     *
     * @example
     * ```typescript
     * const result = await client.subscriber.add("list-123", "John Doe", "john@example.com");
     * if (result.ok) {
     *   console.log("Subscriber added:", result.value.data);
     * }
     * ```
     */
    add(subscriberListId: string, name: string, email: string): Promise<Result<HttpResponse<Subscriber>>>;
    /**
     * Unsubscribes a member from the specified subscriber list.
     *
     * @param subscriberListId - The ID of the subscriber list
     * @param email - The subscriber's email address
     * @returns A promise that resolves to the updated subscriber details
     *
     * @throws {BluefoxError} If validation fails or the request fails
     */
    remove(subscriberListId: string, email: string): Promise<Result<HttpResponse<Subscriber>>>;
    /**
     * Pauses a member's subscription until the specified date.
     *
     * @param subscriberListId - The ID of the subscriber list
     * @param email - The subscriber's email address
     * @param date - The date until which the subscription should be paused
     * @returns A promise that resolves to the updated subscriber details
     *
     * @throws {BluefoxError} If validation fails or the request fails
     */
    pause(subscriberListId: string, email: string, date: Date): Promise<Result<HttpResponse<Subscriber>>>;
    /**
     * Activates a paused or unsubscribed member.
     *
     * @param subscriberListId - The ID of the subscriber list
     * @param email - The subscriber's email address
     * @returns A promise that resolves to the updated subscriber details
     *
     * @throws {BluefoxError} If validation fails or the request fails
     */
    activate(subscriberListId: string, email: string): Promise<Result<HttpResponse<Subscriber>>>;
    /**
     * List users on a subscriber list.
     *
     * @param subscriberListId - The ID of the subscriber list
     * @returns TODO
     *
     * @throws {BluefoxError} If validation fails or the request fails
     */
    list(subscriberListId: string): Promise<Result<HttpResponse<SubscriberList>>>;
    something2(): Promise<void>;
    something3(): Promise<void>;
    private validateDate;
}
interface EmailResponse {
    id: string;
    to: string;
    subject: string;
    status: EmailStatus;
    sentAt?: string;
    deliveredAt?: string;
    openedAt?: string;
    clickedAt?: string;
}
declare enum EmailStatus {
    Queued = "queued",
    Sent = "sent",
    Delivered = "delivered",
    Failed = "failed"
}
interface SendTransactionalOptions {
    /** Recipient email address */
    to: string;
    /** ID of the transactional email template */
    transactionalId: string;
    /** Data to merge into the email template */
    data?: Record<string, unknown>;
    /** Optional file attachments */
    attachments?: Array<{
        fileName: string;
        content: string;
    }>;
}
/**
 * Module for sending emails.
 */
declare class BluefoxEmail extends BluefoxModule {
    constructor(context: BluefoxContext);
    /**
     * Sends a transactional email.
     *
     * @param options - The options for sending the email
     * @returns A promise that resolves to the email details
     *
     * @throws {BluefoxError} If validation fails or the request fails
     *
     * @example
     * ```typescript
     * const result = await client.email.sendTransactional({
     *   to: "john@example.com",
     *   transactionalId: "welcome-email",
     *   data: { name: "John" }
     * });
     * if (result.ok) {
     *   console.log("Email sent:", result.value.data);
     * }
     * ```
     */
    sendTransactional(options: SendTransactionalOptions): Promise<Result<HttpResponse<EmailResponse>>>;
    private validateTransactionalOptions;
}

export { BluefoxClient, type EmailResponse, EmailStatus, type SendTransactionalOptions };
