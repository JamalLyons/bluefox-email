# Bluefox Email Monorepo

Welcome to the Bluefox Email Monorepo! This repository contains a collection of libraries designed for sending emails using the [Bluefox.email](https://bluefox.email) API in TypeScript. The monorepo structure allows for easy management and development of multiple packages that serve different purposes.

## Table of Contents

- [Overview](#overview)
- [Packages](#packages)
- [Installation](#installation)
- [Running Locally](#running-locally)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Overview

This monorepo is organized into several packages, each serving a specific purpose:

- **`@bluefox`**: A high-level client for the Bluefox.email service.
- **`@bluefox/api`**: Low-level bindings for the Bluefox.email service.
- **`@bluefox/convex`**: Integration for Convex with Bluefox.email.
- **`@bluefox/utils`**: Utility functions for working with Bluefox.email.
- **`@bluefox/typescript-config`**: Shared TypeScript configurations for other packages.

## Installation

To install the main library, you can use the following command:

```bash
pnpm add bluefox-email
```

Make sure you have [pnpm](https://pnpm.js.org/) installed. If you don't have it, you can install it globally using npm:

```bash
npm install -g pnpm
```

## Running Locally

To run the project locally, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/JamalLyons/bluefox-email.git
   cd bluefox-email
   ```

2. Install the dependencies:

   ```bash
   pnpm install
   ```

3. Build the packages:

   ```bash
   pnpm build
   ```

4. Start the development server (if applicable):

   ```bash
   pnpm dev
   ```

## Usage

### Client Package

The `bluefox-email` package provides a high-level client for interacting with the Bluefox.email API. Below are the steps to set up and use the library.

#### Setup

To use the `bluefox-email` client, you need to create an instance of the `BluefoxClient` class with your API key and configuration options:

```typescript
import { BluefoxClient } from "bluefox-email";

const bluefox = new BluefoxClient({
  apiKey: "your-api-key",
  debug: true,
});
```

#### Managing Subscribers

You can manage subscribers using the `subscriber` module:

```typescript
await bluefox.subscriber.add("list-123", "John Doe", "john@example.com");
```

#### Sending Emails

To send transactional emails, use the `email` module:

```typescript
await bluefox.email.sendTransactional({
  to: "john@example.com",
  transactionalId: "welcome-email",
  data: { name: "John" },
});
```

For detailed usage examples, please refer to the README in the `bluefox` package.

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for more information on how to get started.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
