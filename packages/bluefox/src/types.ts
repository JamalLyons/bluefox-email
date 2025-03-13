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

export interface ValidateWebhookOptions {
  request: Request;
  /** By default the API  */
  apiKeyOverride?: string;
}

/**
 * Enum representing the different types of webhook events
 */
export enum WebhookEventType {
  Sent = "sent",
  Failed = "failed",
  Click = "click",
  Open = "open",
  Bounce = "bounce",
  Complaint = "complaint",
  Subscribe = "subscribe",
  Unsubscribe = "unsubscribe",
  PauseSubscription = "pause-subscription",
  Resubscribe = "resubscribe",
}

/**
 * Interface representing a webhook event
 */
export interface WebhookEvent {
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
export interface HandleWebhookOptions {
  request: Request;
  apiKeyOverride?: string;
  validApiKeys?: string[];
  handlers?: {
    [key in WebhookEventType | string]?: (event: WebhookEvent) => Promise<void>;
  };
}
