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
      method: "GET",
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
   *   console.log("Email sent:", result.value.data);
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
        arguments: options.attachments,
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
   *   to: "john@example.com",
   *   triggerId: "payment-reminder",
   *   data: { name: "John" }
   * });
   * if (result.ok) {
   *   console.log("Email sent:", result.value.data);
   * }
   * ```
   */
  public async sendTriggered(options: SendTriggeredOptions) {
    this.logDebug("SendTriggered.Input", options);
    this.validateTriggeredOptions(options);

    const result = await this.request<EmailResponse>({
      path: "send-triggered",
      method: "POST",
      body: {
        email: options.to,
        triggerId: options.triggerId,
        data: options.data,
        arguments: options.attachments,
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
    this.validateEmail(options.to);

    // Validate attachments if present
    if (options.attachments) {
      this.validateAttachments(options.attachments);
    }
  }

  private validateTriggeredOptions(options: SendTriggeredOptions): void {
    this.logDebug("EmailValidation.TriggeredOptions", options);

    // Validate required fields
    this.validateRequiredFields({
      to: options.to,
      triggerId: options.triggerId,
    });

    // Validate email format
    this.validateEmail(options.to);

    // Validate attachments if present
    if (options.attachments) {
      this.validateAttachments(options.attachments);
    }
  }
}

class BluefoxWebhooks extends BluefoxModule {
  constructor(context: BluefoxContext) {
    super(context);
  }

  public async validateWebhook(
    options: ValidateWebhookOptions
  ): Promise<boolean> {
    const API_KEY = options.apiKeyOverride || this.context.config.apiKey;
    this.validateRequiredFields({
      apiKey: API_KEY,
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

    if (API_KEY !== headerApiKey) {
      throw new BluefoxError({
        code: ErrorCode.AUTHENTICATION_ERROR,
        message: "API keys do not match",
        status: 400,
        details: { request: options.request },
      });
    }

    return true;
  }
}
