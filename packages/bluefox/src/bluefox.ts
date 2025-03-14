import {
  BluefoxModule,
  BluefoxContext,
  Result,
  HttpResponse,
  RateLimiter,
  BluefoxError,
  BluefoxEndpoints,
  BluefoxClientConfig,
  ErrorCode,
} from "@bluefox-email/api";
import {
  EmailResponse,
  SendTransactionalOptions,
  SendTriggeredOptions,
  Subscriber,
  SubscriberList,
  SubscriberStatus,
  ValidateWebhookOptions,
  WebhookEvent,
  WebhookEventType,
  HandleWebhookOptions,
} from "./types.js";

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
export class BluefoxClient extends BluefoxModule {
  /**
   * Module for managing subscribers.
   * @see https://bluefox.email/docs/api/subscriber-list-management
   */
  public readonly subscriber: BluefoxSubscriber;

  /**
   * Module for sending transactional and triggered emails.
   * @see https://bluefox.email/docs/api/send-transactional-email
   */
  public readonly email: BluefoxEmail;

  /**
   * Module for managing webhooks.
   * @see https://bluefox.email/docs/integrations/webhooks
   */
  public readonly webhooks: BluefoxWebhooks;

  constructor(config: BluefoxClientConfig) {
    const context: BluefoxContext = {
      config,
      baseUrl: config.baseUrl || "https://api.bluefox.email/v1",
      rateLimiter: new RateLimiter(),
    };

    super(context);

    this.subscriber = new BluefoxSubscriber(context);
    this.email = new BluefoxEmail(context);
    this.webhooks = new BluefoxWebhooks(context);
  }
}

/**
 * Module for managing subscribers.
 */
class BluefoxSubscriber extends BluefoxModule {
  constructor(context: BluefoxContext) {
    super(context);
  }

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
  public async add(
    subscriberListId: string,
    name: string,
    email: string
  ): Promise<Result<HttpResponse<Subscriber>>> {
    this.logDebug("SubscriberAdd.Input", { subscriberListId, name, email });
    this.validateRequiredFields({ subscriberListId, name, email });
    this.validateEmail(email);

    const result = await this.request<Subscriber>({
      path: `${BluefoxEndpoints.subscriberLists}/${subscriberListId}`,
      method: "POST",
      body: { name, email },
    });

    this.logDebug("SubscriberAdd.Result", result);
    return result;
  }

  /**
   * Unsubscribes a member from the specified subscriber list.
   *
   * @param subscriberListId - The ID of the subscriber list
   * @param email - The subscriber's email address
   * @returns A promise that resolves to the updated subscriber details
   *
   * @throws {BluefoxError} If validation fails or the request fails
   */
  public async remove(
    subscriberListId: string,
    email: string
  ): Promise<Result<HttpResponse<Subscriber>>> {
    this.logDebug("SubscriberRemove.Input", { subscriberListId, email });
    this.validateRequiredFields({ subscriberListId, email });
    this.validateEmail(email);

    const result = await this.request<Subscriber>({
      path: `${BluefoxEndpoints.subscriberLists}/${subscriberListId}/${email}`,
      method: "PATCH",
      body: { status: SubscriberStatus.Unsubscribed },
    });

    this.logDebug("SubscriberRemove.Result", result);
    return result;
  }

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
  public async pause(
    subscriberListId: string,
    email: string,
    date: Date
  ): Promise<Result<HttpResponse<Subscriber>>> {
    this.logDebug("SubscriberPause.Input", { subscriberListId, email, date });
    this.validateRequiredFields({ subscriberListId, email });
    this.validateEmail(email);
    this.validateDate(date);

    const result = await this.request<Subscriber>({
      path: `${BluefoxEndpoints.subscriberLists}/${subscriberListId}/${email}`,
      method: "PATCH",
      body: {
        status: SubscriberStatus.Paused,
        pausedUntil: date.toISOString(),
      },
    });

    this.logDebug("SubscriberPause.Result", result);
    return result;
  }

