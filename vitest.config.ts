import path from "node:path";
import { config } from "dotenv";
import { defineConfig } from "vitest/config";

config({ path: path.resolve(import.meta.dirname, ".env") });

export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  test: {
    include: ["src/**/*.test.{ts,tsx}", "tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/lib/statistics/**/*.ts",
        "src/lib/validation/**/*.ts",
        "src/features/**/repository.ts",
      ],
    },
  },
});
