import { BluefoxModule, BluefoxContext, Result, HttpResponse, BluefoxClientConfig } from '@bluefox-email/api';

interface Subscriber {
    _id: string;
    accountId: string;
    projectId: string;
    subscriberListId: string;
    name: string;
    email: string;
    status: SubscriberStatus;
    createdAt: string;
    updatedAt: string;
    __v: number;
    pausedUntil?: string;
}
interface SubscriberList {
    items: Subscriber[];
    count: number;
}
declare enum SubscriberStatus {
    Active = "active",
    Unsubscribed = "unsubscribed",
    Paused = "paused"
}
/**
 * Response from sending a transactional or triggered email.
 * Based on the Bluefox API response format.
 */
interface EmailResponse {
    success: boolean;
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
interface SendTriggeredOptions {
    /** Recipient email addresses */
    emails: string[];
    /** ID of the triggered email template */
    triggeredId: string;
    /** Data to merge into the email template */
    data?: Record<string, unknown>;
    /** Optional file attachments */
    attachments?: Array<{
        fileName: string;
        content: string;
    }>;
}
interface ValidateWebhookOptions {
    request: Request;
    /** By default the API  */
    apiKeyOverride?: string;
}
/**
 * Enum representing the different types of webhook events
 */
declare enum WebhookEventType {
    Sent = "sent",
    Failed = "failed",
    Click = "click",
    Open = "open",
    Bounce = "bounce",
    Complaint = "complaint",
    Subscribe = "subscribe",
    Unsubscribe = "unsubscribe",
    PauseSubscription = "pause-subscription",
    Resubscribe = "resubscribe"
}
/**
 * Interface representing a webhook event
 */
interface WebhookEvent {
    type: WebhookEventType | string;
    account: {
        name: string;
        urlFriendlyName: string;
        _id?: string;
    };
    project: {
        name: string;
        _id?: string;
    };
    createdAt: string;
    emailData?: {
        _id?: string;
        sentAt: string;
        to: string;
        type: string;
        subject: string;
    };
    userAgent?: string;
    referer?: string;
    ipAddress?: string;
    errors?: any[];
    blockPosition?: string;
    blockName?: string;
    link?: string;
    subscription?: {
        _id: string;
        name: string;
        email: string;
        status: string;
        subscriberList: {
            name: string;
            _id: string;
            private: boolean | string;
        };
    };
}
/**
 * Options for handling webhook events
 */
interface HandleWebhookOptions {
    request: Request;
    apiKeyOverride?: string;
    validApiKeys?: string[];
    handlers?: {
        [key in WebhookEventType | string]?: (event: WebhookEvent) => Promise<void>;
    };
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
     * Module for sending transactional and triggered emails.
     * @see https://bluefox.email/docs/api/send-transactional-email
     */
    readonly email: BluefoxEmail;
    /**
     * Module for managing webhooks.
     * @see https://bluefox.email/docs/integrations/webhooks
     */
    readonly webhooks: BluefoxWebhooks;
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
     * @returns A promise that resolves to the current subscriber list
     *
     * @throws {BluefoxError} If validation fails or the request fails
     */
    list(subscriberListId: string): Promise<Result<HttpResponse<SubscriberList>>>;
    /**
     * Get a single user from a subscriber list
     *
     * @param subscriberListId - The ID of the subscriber list
     * @param email - The subscriber's email address
     * @returns A promise that resolves to the subscriber list user
     *
     * @throws {BluefoxError} If validation fails or the request fails
     */
    getOne(subscriberListId: string, email: string): Promise<Result<HttpResponse<Subscriber>>>;
    /**
     * Update a single user from a subscriber list
     *
     * @param subscriberListId - The ID of the subscriber list
     * @param email - The subscriber's email address
     * @returns  A promise that resolves to the updated subscriber details
     *
     * @throws {BluefoxError} If validation fails or the request fails
     */
    updateOne(subscriberListId: string, email: string, newEmail?: string, newName?: string): Promise<Result<HttpResponse<Subscriber>>>;
    private validateDate;
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
     *   console.log("Email sent successfully:", result.value.data.success);
     * }
     * ```
     */
    sendTransactional(options: SendTransactionalOptions): Promise<Result<HttpResponse<EmailResponse>>>;
    /**
     * Sends a triggered email.
     *
     * @param options - The options for sending the email
     * @returns A promise that resolves to the email details
     *
     * @throws {BluefoxError} If validation fails or the request fails
     *
     * @example
     * ```typescript
     * const result = await client.email.sendTriggered({
     *   emails: ["john@example.com"],
     *   triggeredId: "payment-reminder",
     *   data: { name: "John" }
     * });
     * if (result.ok) {
     *   console.log("Email sent successfully:", result.value.data.success);
     * }
     * ```
     */
    sendTriggered(options: SendTriggeredOptions): Promise<Result<HttpResponse<EmailResponse>>>;
    private validateTransactionalOptions;
    private validateTriggeredOptions;
}
declare class BluefoxWebhooks extends BluefoxModule {
    constructor(context: BluefoxContext);
    /**
     * Validates a webhook request by checking the API key in the Authorization header
     *
     * @param options - Options for validating the webhook
     * @returns A promise that resolves to true if the webhook is valid
     *
     * @throws {BluefoxError} If validation fails
     *
     * @example
     * ```typescript
     * const isValid = await client.webhooks.validateWebhook({
     *   request: req,
     *   validApiKeys: ['primary-key', 'secondary-key'] // Support for key rotation
     * });
     * ```
     */
    validateWebhook(options: ValidateWebhookOptions & {
        validApiKeys?: string[];
    }): Promise<boolean>;
    /**
     * Parses a webhook request into a WebhookEvent object
     *
     * @param request - The webhook request
     * @returns A promise that resolves to the parsed webhook event
     *
     * @throws {BluefoxError} If parsing fails
     *
     * @example
     * ```typescript
     * const event = await client.webhooks.parseWebhookEvent(req);
     * console.log(`Received ${event.type} event`);
     * ```
     */
    parseWebhookEvent(request: Request): Promise<WebhookEvent>;
    /**
     * Handles a webhook request by validating it, parsing the event, and calling the appropriate handler
     *
     * @param options - Options for handling the webhook
     * @returns A promise that resolves to the parsed webhook event
     *
     * @throws {BluefoxError} If validation or parsing fails
     *
     * @example
     * ```typescript
     * const event = await client.webhooks.handleWebhook({
     *   request: req,
     *   handlers: {
     *     [WebhookEventType.Open]: async (event) => {
     *       console.log(`Email opened by ${event.emailData?.to}`);
     *     },
     *     [WebhookEventType.Click]: async (event) => {
     *       console.log(`Link clicked: ${event.link}`);
     *     }
     *   }
     * });
     * ```
     */
    handleWebhook(options: HandleWebhookOptions): Promise<WebhookEvent>;
    /**
     * Checks if the event is an email-related event (sent, failed, click, open, bounce, complaint)
     *
     * @param event - The webhook event to check
     * @returns True if the event is an email-related event
     *
     * @example
     * ```typescript
     * const event = await client.webhooks.parseWebhookEvent(req);
     * if (client.webhooks.isEmailEvent(event)) {
     *   console.log(`Email event for ${event.emailData?.to}`);
     * }
     * ```
     */
    isEmailEvent(event: WebhookEvent): boolean;
    /**
     * Checks if the event is a subscription-related event (subscribe, unsubscribe, pause-subscription, resubscribe)
     *
     * @param event - The webhook event to check
     * @returns True if the event is a subscription-related event
     *
     * @example
     * ```typescript
     * const event = await client.webhooks.parseWebhookEvent(req);
     * if (client.webhooks.isSubscriptionEvent(event)) {
     *   console.log(`Subscription event for ${event.subscription?.email}`);
     * }
     * ```
     */
    isSubscriptionEvent(event: WebhookEvent): boolean;
    /**
     * Type guard for sent events
     *
     * @param event - The webhook event to check
     * @returns True if the event is a sent event
     *
     * @example
     * ```typescript
     * const event = await client.webhooks.parseWebhookEvent(req);
     * if (client.webhooks.isSentEvent(event)) {
     *   console.log(`Email sent to ${event.emailData?.to} at ${event.emailData?.sentAt}`);
     * }
     * ```
     */
    isSentEvent(event: WebhookEvent): event is WebhookEvent & {
        type: WebhookEventType.Sent;
    };
    /**
     * Type guard for failed events
     *
     * @param event - The webhook event to check
     * @returns True if the event is a failed event
     */
    isFailedEvent(event: WebhookEvent): event is WebhookEvent & {
        type: WebhookEventType.Failed;
        errors: any[];
    };
    /**
     * Type guard for click events
     *
     * @param event - The webhook event to check
     * @returns True if the event is a click event
     */
    isClickEvent(event: WebhookEvent): event is WebhookEvent & {
        type: WebhookEventType.Click;
        link: string;
        blockPosition?: string;
        blockName?: string;
    };
    /**
     * Type guard for open events
     *
     * @param event - The webhook event to check
     * @returns True if the event is an open event
     */
    isOpenEvent(event: WebhookEvent): event is WebhookEvent & {
        type: WebhookEventType.Open;
    };
    /**
     * Type guard for bounce events
     *
     * @param event - The webhook event to check
     * @returns True if the event is a bounce event
     */
    isBounceEvent(event: WebhookEvent): event is WebhookEvent & {
        type: WebhookEventType.Bounce;
    };
    /**
     * Type guard for complaint events
     *
     * @param event - The webhook event to check
     * @returns True if the event is a complaint event
     */
    isComplaintEvent(event: WebhookEvent): event is WebhookEvent & {
        type: WebhookEventType.Complaint;
    };
    /**
     * Type guard for subscription events
     *
     * @param event - The webhook event to check
     * @returns True if the event is a subscription event
     */
    isSubscribeEvent(event: WebhookEvent): event is WebhookEvent & {
        type: WebhookEventType.Subscribe;
        subscription: NonNullable<WebhookEvent["subscription"]>;
    };
    /**
     * Type guard for unsubscribe events
     *
     * @param event - The webhook event to check
     * @returns True if the event is an unsubscribe event
     */
    isUnsubscribeEvent(event: WebhookEvent): event is WebhookEvent & {
        type: WebhookEventType.Unsubscribe;
        subscription: NonNullable<WebhookEvent["subscription"]>;
    };
    /**
     * Type guard for pause subscription events
     *
     * @param event - The webhook event to check
     * @returns True if the event is a pause subscription event
     */
    isPauseSubscriptionEvent(event: WebhookEvent): event is WebhookEvent & {
        type: WebhookEventType.PauseSubscription;
        subscription: NonNullable<WebhookEvent["subscription"]>;
    };
    /**
     * Type guard for resubscribe events
     *
     * @param event - The webhook event to check
     * @returns True if the event is a resubscribe event
     */
    isResubscribeEvent(event: WebhookEvent): event is WebhookEvent & {
        type: WebhookEventType.Resubscribe;
        subscription: NonNullable<WebhookEvent["subscription"]>;
    };
    /**
     * Tests a webhook by sending a test event to the specified URL
     *
     * @param webhookUrl - The URL to send the test event to
     * @param eventType - The type of event to send
     * @param customData - Custom data to include in the event
     * @returns A promise that resolves to the response from the webhook URL
     *
     * @throws {BluefoxError} If the request fails
     *
     * @example
     * ```typescript
     * const result = await client.webhooks.testWebhook(
     *   'https://example.com/webhooks/bluefox',
     *   WebhookEventType.Open,
     *   { emailData: { to: 'test@example.com' } }
     * );
     * if (result.ok) {
     *   console.log('Test webhook sent successfully');
     * }
     * ```
     */
    testWebhook(webhookUrl: string, eventType: WebhookEventType | string, customData?: Partial<WebhookEvent>): Promise<Result<HttpResponse<any>>>;
}

export { BluefoxClient };