  /**
   * Activates a paused or unsubscribed member.
   *
   * @param subscriberListId - The ID of the subscriber list
   * @param email - The subscriber's email address
   * @returns A promise that resolves to the updated subscriber details
   *
   * @throws {BluefoxError} If validation fails or the request fails
   */
  public async activate(
    subscriberListId: string,
    email: string
  ): Promise<Result<HttpResponse<Subscriber>>> {
    this.logDebug("SubscriberActivate.Input", { subscriberListId, email });
    this.validateRequiredFields({ subscriberListId, email });
    this.validateEmail(email);

    const result = await this.request<Subscriber>({
      path: `${BluefoxEndpoints.subscriberLists}/${subscriberListId}/${email}`,
      method: "PATCH",
      body: { status: SubscriberStatus.Active },
    });

    this.logDebug("SubscriberActivate.Result", result);
    return result;
  }

  /**
   * List users on a subscriber list.
   *
   * @param subscriberListId - The ID of the subscriber list
   * @returns A promise that resolves to the current subscriber list
   *
   * @throws {BluefoxError} If validation fails or the request fails
   */
  public async list(
    subscriberListId: string
  ): Promise<Result<HttpResponse<SubscriberList>>> {
    this.logDebug("SubscriberList.input", { subscriberListId });
    this.validateRequiredFields({ subscriberListId });

    const result = await this.request<SubscriberList>({
      path: `${BluefoxEndpoints.subscriberLists}/${subscriberListId}`,
      method: "GET",
    });

    this.logDebug("SubscriberList.Result", result);
    return result;
  }

  /**
   * Get a single user from a subscriber list
   *
   * @param subscriberListId - The ID of the subscriber list
   * @param email - The subscriber's email address
   * @returns A promise that resolves to the subscriber list user
   *
   * @throws {BluefoxError} If validation fails or the request fails
   */
  public async getOne(
    subscriberListId: string,
    email: string
  ): Promise<Result<HttpResponse<Subscriber>>> {
    this.logDebug("SubscriberGetOne.input", { subscriberListId, email });
    this.validateRequiredFields({ subscriberListId, email });

    const result = await this.request<Subscriber>({
      path: `${BluefoxEndpoints.subscriberLists}/${subscriberListId}/${email}`,
      method: "GET",
    });

    this.logDebug("SubscriberGetOne.Result", result);
    return result;
  }

  /**
   * Update a single user from a subscriber list
   *
   * @param subscriberListId - The ID of the subscriber list
   * @param email - The subscriber's email address
   * @returns  A promise that resolves to the updated subscriber details
   *
   * @throws {BluefoxError} If validation fails or the request fails
   */
  public async updateOne(
    subscriberListId: string,
    email: string,
    newEmail?: string,
    newName?: string
  ): Promise<Result<HttpResponse<Subscriber>>> {
    this.logDebug("SubscriberUpdateOne.input", {
      subscriberListId,
      email,
      newEmail,
      newName,
    });
    this.validateRequiredFields({ subscriberListId, email });

    // Only update fields the user wants.
    // Im not sure if undefined props will delete old data...need to ask bluefox team
    let body: any = {};
    if (newEmail) {
      body.email = newEmail;
    }
    if (newName) {
      body.name = newName;
    }

    const result = await this.request<Subscriber>({
      path: `${BluefoxEndpoints.subscriberLists}/${subscriberListId}/${email}`,
      method: "PATCH",
      body,
    });

    this.logDebug("SubscriberUpdateOne.Result", result);
    return result;
  }

  private validateDate(date: Date): void {
    this.logDebug("SubscriberValidation.Date", { date });
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      const error = BluefoxError.validation("Invalid date format");
      this.logError("SubscriberValidation.Date", error);
      throw error;
    }

    if (date < new Date()) {
      const error = BluefoxError.validation("Pause date must be in the future");
      this.logError("SubscriberValidation.Date", error);
      throw error;
    }
  }
}

/**
 * Module for sending emails.
 */
class BluefoxEmail extends BluefoxModule {
  constructor(context: BluefoxContext) {
    super(context);
  }

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
  public async sendTransactional(
    options: SendTransactionalOptions
  ): Promise<Result<HttpResponse<EmailResponse>>> {
    this.logDebug("SendTransactional.Input", options);
    this.validateTransactionalOptions(options);

    const result = await this.request<EmailResponse>({
      path: "send-transactional",
      method: "POST",
      body: {
        email: options.to,
        transactionalId: options.transactionalId,
        data: options.data,
        attachments: options.attachments,
      },
    });

    this.logDebug("SendTransactional.Result", result);
    return result;
  }

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
  public async sendTriggered(
    options: SendTriggeredOptions
  ): Promise<Result<HttpResponse<EmailResponse>>> {
    this.logDebug("SendTriggered.Input", options);
    this.validateTriggeredOptions(options);

    const result = await this.request<EmailResponse>({
      path: "send-triggered",
      method: "POST",
      body: {
        emails: options.emails,
        triggeredId: options.triggeredId,
        data: options.data,
        attachments: options.attachments,
      },
    });

    this.logDebug("SendTriggered.Result", result);
    return result;
  }

