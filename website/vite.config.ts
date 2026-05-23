import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "react-fill": path.resolve(__dirname, "../src"),
      DynamicForm: path.resolve(__dirname, "../src/DynamicForm"),
      FormEngine: path.resolve(__dirname, "../src/FormEngine"),
      index: path.resolve(__dirname, "../src/index"),
    },
  },
});
