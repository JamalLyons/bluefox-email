import { defineConfig } from "vitest";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["dotenv/config"],
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["**/node_modules/**", "**/dist/**", "**/mocks/**"],
    },
  },
});