  private validateTransactionalOptions(
    options: SendTransactionalOptions
  ): void {
    this.logDebug("EmailValidation.TransactionalOptions", options);

    // Validate required fields
    this.validateRequiredFields({
      to: options.to,
      transactionalId: options.transactionalId,
    });

    // Validate email format
    try {
      this.validateEmail(options.to);
    } catch (error) {
      this.logError("EmailValidation.TransactionalOptions.Email", error);
      throw error;
    }

    // Validate attachments if present
    if (options.attachments) {
      try {
        this.validateAttachments(options.attachments);
      } catch (error) {
        this.logError(
          "EmailValidation.TransactionalOptions.Attachments",
          error
        );
        throw error;
      }
    }
  }

  private validateTriggeredOptions(options: SendTriggeredOptions): void {
    this.logDebug("EmailValidation.TriggeredOptions", options);

    // Validate required fields
    this.validateRequiredFields({
      emails: options.emails,
      triggeredId: options.triggeredId,
    });

    // Validate that emails is an array and not empty
    if (!Array.isArray(options.emails) || options.emails.length === 0) {
      const error = BluefoxError.validation("Emails must be a non-empty array");
      this.logError("EmailValidation.TriggeredOptions.Emails", error);
      throw error;
    }

    // Validate email format for each email
    try {
      options.emails.forEach((email) => {
        this.validateEmail(email);
      });
    } catch (error) {
      this.logError("EmailValidation.TriggeredOptions.Email", error);
      throw error;
    }

    // Validate attachments if present
    if (options.attachments) {
      try {
        this.validateAttachments(options.attachments);
      } catch (error) {
        this.logError("EmailValidation.TriggeredOptions.Attachments", error);
        throw error;
      }
    }
  }
}

class BluefoxWebhooks extends BluefoxModule {
  constructor(context: BluefoxContext) {
    super(context);
  }

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
  public async validateWebhook(
    options: ValidateWebhookOptions & { validApiKeys?: string[] }
  ): Promise<boolean> {
    const primaryApiKey = options.apiKeyOverride || this.context.config.apiKey;
    const validApiKeys = options.validApiKeys || [primaryApiKey];

    this.validateRequiredFields({
      apiKey: primaryApiKey,
      request: options.request,
    });

    const headerApiKey = options.request.headers
      .get("Authorization")
      ?.split(" ")[1]; // Removing "Bearer " prefix

    if (!headerApiKey) {
      throw new BluefoxError({
        code: ErrorCode.SERVER_ERROR,
        message: "No API key found in request headers",
        status: 400,
        details: { request: options.request },
      });
    }

    if (!validApiKeys.includes(headerApiKey)) {
      throw new BluefoxError({
        code: ErrorCode.AUTHENTICATION_ERROR,
        message: "Invalid API key",
        status: 400,
        details: { request: options.request },
      });
    }

    return true;
  }

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
  public async parseWebhookEvent(request: Request): Promise<WebhookEvent> {
    try {
      const event = (await request.json()) as WebhookEvent;
      this.logDebug("WebhookEvent.Parsed", event);
      return event;
    } catch (error) {
      this.logError("WebhookEvent.ParseError", error);
      throw new BluefoxError({
        code: ErrorCode.SERVER_ERROR,
        message: "Failed to parse webhook event",
        status: 400,
        details: { error },
      });
    }
  }

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
  public async handleWebhook(
    options: HandleWebhookOptions
  ): Promise<WebhookEvent> {
    this.logDebug("WebhookHandler.Input", options);

    // Validate the webhook first
    await this.validateWebhook({
      request: options.request,
      apiKeyOverride: options.apiKeyOverride,
      validApiKeys: options.validApiKeys,
    });

    // Parse the event
    const event = await this.parseWebhookEvent(options.request);

    // Call the appropriate handler if provided
    if (options.handlers && options.handlers[event.type]) {
      try {
        await options.handlers[event.type]!(event);
      } catch (error) {
        this.logError("WebhookHandler.HandlerError", error);
        // We don't throw here to ensure the webhook is acknowledged
      }
    }

    return event;
  }

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
  public isEmailEvent(event: WebhookEvent): boolean {
    return [
      WebhookEventType.Sent,
      WebhookEventType.Failed,
      WebhookEventType.Click,
      WebhookEventType.Open,
      WebhookEventType.Bounce,
      WebhookEventType.Complaint,
    ].includes(event.type as WebhookEventType);
  }

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
  public isSubscriptionEvent(event: WebhookEvent): boolean {
    return [
      WebhookEventType.Subscribe,
      WebhookEventType.Unsubscribe,
      WebhookEventType.PauseSubscription,
      WebhookEventType.Resubscribe,
    ].includes(event.type as WebhookEventType);
  }

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
  public isSentEvent(
    event: WebhookEvent
  ): event is WebhookEvent & { type: WebhookEventType.Sent } {
    return event.type === WebhookEventType.Sent;
  }

