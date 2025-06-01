# Bluefox Subscriber API

This document explains how to use the Subscriber module in the Bluefox client library to manage subscriber lists.

## Overview

The Subscriber module allows you to programmatically manage subscribers in your Bluefox subscriber lists. You can add new subscribers, remove (unsubscribe) existing ones, pause subscriptions, activate subscribers, and retrieve subscriber information.

## Features

- **Add Subscribers**: Add new subscribers to your lists
- **Remove Subscribers**: Unsubscribe users from your lists
- **Pause Subscriptions**: Temporarily pause subscriptions until a specified date
- **Activate Subscribers**: Re-activate paused or unsubscribed users
- **List Subscribers**: Retrieve all subscribers in a list
- **Get Subscriber Details**: Get information about a specific subscriber
- **Update Subscribers**: Update subscriber information

## Usage Examples

### Initialize the Client

```typescript
import { BluefoxClient } from "bluefox-email";

const client = new BluefoxClient({
  apiKey: "your-api-key",
  debug: true, // Optional: Enable debug logging
});
```

### Add a Subscriber

```typescript
async function addSubscriber() {
  const result = await client.subscriber.add(
    "list-123", // Subscriber list ID
    "John Doe", // Subscriber name
    "john@example.com", // Subscriber email
  );

  if (result.ok) {
    console.log("Subscriber added successfully:", result.value.data);
  } else {
    console.error("Failed to add subscriber:", result.error.message);
  }
}
```

### Remove (Unsubscribe) a Subscriber

```typescript
async function removeSubscriber() {
  const result = await client.subscriber.remove(
    "list-123", // Subscriber list ID
    "john@example.com", // Subscriber email
  );

  if (result.ok) {
    console.log("Subscriber removed successfully:", result.value.data);
  } else {
    console.error("Failed to remove subscriber:", result.error.message);
  }
}
```

### Pause a Subscription

```typescript
async function pauseSubscription() {
  // Pause until 30 days from now
  const pauseUntil = new Date();
  pauseUntil.setDate(pauseUntil.getDate() + 30);

  const result = await client.subscriber.pause(
    "list-123", // Subscriber list ID
    "john@example.com", // Subscriber email
    pauseUntil, // Date until which the subscription should be paused
  );

  if (result.ok) {
    console.log("Subscription paused successfully:", result.value.data);
  } else {
    console.error("Failed to pause subscription:", result.error.message);
  }
}
```

### Activate a Subscriber

```typescript
async function activateSubscriber() {
  const result = await client.subscriber.activate(
    "list-123", // Subscriber list ID
    "john@example.com", // Subscriber email
  );

  if (result.ok) {
    console.log("Subscriber activated successfully:", result.value.data);
  } else {
    console.error("Failed to activate subscriber:", result.error.message);
  }
}
```

### List All Subscribers

```typescript
async function listSubscribers() {
  const result = await client.subscriber.list("list-123");

  if (result.ok) {
    console.log("Total subscribers:", result.value.data.count);
    console.log("Subscribers:", result.value.data.items);
  } else {
    console.error("Failed to list subscribers:", result.error.message);
  }
}
```

### Get a Specific Subscriber

```typescript
async function getSubscriber() {
  const result = await client.subscriber.getOne(
    "list-123", // Subscriber list ID
    "john@example.com", // Subscriber email
  );

  if (result.ok) {
    console.log("Subscriber details:", result.value.data);
  } else {
    console.error("Failed to get subscriber:", result.error.message);
  }
}
```

### Update a Subscriber

```typescript
async function updateSubscriber() {
  const result = await client.subscriber.updateOne(
    "list-123", // Subscriber list ID
    "john@example.com", // Current subscriber email
    "john.doe@example.com", // New email (optional)
    "John A. Doe", // New name (optional)
  );

  if (result.ok) {
    console.log("Subscriber updated successfully:", result.value.data);
  } else {
    console.error("Failed to update subscriber:", result.error.message);
  }
}
```

## Error Handling

The Bluefox client uses a Result type for all API responses, which makes error handling consistent and type-safe:

```typescript
const result = await client.subscriber.add(
  "list-123",
  "John Doe",
  "john@example.com",
);

if (result.ok) {
  // Success case
  const subscriber = result.value.data;
  console.log(`Subscriber added with ID: ${subscriber._id}`);
} else {
  // Error case
  const error = result.error;

  // Handle specific error types
  switch (error.code) {
    case ErrorCode.DUPLICATE_EMAIL:
      console.error("This email is already subscribed to the list");
      break;
    case ErrorCode.VALIDATION_ERROR:
      console.error("Validation error:", error.message);
      break;
    default:
      console.error("An error occurred:", error.message);
  }
}
```

## API Reference

### `add(subscriberListId, name, email)`

Subscribes a new member to the specified subscriber list.

**Parameters:**

- `subscriberListId`: The ID of the subscriber list
- `name`: The subscriber's name
- `email`: The subscriber's email address

**Returns:**

- `Promise<Result<HttpResponse<Subscriber>>>`: A promise that resolves to the subscriber details

### `remove(subscriberListId, email)`

Unsubscribes a member from the specified subscriber list.

**Parameters:**

- `subscriberListId`: The ID of the subscriber list
- `email`: The subscriber's email address

**Returns:**

- `Promise<Result<HttpResponse<Subscriber>>>`: A promise that resolves to the updated subscriber details

### `pause(subscriberListId, email, date)`

Pauses a member's subscription until the specified date.

**Parameters:**

- `subscriberListId`: The ID of the subscriber list
- `email`: The subscriber's email address
- `date`: The date until which the subscription should be paused

**Returns:**

- `Promise<Result<HttpResponse<Subscriber>>>`: A promise that resolves to the updated subscriber details

### `activate(subscriberListId, email)`

Activates a paused or unsubscribed member.

**Parameters:**

- `subscriberListId`: The ID of the subscriber list
- `email`: The subscriber's email address

**Returns:**

- `Promise<Result<HttpResponse<Subscriber>>>`: A promise that resolves to the updated subscriber details

### `list(subscriberListId)`

Lists all subscribers in the specified subscriber list.

**Parameters:**

- `subscriberListId`: The ID of the subscriber list

**Returns:**

- `Promise<Result<HttpResponse<SubscriberList>>>`: A promise that resolves to the subscriber list

### `getOne(subscriberListId, email)`

Gets a specific subscriber from the specified subscriber list.

**Parameters:**

- `subscriberListId`: The ID of the subscriber list
- `email`: The subscriber's email address

**Returns:**

- `Promise<Result<HttpResponse<Subscriber>>>`: A promise that resolves to the subscriber details

### `updateOne(subscriberListId, email, newEmail?, newName?)`

Updates a specific subscriber in the specified subscriber list.

**Parameters:**

- `subscriberListId`: The ID of the subscriber list
- `email`: The subscriber's current email address
- `newEmail`: (Optional) The subscriber's new email address
- `newName`: (Optional) The subscriber's new name

**Returns:**

- `Promise<Result<HttpResponse<Subscriber>>>`: A promise that resolves to the updated subscriber details

## Types

### `Subscriber`

```typescript
interface Subscriber {
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
```

### `SubscriberList`

```typescript
interface SubscriberList {
  items: Subscriber[];
  count: number;
}
```

### `SubscriberStatus`

```typescript
enum SubscriberStatus {
  Active = "active",
  Unsubscribed = "unsubscribed",
  Paused = "paused",
}
```
