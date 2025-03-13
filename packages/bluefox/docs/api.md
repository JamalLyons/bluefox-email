# Bluefox API Documentation

This document provides an overview of the Bluefox client library API and links to detailed documentation for each module.

## Overview

The Bluefox client library provides a simple and type-safe way to interact with the Bluefox.email API. It allows you to manage subscriber lists, send transactional and triggered emails, handle webhooks, and more.

## Installation

```bash
npm install bluefox-email
```

## Getting Started

```typescript
import { BluefoxClient } from "bluefox-email";

// Initialize the client
const client = new BluefoxClient({
  apiKey: "your-api-key",
  debug: true, // Optional: Enable debug logging
});

// Example: Send a transactional email
async function sendWelcomeEmail(email: string, name: string) {
  const result = await client.email.sendTransactional({
    to: email,
    transactionalId: "welcome-email",
    data: { name },
  });

  if (result.ok) {
    console.log("Welcome email sent successfully");
  } else {
    console.error("Failed to send welcome email:", result.error.message);
  }
}
```

## Client Configuration

The `BluefoxClient` constructor accepts a configuration object with the following options:

```typescript
const client = new BluefoxClient({
  // Required: Your Bluefox API key
  apiKey: "your-api-key",

  // Optional: Enable debug logging (default: false)
  debug: true,

  // Optional: Set request timeout in milliseconds (default: 15000)
  requestTimeout: 30000,

  // Optional: Set maximum number of retries for failed requests (default: 3)
  maxRetries: 5,

  // Optional: Override the base URL for the API (default: 'https://api.bluefox.email/v1')
  baseUrl: "https://custom-api.example.com/v1",
});
```

## Modules

The Bluefox client is organized into several modules, each handling a specific aspect of the API:

### Subscriber Module

The Subscriber module allows you to manage subscriber lists, including adding, removing, pausing, and activating subscribers.

[View Subscriber Module Documentation](./subscriber.md)

**Example:**

```typescript
// Add a subscriber to a list
const result = await client.subscriber.add(
  "list-123",
  "John Doe",
  "john@example.com"
);
```

### Email Module

The Email module allows you to send transactional and triggered emails, with support for template data and attachments.

[View Email Module Documentation](./email.md)

**Example:**

```typescript
// Send a transactional email
const result = await client.email.sendTransactional({
  to: "recipient@example.com",
  transactionalId: "welcome-email",
  data: { name: "John Doe" },
});
```

### Webhooks Module

The Webhooks module allows you to handle webhook events from Bluefox, such as email opens, clicks, bounces, and subscription changes.

[View Webhooks Module Documentation](./webhooks.md)

**Example:**

```typescript
// Validate and parse a webhook request
const isValid = await client.webhooks.validateWebhook({ request });
const event = await client.webhooks.parseWebhookEvent(request);

// Handle different event types
if (client.webhooks.isClickEvent(event)) {
  console.log(`Link clicked: ${event.link}`);
}
```

## Error Handling

The Bluefox client uses a Result type for all API responses, which makes error handling consistent and type-safe:

```typescript
const result = await client.email.sendTransactional({
  to: "recipient@example.com",
  transactionalId: "welcome-email",
  data: { name: "John Doe" },
});

if (result.ok) {
  // Success case
  console.log("Email sent successfully");
} else {
  // Error case
  const error = result.error;

  // Handle specific error types
  switch (error.code) {
    case ErrorCode.VALIDATION_ERROR:
      console.error("Validation error:", error.message);
      break;
    case ErrorCode.RATE_LIMIT_ERROR:
      console.error(
        "Rate limit exceeded, retry after:",
        new Date(error.details.reset)
      );
      break;
    default:
      console.error("An error occurred:", error.message);
  }
}
```

## Error Codes

The Bluefox client defines the following error codes:

```typescript
enum ErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  SERVER_ERROR = "SERVER_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  METHOD_NOT_ALLOWED = "METHOD_NOT_ALLOWED",
  DUPLICATE_EMAIL = "DUPLICATE_EMAIL",
  INVALID_DATE = "INVALID_DATE",
  INSUFFICIENT_CREDITS = "INSUFFICIENT_CREDITS",
  MISSING_AWS_CONFIG = "MISSING_AWS_CONFIG",
  MISSING_PARAMETERS = "MISSING_PARAMETERS",
}
```

## TypeScript Support

The Bluefox client is written in TypeScript and provides comprehensive type definitions for all API requests and responses. This ensures type safety and enables better IDE support with autocompletion and inline documentation.

```typescript
import {
  BluefoxClient,
  SendTransactionalOptions,
  WebhookEventType,
  SubscriberStatus,
  ErrorCode,
} from "bluefox-email";
```

## Advanced Usage

### Custom Request Interceptor

You can provide a custom request interceptor to modify requests before they are sent:

```typescript
const client = new BluefoxClient({
  apiKey: "your-api-key",
  requestInterceptor: async (options) => {
    // Add custom headers
    options.headers = {
      ...options.headers,
      "X-Custom-Header": "custom-value",
    };

    // Log the request
    console.log("Sending request:", options);

    return options;
  },
});
```

### Custom Response Interceptor

You can provide a custom response interceptor to modify responses before they are returned:

```typescript
const client = new BluefoxClient({
  apiKey: "your-api-key",
  responseInterceptor: async (response) => {
    // Log the response
    console.log("Received response:", response);

    // Add custom data
    response.data = {
      ...response.data,
      customField: "custom-value",
    };

    return response;
  },
});
```
