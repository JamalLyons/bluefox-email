import { describe, it, expect, vi, beforeEach } from "vitest";
import { BluefoxClient, WebhookEventType } from "bluefox-email";

// Mock the modules we depend on
vi.mock("@bluefox-email/api", () => {
  return {
    BluefoxModule: class MockBluefoxModule {
      protected context: any;
      constructor(context: any) {
        this.context = context;
      }

      protected request() {
        return Promise.resolve({
          ok: true,
          value: {
            data: { success: true },
            status: 200,
            headers: {},
            timestamp: Date.now(),
          },
        });
      }
    },
    BluefoxContext: class MockBluefoxContext {},
    RateLimiter: class MockRateLimiter {},
    BluefoxError: class MockBluefoxError extends Error {
      public readonly code: string;
      public readonly status: number;
      public readonly details?: Record<string, unknown>;

      constructor(error: any) {
        super(error.message);
        this.code = error.code;
        this.status = error.status;
        this.details = error.details;
      }

      static validation(message: string) {
        return new MockBluefoxError({
          code: "VALIDATION_ERROR",
          message,
          status: 400,
        });
      }
    },
    ErrorCode: {
      VALIDATION_ERROR: "VALIDATION_ERROR",
      AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
    },
  };
});

describe("Webhooks Module", () => {
  let client: BluefoxClient;

  beforeEach(() => {
    // Create a new client instance before each test
    client = new BluefoxClient({
      apiKey: "test-api-key",
    });
  });

  describe("validateWebhook", () => {
    it("should validate a webhook with a valid API key", async () => {
      const mockRequest = new Request("https://example.com/webhook", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-api-key",
        },
      });

      const result = await client.webhooks.validateWebhook({
        request: mockRequest,
      });

      expect(result).toBe(true);
    });

    it("should support multiple API keys for rotation", async () => {
      const mockRequest = new Request("https://example.com/webhook", {
        method: "POST",
        headers: {
          Authorization: "Bearer secondary-key",
        },
      });

      const result = await client.webhooks.validateWebhook({
        request: mockRequest,
        rotationApiKeys: ["primary-key", "secondary-key"],
      });

      expect(result).toBe(true);
    });
  });

  describe("parseWebhookEvent", () => {
    it("should parse a webhook event", async () => {
      const mockEvent = {
        type: WebhookEventType.Open,
        emailData: {
          to: "test@example.com",
          subject: "Test Email",
        },
      };

      const mockRequest = new Request("https://example.com/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockEvent),
      });

      // Mock the json method
      const originalJson = mockRequest.json;
      mockRequest.json = vi.fn().mockResolvedValue(mockEvent);

      const event = await client.webhooks.parseWebhookEvent(mockRequest);

      expect(event).toEqual(mockEvent);
      expect(event.type).toBe(WebhookEventType.Open);

      // Restore the original method
      mockRequest.json = originalJson;
    });
  });

  describe("Type Guards", () => {
    it("should correctly identify email events", () => {
      const openEvent = { 
        type: WebhookEventType.Open,
        account: { name: "Test", urlFriendlyName: "test" },
        project: { name: "Test", _id: "123" },
        createdAt: new Date().toISOString()
      } as any;
      const clickEvent = { 
        type: WebhookEventType.Click,
        account: { name: "Test", urlFriendlyName: "test" },
        project: { name: "Test", _id: "123" },
        createdAt: new Date().toISOString()
      } as any;
      const subscribeEvent = { 
        type: WebhookEventType.Subscribe,
        account: { name: "Test", urlFriendlyName: "test" },
        project: { name: "Test", _id: "123" },
        createdAt: new Date().toISOString()
      } as any;

      expect(client.webhooks.isEmailEvent(openEvent)).toBe(true);
      expect(client.webhooks.isEmailEvent(clickEvent)).toBe(true);
      expect(client.webhooks.isEmailEvent(subscribeEvent)).toBe(false);
    });

    it("should correctly identify subscription events", () => {
      const subscribeEvent = { 
        type: WebhookEventType.Subscribe,
        account: { name: "Test", urlFriendlyName: "test" },
        project: { name: "Test", _id: "123" },
        createdAt: new Date().toISOString()
      } as any;
      const unsubscribeEvent = { 
        type: WebhookEventType.Unsubscribe,
        account: { name: "Test", urlFriendlyName: "test" },
        project: { name: "Test", _id: "123" },
        createdAt: new Date().toISOString()
      } as any;
      const openEvent = { 
        type: WebhookEventType.Open,
        account: { name: "Test", urlFriendlyName: "test" },
        project: { name: "Test", _id: "123" },
        createdAt: new Date().toISOString()
      } as any;

      expect(client.webhooks.isSubscriptionEvent(subscribeEvent)).toBe(true);
      expect(client.webhooks.isSubscriptionEvent(unsubscribeEvent)).toBe(true);
      expect(client.webhooks.isSubscriptionEvent(openEvent)).toBe(false);
    });

    it("should correctly identify specific event types", () => {
      const clickEvent = {
        type: WebhookEventType.Click,
        link: "https://example.com",
        account: { name: "Test", urlFriendlyName: "test" },
        project: { name: "Test", _id: "123" },
        createdAt: new Date().toISOString()
      } as any;

      expect(client.webhooks.isClickEvent(clickEvent)).toBe(true);
      expect(client.webhooks.isOpenEvent(clickEvent)).toBe(false);
    });
  });
});
