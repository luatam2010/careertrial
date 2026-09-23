import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "url";

// Mirrors the Vite aliases so tests import the same module graph the app does.
export default defineConfig({
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(new URL("../declarations", import.meta.url)),
      },
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
  },
  test: {
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // The container sets thread-pool limits that conflict with Vitest's
    // defaults ("options.minThreads and options.maxThreads must not conflict").
    // Pinning both to a single worker keeps the run deterministic and avoids
    // the conflict entirely.
    pool: "forks",
    poolOptions: {
      forks: { minForks: 1, maxForks: 1 },
    },
  },
});
