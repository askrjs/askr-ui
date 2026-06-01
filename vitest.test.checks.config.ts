import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/unit/dev_checks/**/*.test.{ts,tsx}"],
  },
});