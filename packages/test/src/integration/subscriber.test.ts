import { describe, it, expect, beforeAll } from "vitest";
import { BluefoxClient } from "bluefox-email";
import { setupMockServer } from "../mocks/server";

// Setup the mock server for all tests in this file
setupMockServer();

describe("Subscriber Module Integration", () => {
  let client: BluefoxClient;

  beforeAll(() => {
    // Create a client that will use our mocked API
    client = new BluefoxClient({
      apiKey: "test-api-key",
      baseUrl: "https://api.bluefox.email/v1",
    });
  });

  it("should add a subscriber", async () => {
    const result = await client.subscriber.add(
      "mock-list-id",
      "Test User",
      "test@example.com",
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.data).toHaveProperty("_id");
      expect(result.value.data.name).toBe("Mock User"); // This comes from our mock
      expect(result.value.data.email).toBe("mock@example.com"); // This comes from our mock
    }
  });

  it("should list subscribers", async () => {
    const result = await client.subscriber.list("mock-list-id");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.data).toHaveProperty("items");
      expect(result.value.data).toHaveProperty("count");
      expect(result.value.data.items.length).toBeGreaterThan(0);
    }
  });

  it("should get a specific subscriber", async () => {
    const result = await client.subscriber.getOne(
      "mock-list-id",
      "test@example.com",
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.data).toHaveProperty("_id");
      expect(result.value.data).toHaveProperty("email");
    }
  });

  it("should pause a subscription", async () => {
    const pauseDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day from now

    const result = await client.subscriber.pause(
      "mock-list-id",
      "test@example.com",
      pauseDate,
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.data.status).toBe("paused");
      expect(result.value.data).toHaveProperty("pausedUntil");
    }
  });

  it("should activate a subscriber", async () => {
    const result = await client.subscriber.activate(
      "mock-list-id",
      "test@example.com",
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.data.status).toBe("active");
    }
  });

  it("should remove a subscriber", async () => {
    const result = await client.subscriber.remove(
      "mock-list-id",
      "test@example.com",
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.data.status).toBe("unsubscribed");
    }
  });

  it("should handle errors when adding a subscriber", async () => {
    const result = await client.subscriber.add(
      "error-list", // This will trigger our error mock
      "Test User",
      "test@example.com",
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("VALIDATION_ERROR");
      expect(result.error.message).toContain("Email already exists");
    }
  });
});
