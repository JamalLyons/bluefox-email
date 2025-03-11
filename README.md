# Bluefox Email

This repository contains a collection of libraries designed for sending emails using the [Bluefox.email](https://bluefox.email) API in TypeScript.
Created by [Jamal Lyons](https://www.jamallyons.com), this library aims to simplify the integration of email functionalities with the Bluefox service.

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

- **`bluefox-email`**: A high-level client for the Bluefox.email service.
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

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for more information on how to get started.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
