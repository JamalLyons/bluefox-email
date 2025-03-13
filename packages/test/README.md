# Bluefox Testing Strategy

This package contains the testing infrastructure for the Bluefox email library. It's designed to provide comprehensive test coverage for all components of the library, from unit tests to integration tests.

## Testing Philosophy

Our testing approach follows these principles:

1. **Every function should be testable** - All public and private functions should have corresponding tests
2. **Tests should be fast and reliable** - Tests should run quickly and produce consistent results
3. **Tests should be independent** - Tests should not depend on the state of other tests
4. **Tests should be comprehensive** - Tests should cover normal cases, edge cases, and error cases
5. **Tests should be maintainable** - Tests should be easy to understand and modify

## Testing Layers

We use a multi-layered testing approach:

### 1. Unit Tests

Unit tests focus on testing individual functions and classes in isolation. They use mocks to replace external dependencies like API calls.

- Located in: `src/unit/`
- Run with: `pnpm test:unit`

### 2. Integration Tests

Integration tests verify that different components work together correctly. They may use real dependencies or realistic mocks.

- Located in: `src/integration/`
- Run with: `pnpm test:integration`

### 3. E2E Tests

End-to-end tests verify the entire system works correctly with real API calls. These tests require API credentials.

- Located in: `src/e2e/`
- Run with: `pnpm test:e2e`

## Test Environment

### Environment Variables

Tests that interact with the real Bluefox API require environment variables. Copy `.env.example` to `.env` and fill in your API credentials:

```
BLUEFOX_API_KEY=your_api_key
SUBSCRIBER_LIST=your_subscriber_list_id
EMAIL_ADDRESS=test@example.com
TRANSACTIONAL_ID=your_transactional_id
```

For CI/CD environments, these variables should be set as secrets.

### Mock Server

For unit and integration tests, we use a mock server to simulate the Bluefox API:

- Located in: `src/mocks/server.ts`
- Configured with realistic responses based on the actual API
- Allows testing error conditions and edge cases

## Running Tests

```bash
# Install dependencies
pnpm install

# Run all tests
pnpm test

# Run specific test suites
pnpm test:unit
pnpm test:integration
pnpm test:e2e

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode (for development)
pnpm test:watch

# Run tests for CI environments
pnpm test:ci

# Run manual tests (using src/index.ts)
pnpm manual-test
```

## Manual Testing

For manual testing during development, you can use the test runner script:

1. Edit `src/index.ts` to uncomment the tests you want to run
2. Run `pnpm manual-test`

This is useful for debugging specific functionality against the real API.

## Test Structure

Each test file follows this structure:

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { functionToTest } from "path/to/function";

describe("functionToTest", () => {
  beforeEach(() => {
    // Setup code
  });

  afterEach(() => {
    // Cleanup code
  });

  it("should do something expected", () => {
    // Arrange
    const input = "some input";

    // Act
    const result = functionToTest(input);

    // Assert
    expect(result).toBe("expected output");
  });

  it("should handle error cases", () => {
    // Test error handling
  });
});
```

## Mocking Strategy

We use several approaches for mocking:

1. **API Mocking**: Using MSW (Mock Service Worker) to intercept and mock HTTP requests
2. **Function Mocking**: Using Vitest's mocking capabilities to replace function implementations
3. **Class Mocking**: Using class mocks to test class interactions

## Coverage Goals

We aim for:

- Line coverage: >90%
- Branch coverage: >85%
- Function coverage: 100%

## Continuous Integration

Tests are automatically run in CI for:

- Pull requests
- Merges to main branch
- Release preparation

## Adding New Tests

When adding new functionality to the library:

1. Add unit tests for the new functions/classes
2. Add integration tests if the functionality interacts with other components
3. Add E2E tests if the functionality interacts with the API
4. Ensure all tests pass before submitting a PR
