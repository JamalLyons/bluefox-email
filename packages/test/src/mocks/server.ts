import { http, HttpResponse, delay } from "msw";
import { setupServer } from "msw/node";
import { beforeAll, afterEach, afterAll } from "vitest";

// Sample response data
const mockSubscriber = {
  _id: "mock-subscriber-id",
  accountId: "mock-account-id",
  projectId: "mock-project-id",
  subscriberListId: "mock-list-id",
  name: "Mock User",
  email: "mock@example.com",
  status: "active",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  __v: 0,
};

const mockSubscriberList = {
  items: [mockSubscriber],
  count: 1,
};

const mockEmailResponse = {
  success: true,
};

// Define handlers
export const handlers = [
  // Subscriber endpoints
  http.post(
    "https://api.bluefox.email/v1/subscriber-lists/:listId",
    async () => {
      await delay(50); // Simulate network delay
      return HttpResponse.json(mockSubscriber, { status: 200 });
    },
  ),

  http.get(
    "https://api.bluefox.email/v1/subscriber-lists/:listId",
    async () => {
      await delay(50);
      return HttpResponse.json(mockSubscriberList, { status: 200 });
    },
  ),

  http.get(
    "https://api.bluefox.email/v1/subscriber-lists/:listId/:email",
    async () => {
      await delay(50);
      return HttpResponse.json(mockSubscriber, { status: 200 });
    },
  ),

  http.patch(
    "https://api.bluefox.email/v1/subscriber-lists/:listId/:email",
    async ({ request }) => {
      await delay(50);
      const body: any = await request.json();

      // Return different responses based on the status in the request
      const updatedSubscriber = {
        ...mockSubscriber,
        status: body.status,
        ...(body.pausedUntil ? { pausedUntil: body.pausedUntil } : {}),
        ...(body.name ? { name: body.name } : {}),
        ...(body.email ? { email: body.email } : {}),
      };

      return HttpResponse.json(updatedSubscriber, { status: 200 });
    },
  ),

  // Email endpoints
  http.post("https://api.bluefox.email/v1/send-transactional", async () => {
    await delay(50);
    return HttpResponse.json(mockEmailResponse, { status: 200 });
  }),

  http.post("https://api.bluefox.email/v1/send-triggered", async () => {
    await delay(50);
    return HttpResponse.json(mockEmailResponse, { status: 200 });
  }),

  // Webhook endpoints
  http.post("https://api.bluefox.email/v1/test-webhook", async () => {
    await delay(50);
    return HttpResponse.json({ success: true }, { status: 200 });
  }),

  // Error cases
  http.post(
    "https://api.bluefox.email/v1/subscriber-lists/error-list",
    async () => {
      await delay(50);
      return HttpResponse.json(
        {
          error: {
            name: "VALIDATION_ERROR",
            message: "Email already exists",
          },
        },
        { status: 400 },
      );
    },
  ),

  http.post(
    "https://api.bluefox.email/v1/send-transactional-error",
    async () => {
      await delay(50);
      return HttpResponse.json(
        {
          error: {
            name: "INSUFFICIENT_CREDITS",
            message: "Insufficient credits available.",
          },
        },
        { status: 405 },
      );
    },
  ),
];

// Create the server
export const server = setupServer(...handlers);

// Export utility functions for tests
export function setupMockServer() {
  // Start the server before all tests
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

  // Reset handlers between tests
  afterEach(() => server.resetHandlers());

  // Close the server after all tests
  afterAll(() => server.close());
}

// Export a function to add custom handlers for specific tests
export function addMockHandler(handler: any) {
  server.use(handler);
}
