/**
 * I made this type from reading the debug logs from testing.
 * Not 100% sure if this is accurate
 */
export interface Subscriber {
  _id: string;
  accountId: string;
  projectId: string;
  subscriberListId: string;
  name: string;
  email: string;
  status: SubscriberStatus;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number; // Version key
  pausedUntil?: string; // Optional, ISO date string
}

export interface SubscriberList {
  items: Subscriber[];
  count: number;
}

export enum SubscriberStatus {
  Active = "active",
  Unsubscribed = "unsubscribed",
  Paused = "paused",
}

/**
 * Response from sending a transactional or triggered email.
 * Based on the Bluefox API response format.
 */
export interface EmailResponse {
  success: boolean;
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

export interface SendTriggeredOptions {
  /** Recipient email address */
  to: string;
  /** ID of the transactional email template */
  triggerId: string;
  /** Data to merge into the email template */
  data?: Record<string, unknown>;
  /** Optional file attachments */
  attachments?: Array<{
    fileName: string;
    content: string;
  }>;
}

export interface ValidateWebhookOptions {
  request: Request;
  /** By default the API  */
  apiKeyOverride?: string;
}
