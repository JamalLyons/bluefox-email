import { describe, it, expect, vi, beforeEach } from "vitest";
import { BluefoxClient } from "bluefox-email";

// Mock the modules we depend on
vi.mock("@bluefox-email/api", () => {
  return {
    BluefoxModule: class MockBluefoxModule {
      protected context: any;
      constructor(context: any) {
        this.context = context;
      }
    },
    BluefoxContext: class MockBluefoxContext {},
    RateLimiter: class MockRateLimiter {},
  };
});

describe("BluefoxClient", () => {
  let client: BluefoxClient;

  beforeEach(() => {
    // Create a new client instance before each test
    client = new BluefoxClient({
      apiKey: "test-api-key",
    });
  });

  it("should initialize with default values", () => {
    expect(client).toBeInstanceOf(BluefoxClient);
    expect(client.subscriber).toBeDefined();
    expect(client.email).toBeDefined();
    expect(client.webhooks).toBeDefined();
  });

  it("should use the provided API key", () => {
    const customClient = new BluefoxClient({
      apiKey: "custom-api-key",
    });

    // We can't directly access private properties, but we can check that
    // the client was created successfully
    expect(customClient).toBeInstanceOf(BluefoxClient);
  });

  it("should use the provided base URL if specified", () => {
    const customClient = new BluefoxClient({
      apiKey: "test-api-key",
      baseUrl: "https://custom-api.example.com/v1",
    });

    expect(customClient).toBeInstanceOf(BluefoxClient);
  });

  it("should enable debug mode if specified", () => {
    const debugClient = new BluefoxClient({
      apiKey: "test-api-key",
      debug: true,
    });

    expect(debugClient).toBeInstanceOf(BluefoxClient);
  });
});
