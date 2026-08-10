import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    env: {
      // Dummy values so importing lib/env.ts's eager module-level export
      // (used by app code, not by these tests) doesn't throw during test
      // collection. Individual tests call parsePublicEnv(...) directly with
      // their own inputs, unaffected by these.
      NEXT_PUBLIC_SUPABASE_URL: "https://placeholder.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "placeholder-anon-key",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
