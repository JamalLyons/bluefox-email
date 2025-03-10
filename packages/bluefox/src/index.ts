import {
  BluefoxModule,
  BluefoxContext,
  Result,
  HttpResponse,
  RateLimiter,
  BluefoxError,
  BluefoxEndpoints,
  BluefoxClientConfig,
} from "@bluefox-email/api";

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
   * Module for sending emails.
   * @see https://bluefox.email/docs/api/send-transactional-email
   */
  public readonly email: BluefoxEmail;

  constructor(config: BluefoxClientConfig) {
    const context: BluefoxContext = {
      config,
      baseUrl: config.baseUrl || "https://api.bluefox.email/v1",
      rateLimiter: new RateLimiter(),
    };

    super(context);

    this.subscriber = new BluefoxSubscriber(context);
    this.email = new BluefoxEmail(context);
  }
}

export interface SubscriberResponse {
  id: string;
  email: string;
  name: string;
  status: SubscriberStatus;
  pausedUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export enum SubscriberStatus {
  Active = "active",
  Unsubscribed = "unsubscribed",
  Paused = "paused",
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
    email: string,
  ): Promise<Result<HttpResponse<SubscriberResponse>>> {
    this.logDebug("SubscriberAdd.Input", { subscriberListId, name, email });
    this.validateRequiredFields({ subscriberListId, name, email });
    this.validateEmail(email);

    const result = await this.request<SubscriberResponse>({
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
    email: string,
  ): Promise<Result<HttpResponse<SubscriberResponse>>> {
    this.logDebug("SubscriberRemove.Input", { subscriberListId, email });
    this.validateRequiredFields({ subscriberListId, email });
    this.validateEmail(email);

    const result = await this.request<SubscriberResponse>({
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
    date: Date,
  ): Promise<Result<HttpResponse<SubscriberResponse>>> {
    this.logDebug("SubscriberPause.Input", { subscriberListId, email, date });
    this.validateRequiredFields({ subscriberListId, email });
    this.validateEmail(email);
    this.validateDate(date);

    const result = await this.request<SubscriberResponse>({
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
    email: string,
  ): Promise<Result<HttpResponse<SubscriberResponse>>> {
    this.logDebug("SubscriberActivate.Input", { subscriberListId, email });
    this.validateRequiredFields({ subscriberListId, email });
    this.validateEmail(email);

    const result = await this.request<SubscriberResponse>({
      path: `${BluefoxEndpoints.subscriberLists}/${subscriberListId}/${email}`,
      method: "PATCH",
      body: { status: SubscriberStatus.Active },
    });

    this.logDebug("SubscriberActivate.Result", result);
    return result;
  }

  private validateRequiredFields(fields: Record<string, unknown>): void {
    this.logDebug("SubscriberValidation.RequiredFields", fields);
    const missingFields = Object.entries(fields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      const error = BluefoxError.validation(
        `Missing required fields: ${missingFields.join(", ")}`,
      );
      this.logError("SubscriberValidation.RequiredFields", error);
      throw error;
    }
  }

  private validateEmail(email: string): void {
    this.logDebug("SubscriberValidation.Email", { email });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error = BluefoxError.validation("Invalid email address format");
      this.logError("SubscriberValidation.Email", error);
      throw error;
    }
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

export interface EmailResponse {
  id: string;
  to: string;
  subject: string;
  status: EmailStatus;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
}

export enum EmailStatus {
  Queued = "queued",
  Sent = "sent",
  Delivered = "delivered",
  Failed = "failed",
}

export interface SendTransactionalOptions {
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
    options: SendTransactionalOptions,
  ): Promise<Result<HttpResponse<EmailResponse>>> {
    this.logDebug("SendTransactional.Input", options);
    this.validateTransactionalOptions(options);

    const result = await this.request<EmailResponse>({
      path: "send-transactional",
      method: "POST",
      body: options,
    });

    this.logDebug("SendTransactional.Result", result);
    return result;
  }

  private validateTransactionalOptions(
    options: SendTransactionalOptions,
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

  private validateRequiredFields(fields: Record<string, unknown>): void {
    this.logDebug("EmailValidation.RequiredFields", fields);
    const missingFields = Object.entries(fields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      const error = BluefoxError.validation(
        `Missing required fields: ${missingFields.join(", ")}`,
      );
      this.logError("EmailValidation.RequiredFields", error);
      throw error;
    }
  }

  private validateEmail(email: string): void {
    this.logDebug("EmailValidation.Email", { email });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error = BluefoxError.validation("Invalid email address format");
      this.logError("EmailValidation.Email", error);
      throw error;
    }
  }

  private validateAttachments(
    attachments: Array<{ fileName: string; content: string }>,
  ): void {
    this.logDebug("EmailValidation.Attachments", {
      count: attachments.length,
      fileNames: attachments.map((a) => a.fileName),
    });

    if (!Array.isArray(attachments)) {
      const error = BluefoxError.validation("Attachments must be an array");
      this.logError("EmailValidation.Attachments", error);
      throw error;
    }

    attachments.forEach((attachment, index) => {
      if (!attachment.fileName) {
        const error = BluefoxError.validation(
          `Missing fileName for attachment at index ${index}`,
        );
        this.logError("EmailValidation.Attachments", error);
        throw error;
      }
      if (!attachment.content) {
        const error = BluefoxError.validation(
          `Missing content for attachment at index ${index}`,
        );
        this.logError("EmailValidation.Attachments", error);
        throw error;
      }
      try {
        atob(attachment.content);
      } catch {
        const error = BluefoxError.validation(
          `Invalid base64 content for attachment ${attachment.fileName}`,
        );
        this.logError("EmailValidation.Attachments", error);
        throw error;
      }
    });
  }
}
