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
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    testTimeout: 60000,
    setupFiles: ["src/__tests__/setup.ts"],
    coverage: {
      provider: "v8",
      include: [
        "src/lib/**/*.ts",
        "src/app/api/**/*.ts",
      ],
      exclude: [
        "src/lib/detection-config.ts",
        "src/**/*.test.ts",
        "src/**/*.test.tsx",
        "src/__tests__/**",
      ],
    },
  },
});
