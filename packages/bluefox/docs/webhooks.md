# Bluefox Webhooks

This document explains how to use the enhanced webhook functionality in the Bluefox client library.

## Overview

Webhooks allow your application to receive real-time notifications about email events such as opens, clicks, bounces, complaints, and subscriptions. The Bluefox client library provides several utilities to make it easier to handle these webhook events.

## Features

- **API Key Rotation Support**: Validate webhooks against multiple API keys for zero-downtime rotation
- **Type-Safe Event Handling**: TypeScript interfaces and type guards for all webhook event types
- **Event Handlers**: Register handlers for specific event types
- **Testing Utilities**: Test your webhook endpoints with simulated events

## Webhook Event Types

The following webhook event types are supported:

- `sent`: Email was sent successfully
- `failed`: Email failed to send
- `click`: Recipient clicked a link in the email
- `open`: Recipient opened the email
- `bounce`: Email bounced (could not be delivered)
- `complaint`: Recipient marked the email as spam
- `subscribe`: User subscribed to a list
- `unsubscribe`: User unsubscribed from a list
- `pause-subscription`: User paused their subscription
- `resubscribe`: User resubscribed to a list

## Usage Examples

### Basic Webhook Validation

```typescript
import { BluefoxClient } from "bluefox-email";

const client = new BluefoxClient({
  apiKey: "your-api-key",
});

// In your webhook handler
async function handleWebhook(request: Request) {
  try {
    // Validate the webhook
    await client.webhooks.validateWebhook({
      request,
      rotationApiKeys: ["primary-key", "secondary-key"], // Support for key rotation
    });

    // Parse the event
    const event = await client.webhooks.parseWebhookEvent(request);

    console.log(`Received ${event.type} event`);

    // Process the event...

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Invalid webhook:", error);
    return new Response("Invalid webhook", { status: 400 });
  }
}
```

### Using Event Handlers

```typescript
import { BluefoxClient, WebhookEventType } from "bluefox-email";

const client = new BluefoxClient({
  apiKey: "your-api-key",
});

// In your webhook handler
async function handleWebhook(request: Request) {
  try {
    // Handle the webhook with specific handlers for each event type
    await client.webhooks.handleWebhook({
      request,
      rotationApiKeys: ["primary-key", "secondary-key"],
      handlers: {
        [WebhookEventType.Open]: async (event) => {
          console.log(`Email opened by ${event.emailData?.to}`);
          // Track opens in your analytics system
        },
        [WebhookEventType.Click]: async (event) => {
          console.log(`Link clicked: ${event.link}`);
          // Track clicks in your analytics system
        },
      },
    });

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Invalid webhook:", error);
    return new Response("Invalid webhook", { status: 400 });
  }
}
```

### Using Type Guards

```typescript
import { BluefoxClient } from "bluefox-email";

const client = new BluefoxClient({
  apiKey: "your-api-key",
});

// In your webhook handler
async function handleWebhook(request: Request) {
  try {
    // Validate the webhook
    await client.webhooks.validateWebhook({ request });

    // Parse the event
    const event = await client.webhooks.parseWebhookEvent(request);

    // Use type guards to handle different event types
    if (client.webhooks.isClickEvent(event)) {
      console.log(`Link clicked: ${event.link}`);
      console.log(`Block: ${event.blockName || "Unknown"}`);
    } else if (client.webhooks.isOpenEvent(event)) {
      console.log(`Email opened by ${event.emailData?.to}`);
    } else if (client.webhooks.isSubscriptionEvent(event)) {
      console.log(`Subscription event for ${event.subscription?.email}`);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Invalid webhook:", error);
    return new Response("Invalid webhook", { status: 400 });
  }
}
```

## API Reference

### `validateWebhook(options)`

Validates a webhook request by checking the API key in the Authorization header.

**Parameters:**

- `options.request`: The webhook request
- `options.apiKeyOverride`: Optional override for the API key
- `options.rotationApiKeys`: Optional array of additional API keys for key rotation

**Returns:**

- `Promise<boolean>`: Resolves to true if the webhook is valid

### `parseWebhookEvent(request)`

Parses a webhook request into a WebhookEvent object.

**Parameters:**

- `request`: The webhook request

**Returns:**

- `Promise<WebhookEvent>`: Resolves to the parsed webhook event

### `handleWebhook(options)`

Handles a webhook request by validating it, parsing the event, and calling the appropriate handler.

**Parameters:**

- `options.request`: The webhook request
- `options.apiKeyOverride`: Optional override for the API key
- `options.rotationApiKeys`: Optional array of additional API keys for key rotation
- `options.handlers`: Optional object mapping event types to handler functions

**Returns:**

- `Promise<WebhookEvent>`: Resolves to the parsed webhook event

### `testWebhook(webhookUrl, eventType, customData)`

Tests a webhook by sending a test event to the specified URL.

**Parameters:**

- `webhookUrl`: The URL to send the test event to
- `eventType`: The type of event to send
- `customData`: Optional custom data to include in the event

**Returns:**

- `Promise<Result<HttpResponse<any>>>`: Resolves to the response from the webhook URL

### Type Guards

- `isEmailEvent(event)`: Checks if the event is an email-related event
- `isSubscriptionEvent(event)`: Checks if the event is a subscription-related event
- `isSentEvent(event)`: Type guard for sent events
- `isFailedEvent(event)`: Type guard for failed events
- `isClickEvent(event)`: Type guard for click events
- `isOpenEvent(event)`: Type guard for open events
- `isBounceEvent(event)`: Type guard for bounce events
- `isComplaintEvent(event)`: Type guard for complaint events
- `isSubscribeEvent(event)`: Type guard for subscribe events
- `isUnsubscribeEvent(event)`: Type guard for unsubscribe events
- `isPauseSubscriptionEvent(event)`: Type guard for pause subscription events
- `isResubscribeEvent(event)`: Type guard for resubscribe events
