import { describe, it, expect } from "vitest";
import { BluefoxClient } from "bluefox-email";
import { getEnv } from "../utils.js";

// Skip these tests if environment variables are not set
const runE2eTests = process.env.RUN_E2E_TESTS === "true";

// Conditionally run E2E tests
(runE2eTests ? describe : describe.skip)("Email Module E2E Tests", () => {
  let client: BluefoxClient;

  beforeAll(() => {
    // Create a client with real API credentials
    client = new BluefoxClient({
      apiKey: getEnv("API_KEY"),
      debug: true,
    });
  });

  it("should send a transactional email", async () => {
    const result = await client.email.sendTransactional({
      to: getEnv("EMAIL_ADDRESS"),
      transactionalId: getEnv("TRANSACTIONAL_ID"),
      data: {
        name: "E2E Test User",
        welcomeMessage: "This is an E2E test email",
      },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.data.success).toBe(true);
    }
  }, 10000); // Increase timeout for API call

  it("should send a transactional email with an attachment", async () => {
    const result = await client.email.sendTransactional({
      to: getEnv("EMAIL_ADDRESS"),
      transactionalId: getEnv("TRANSACTIONAL_ID"),
      data: {
        name: "E2E Test User",
        welcomeMessage: "This is an E2E test email with attachment",
      },
      attachments: [
        {
          fileName: "test.txt",
          content: Buffer.from("This is a test attachment").toString("base64"),
        },
      ],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.data.success).toBe(true);
    }
  }, 10000); // Increase timeout for API call

  // This test is commented out to avoid sending too many emails during testing
  // Uncomment it when you specifically want to test triggered emails
  /*
  it('should send a triggered email', async () => {
    const result = await client.email.sendTriggered({
      emails: [getEnv('EMAIL_ADDRESS')],
      triggeredId: 'your-triggered-id', // Replace with a valid triggered ID
      data: {
        name: 'E2E Test User',
        message: 'This is an E2E test triggered email',
      },
    });
    
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.data.success).toBe(true);
    }
  }, 10000); // Increase timeout for API call
  */
});
