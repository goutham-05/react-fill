import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"]
  },
  resolve: {
    alias: {
      DynamicForm: path.resolve(__dirname, "./src/DynamicForm"),
      FormEngine: path.resolve(__dirname, "./src/FormEngine"),
      index: path.resolve(__dirname, "./src/index")
    }
  }
});
