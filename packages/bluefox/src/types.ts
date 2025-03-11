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
  status: string; // e.g., "active", "paused"
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
