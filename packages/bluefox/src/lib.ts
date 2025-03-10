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

// Response Types
export interface SubscriberResponse {
  id: string;
  email: string;
  name: string;
  status: SubscriberStatus;
  pausedUntil?: string;
  createdAt: string;
  updatedAt: string;
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

// Enums
export enum SubscriberStatus {
  Active = "active",
  Unsubscribed = "unsubscribed",
  Paused = "paused",
}

export enum EmailStatus {
  Queued = "queued",
  Sent = "sent",
  Delivered = "delivered",
  Failed = "failed",
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

/**
 * Module for managing subscribers.
 * @internal
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
  ): Promise<Result<HttpResponse<SubscriberResponse>>> {
    // Validate inputs
    this.validateRequiredFields({ subscriberListId, name, email });
    this.validateEmail(email);

    return await this.request({
      path: `${BluefoxEndpoints.subscriberLists}/${subscriberListId}`,
      method: "POST",
      body: { name, email },
    });
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
  ): Promise<Result<HttpResponse<SubscriberResponse>>> {
    this.validateRequiredFields({ subscriberListId, email });
    this.validateEmail(email);

    return await this.request({
      path: `${BluefoxEndpoints.subscriberLists}/${subscriberListId}/${email}`,
      method: "PATCH",
      body: { status: SubscriberStatus.Unsubscribed },
    });
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
  ): Promise<Result<HttpResponse<SubscriberResponse>>> {
    this.validateRequiredFields({ subscriberListId, email });
    this.validateEmail(email);
    this.validateDate(date);

    return await this.request({
      path: `${BluefoxEndpoints.subscriberLists}/${subscriberListId}/${email}`,
      method: "PATCH",
      body: {
        status: SubscriberStatus.Paused,
        pausedUntil: date.toISOString(),
      },
    });
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
  ): Promise<Result<HttpResponse<SubscriberResponse>>> {
    this.validateRequiredFields({ subscriberListId, email });
    this.validateEmail(email);

    return await this.request({
      path: `${BluefoxEndpoints.subscriberLists}/${subscriberListId}/${email}`,
      method: "PATCH",
      body: { status: SubscriberStatus.Active },
    });
  }

  private validateRequiredFields(fields: Record<string, unknown>): void {
    const missingFields = Object.entries(fields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      throw BluefoxError.validation(
        `Missing required fields: ${missingFields.join(", ")}`
      );
    }
  }

  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw BluefoxError.validation("Invalid email address format");
    }
  }

  private validateDate(date: Date): void {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw BluefoxError.validation("Invalid date format");
    }

    if (date < new Date()) {
      throw BluefoxError.validation("Pause date must be in the future");
    }
  }
}

/**
 * Options for sending a transactional email
 */
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
 * @internal
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
    this.validateTransactionalOptions(options);

    return await this.request({
      path: "send-transactional",
      method: "POST",
      body: options,
    });
  }

  private validateTransactionalOptions(
    options: SendTransactionalOptions
  ): void {
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
    const missingFields = Object.entries(fields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      throw BluefoxError.validation(
        `Missing required fields: ${missingFields.join(", ")}`
      );
    }
  }

  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw BluefoxError.validation("Invalid email address format");
    }
  }

  private validateAttachments(
    attachments: Array<{ fileName: string; content: string }>
  ): void {
    if (!Array.isArray(attachments)) {
      throw BluefoxError.validation("Attachments must be an array");
    }

    attachments.forEach((attachment, index) => {
      if (!attachment.fileName) {
        throw BluefoxError.validation(
          `Missing fileName for attachment at index ${index}`
        );
      }
      if (!attachment.content) {
        throw BluefoxError.validation(
          `Missing content for attachment at index ${index}`
        );
      }
      try {
        atob(attachment.content);
      } catch {
        throw BluefoxError.validation(
          `Invalid base64 content for attachment ${attachment.fileName}`
        );
      }
    });
  }
}
