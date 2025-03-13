# Bluefox Email

A library for sending emails using [Bluefox.email](https://bluefox.email).

## API

API documentation can be found in the library [source](./dist/index.d.ts).

## API Coverage

The current state of [API](https://bluefox.email/docs/api/) implementation is as follows:

- 🟩 Fully implemented
- 🟨 Partially implemented
- 🟥 Not implemented

| Feature                    | Status |
| -------------------------- | ------ |
| Subscriber List Management | 🟩     |
| Transactional Emails       | 🟩     |
| Triggered Email            | 🟩     |
| Send Attachments           | 🟩     |
| Webhooks                   | 🟩     |

## Installation

```bash
pnpm add bluefox-email
```

## Usage

```typescript
import { BluefoxClient } from "bluefox-email";

const client = new BluefoxClient({
  apiKey: process.env.BLUEFOX_EMAIL_API_KEY,
});

await client.email.sendTransactional({
  to: "john@example.com",
  transactionalId: "welcome-email",
  data: { name: "John" },
});
```