  /**
   * Type guard for failed events
   *
   * @param event - The webhook event to check
   * @returns True if the event is a failed event
   */
  public isFailedEvent(event: WebhookEvent): event is WebhookEvent & {
    type: WebhookEventType.Failed;
    errors: any[];
  } {
    return event.type === WebhookEventType.Failed;
  }

  /**
   * Type guard for click events
   *
   * @param event - The webhook event to check
   * @returns True if the event is a click event
   */
  public isClickEvent(event: WebhookEvent): event is WebhookEvent & {
    type: WebhookEventType.Click;
    link: string;
    blockPosition?: string;
    blockName?: string;
  } {
    return event.type === WebhookEventType.Click;
  }

  /**
   * Type guard for open events
   *
   * @param event - The webhook event to check
   * @returns True if the event is an open event
   */
  public isOpenEvent(event: WebhookEvent): event is WebhookEvent & {
    type: WebhookEventType.Open;
  } {
    return event.type === WebhookEventType.Open;
  }

  /**
   * Type guard for bounce events
   *
   * @param event - The webhook event to check
   * @returns True if the event is a bounce event
   */
  public isBounceEvent(event: WebhookEvent): event is WebhookEvent & {
    type: WebhookEventType.Bounce;
  } {
    return event.type === WebhookEventType.Bounce;
  }

  /**
   * Type guard for complaint events
   *
   * @param event - The webhook event to check
   * @returns True if the event is a complaint event
   */
  public isComplaintEvent(event: WebhookEvent): event is WebhookEvent & {
    type: WebhookEventType.Complaint;
  } {
    return event.type === WebhookEventType.Complaint;
  }

  /**
   * Type guard for subscription events
   *
   * @param event - The webhook event to check
   * @returns True if the event is a subscription event
   */
  public isSubscribeEvent(event: WebhookEvent): event is WebhookEvent & {
    type: WebhookEventType.Subscribe;
    subscription: NonNullable<WebhookEvent["subscription"]>;
  } {
    return event.type === WebhookEventType.Subscribe;
  }

  /**
   * Type guard for unsubscribe events
   *
   * @param event - The webhook event to check
   * @returns True if the event is an unsubscribe event
   */
  public isUnsubscribeEvent(event: WebhookEvent): event is WebhookEvent & {
    type: WebhookEventType.Unsubscribe;
    subscription: NonNullable<WebhookEvent["subscription"]>;
  } {
    return event.type === WebhookEventType.Unsubscribe;
  }

  /**
   * Type guard for pause subscription events
   *
   * @param event - The webhook event to check
   * @returns True if the event is a pause subscription event
   */
  public isPauseSubscriptionEvent(
    event: WebhookEvent
  ): event is WebhookEvent & {
    type: WebhookEventType.PauseSubscription;
    subscription: NonNullable<WebhookEvent["subscription"]>;
  } {
    return event.type === WebhookEventType.PauseSubscription;
  }

  /**
   * Type guard for resubscribe events
   *
   * @param event - The webhook event to check
   * @returns True if the event is a resubscribe event
   */
  public isResubscribeEvent(event: WebhookEvent): event is WebhookEvent & {
    type: WebhookEventType.Resubscribe;
    subscription: NonNullable<WebhookEvent["subscription"]>;
  } {
    return event.type === WebhookEventType.Resubscribe;
  }
}
