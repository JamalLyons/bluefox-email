# Bluefox Email

This repository contains a collection of libraries designed for sending emails using the [Bluefox.email](https://bluefox.email) API in TypeScript.
Created by [Jamal Lyons](https://www.jamallyons.com), this library aims to simplify the integration of email functionalities with the Bluefox service.

## Table of Contents

- [Overview](#overview)
- [Packages](#packages)
- [Installation](#installation)
- [Documentation](#documentation)
- [Running Locally](#running-locally)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Overview

This monorepo is organized into several packages, each serving a specific purpose in the Bluefox email ecosystem. The main package `bluefox-email` provides a high-level, developer-friendly client for interacting with the Bluefox.email service, while the supporting packages provide lower-level functionality and integrations.

## Packages

- **[`bluefox-email`](./packages/bluefox)**: The main client library for the Bluefox.email service. This is what most developers should use.

  - Features a type-safe API for managing subscribers, sending emails, and handling webhooks
  - Comprehensive error handling with detailed error types
  - Configurable request/response interceptors
  - Automatic retries and rate limiting

- **[`@bluefox-email/api`](./packages/api)**: Low-level API bindings for the Bluefox.email service.

  - Provides the foundation for the main client library
  - Intended for advanced users who want to build custom clients
  - Not meant to be used directly in most cases

- **[`@bluefox-email/convex`](./packages/convex)**: Integration for [Convex](https://convex.dev) with Bluefox.email.

  - Simplifies using Bluefox.email in Convex applications

- **[`@bluefox-email/utils`](./packages/utils)**: Utility functions for working with Bluefox.email.

  - Shared utilities used across the other packages

- **[`@bluefox-email/typescript-config`](./packages/typescript-config)**: Shared TypeScript configurations for other packages.
  - Ensures consistent TypeScript settings across the monorepo

## Installation

To install the main client library, use the following command:

```bash
npm install bluefox-email
# or
yarn add bluefox-email
# or
pnpm add bluefox-email
```

## Documentation

Comprehensive documentation for each module is available:

- [API Overview](./packages/bluefox/docs/api.md) - General overview of the client library
- [Email Module](./packages/bluefox/docs/email.md) - Documentation for sending transactional and triggered emails
- [Subscriber Module](./packages/bluefox/docs/subscriber.md) - Documentation for managing subscriber lists
- [Webhooks Module](./packages/bluefox/docs/webhooks.md) - Documentation for handling webhook events

## Usage

Here's a quick example of how to use the main client library:

```typescript
import { BluefoxClient } from "bluefox-email";

// Initialize the client
const client = new BluefoxClient({
  apiKey: process.env.BLUEFOX_API_KEY,
  debug: true, // Optional: Enable debug logging
});

// Send a transactional email
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

## Running Locally

This repository uses [pnpm](https://pnpm.io/) for package management. To set up the project locally:

```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for more information on how to get started.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
