import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    testTimeout: 60000,
    coverage: {
      provider: "v8",
      include: ["src/lib/real-detectors.ts", "src/lib/mock-detectors.ts"],
    },
  },
});
