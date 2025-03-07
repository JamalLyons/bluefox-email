# Bluefox-Email

A collection of libraries for sending emails using [Bluefox.email](https://bluefox.email) in TypeScript.

## Disclaimer

This library is developed by [Jamal Lyons](https://www.jamallyons.com), an independent developer with no affiliation with the Bluefox team. I am not associated with Bluefox in any way. This project aims to simplify working with the Bluefox API.

## Packages

This repository is organized into separate packages for different use cases:

- [`api`](./packages/api/) - Low-level bindings for the Bluefox.email service.
- [`bluefox`](./packages/bluefox/) - A high-level client for the Bluefox.email service.
- [`convex`](./packages/convex/) - A Bluefox.email integration for Convex.
- [`utils`](./packages/utils/) - Utility functions for working with Bluefox.email.
- [`typescript-config`](./packages/typescript-config/) - Shared TypeScript configurations for other packages.

## Installation

You can install the main library using:

```sh
pnpm add bluefox-email
```

## Usage

_TODO: Add usage examples._

## Versioning

The [official Bluefox API](https://bluefox.email/docs/api/) is currently at version 1. This library follows semantic versioning, ensuring that all `1.x.x` versions remain compatible with Bluefox API v1. It will not move to `2.x.x` until Bluefox releases API version 2.
