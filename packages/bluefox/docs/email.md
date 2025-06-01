# Bluefox Email API

This document explains how to use the Email module in the Bluefox client library to send transactional and triggered emails.

## Overview

The Email module allows you to programmatically send emails using Bluefox templates. You can send both transactional emails (one-to-one emails like password resets or order confirmations) and triggered emails (automated sequences based on user actions).

## Features

- **Send Transactional Emails**: Send immediate, one-to-one emails to individual recipients
- **Send Triggered Emails**: Send automated email sequences to multiple recipients
- **Template Data**: Personalize emails with dynamic data
- **Attachments**: Include file attachments with your emails

## Usage Examples

### Initialize the Client

```typescript
import { BluefoxClient } from "bluefox-email";

const client = new BluefoxClient({
  apiKey: "your-api-key",
  debug: true, // Optional: Enable debug logging
});
```

### Send a Transactional Email

```typescript
async function sendTransactionalEmail() {
  const result = await client.email.sendTransactional({
    to: "recipient@example.com",
    transactionalId: "welcome-email", // ID of your transactional email template
    data: {
      // Data to merge into the email template
      name: "John Doe",
      companyName: "Acme Inc.",
      activationLink: "https://example.com/activate?token=abc123",
    },
  });

  if (result.ok) {
    console.log("Email sent successfully:", result.value.data);
  } else {
    console.error("Failed to send email:", result.error.message);
  }
}
```

### Send a Triggered Email

```typescript
async function sendTriggeredEmail() {
  const result = await client.email.sendTriggered({
    emails: [
      "recipient1@example.com",
      "recipient2@example.com",
      "recipient3@example.com",
    ],
    triggeredId: "onboarding-sequence", // ID of your triggered email template
    data: {
      // Data to merge into the email template
      productName: "Awesome Product",
      tutorialLink: "https://example.com/tutorials",
    },
  });

  if (result.ok) {
    console.log("Triggered email sent successfully:", result.value.data);
  } else {
    console.error("Failed to send triggered email:", result.error.message);
  }
}
```

### Send an Email with Attachments

```typescript
import { readFileSync } from "fs";

async function sendEmailWithAttachment() {
  // Read a file and convert to base64
  const pdfBuffer = readFileSync("path/to/document.pdf");
  const pdfBase64 = pdfBuffer.toString("base64");

  const result = await client.email.sendTransactional({
    to: "recipient@example.com",
    transactionalId: "invoice-email",
    data: {
      invoiceNumber: "INV-12345",
      amount: "$99.99",
      date: new Date().toLocaleDateString(),
    },
    attachments: [
      {
        fileName: "invoice.pdf",
        content: pdfBase64,
      },
    ],
  });

  if (result.ok) {
    console.log("Email with attachment sent successfully:", result.value.data);
  } else {
    console.error(
      "Failed to send email with attachment:",
      result.error.message,
    );
  }
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
    case ErrorCode.INSUFFICIENT_CREDITS:
      console.error("Insufficient credits to send email");
      break;
    case ErrorCode.MISSING_AWS_CONFIG:
      console.error("AWS configuration is missing");
      break;
    default:
      console.error("An error occurred:", error.message);
  }
}
```

## API Reference

### `sendTransactional(options)`

Sends a transactional email to a single recipient.

**Parameters:**

- `options.to`: Recipient email address
- `options.transactionalId`: ID of the transactional email template
- `options.data`: (Optional) Data to merge into the email template
- `options.attachments`: (Optional) File attachments

**Returns:**

- `Promise<Result<HttpResponse<EmailResponse>>>`: A promise that resolves to the email response

### `sendTriggered(options)`

Sends a triggered email to multiple recipients.

**Parameters:**

- `options.emails`: Array of recipient email addresses
- `options.triggeredId`: ID of the triggered email template
- `options.data`: (Optional) Data to merge into the email template
- `options.attachments`: (Optional) File attachments

**Returns:**

- `Promise<Result<HttpResponse<EmailResponse>>>`: A promise that resolves to the email response

## Types

### `SendTransactionalOptions`

```typescript
interface SendTransactionalOptions {
  /** Recipient email address */
  to: string;
  /** ID of the transactional email template */
  transactionalId: string;
  /** Data to merge into the email template */
  data?: Record<string, unknown>;
  /** Optional file attachments */
  attachments?: Array<{
    fileName: string;
    content: string;
  }>;
}
```

### `SendTriggeredOptions`

```typescript
interface SendTriggeredOptions {
  /** Recipient email addresses */
  emails: string[];
  /** ID of the triggered email template */
  triggeredId: string;
  /** Data to merge into the email template */
  data?: Record<string, unknown>;
  /** Optional file attachments */
  attachments?: Array<{
    fileName: string;
    content: string;
  }>;
}
```

### `EmailResponse`

```typescript
interface EmailResponse {
  success: boolean;
}
```

### `EmailStatus`

```typescript
enum EmailStatus {
  Queued = "queued",
  Sent = "sent",
  Delivered = "delivered",
  Failed = "failed",
}
```

## Attachments

When sending attachments, keep the following in mind:

1. **File Size**: Attachments should be kept reasonably small. Very large attachments may cause issues.
2. **Base64 Encoding**: The `content` field must contain the file data encoded as a base64 string.
3. **File Name**: The `fileName` field must include the file extension (e.g., `.pdf`, `.jpg`).
4. **Validation**: The Bluefox API validates attachments to ensure they have valid filenames and properly encoded content.

Example of creating a base64-encoded attachment:

```typescript
import { readFileSync } from "fs";

// Read a file and convert to base64
const fileBuffer = readFileSync("path/to/file.pdf");
const fileBase64 = fileBuffer.toString("base64");

const attachment = {
  fileName: "document.pdf",
  content: fileBase64,
};
```
