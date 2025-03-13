# Bluefox Email

A TypeScript client library for sending emails using [Bluefox.email](https://bluefox.email).

## Features

- **Type-Safe API**: Full TypeScript support with comprehensive type definitions
- **Subscriber Management**: Add, remove, pause, and activate subscribers
- **Email Sending**: Send transactional and triggered emails with template data
- **Attachment Support**: Include file attachments with your emails
- **Webhook Handling**: Process webhook events with type guards and handlers
- **Error Handling**: Consistent error handling with detailed error types
- **Configurable**: Customize timeouts, retries, and more

## Documentation

Comprehensive documentation is available in the docs directory:

- [API Overview](./docs/api.md) - General overview of the client library
- [Email Module](./docs/email.md) - Documentation for sending transactional and triggered emails
- [Subscriber Module](./docs/subscriber.md) - Documentation for managing subscriber lists
- [Webhooks Module](./docs/webhooks.md) - Documentation for handling webhook events

## Installation

```bash
npm install bluefox-email
# or
yarn add bluefox-email
# or
pnpm add bluefox-email
```

## Quick Start

```typescript
import { BluefoxClient } from "bluefox-email";

// Initialize the client
const client = new BluefoxClient({
  apiKey: process.env.BLUEFOX_API_KEY,
});

// Send a transactional email
await client.email.sendTransactional({
  to: "recipient@example.com",
  transactionalId: "welcome-email",
  data: { name: "John Doe" },
});
```

## API Coverage

The current state of [Bluefox API](https://bluefox.email/docs/api/) implementation:

| Feature                    | Status |
| -------------------------- | ------ |
| Subscriber List Management | ✅     |
| Transactional Emails       | ✅     |
| Triggered Email            | ✅     |
| Send Attachments           | ✅     |
| Webhooks                   | ✅     |

## Architecture

This package is built on top of the `@bluefox-email/api` module, which provides low-level bindings to the Bluefox.email API. While the API module can be used directly, it's recommended to use this higher-level client library for most use cases.

The architecture is designed with the following layers:

1. **Client Layer** (`BluefoxClient`): The main entry point for developers, providing a simple and intuitive interface.
2. **Module Layer** (`BluefoxEmail`, `BluefoxSubscriber`, `BluefoxWebhooks`): Specialized modules for different API functionalities.
3. **API Layer** (`@bluefox-email/api`): Low-level API bindings, handling HTTP requests, error normalization, and rate limiting.

This layered approach allows for:

- A clean, developer-friendly API at the top level
- Separation of concerns between different API functionalities
- Reusable core components for advanced use cases

## Advanced Usage

For more advanced usage examples, including error handling, webhook processing, and attachment handling, please refer to the [documentation](./docs/api.md).
