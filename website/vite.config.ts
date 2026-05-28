import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

const rootPackageJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../package.json"), "utf8")
) as { version: string };

export default defineConfig({
  plugins: [react()],
  define: {
    __PACKAGE_VERSION__: JSON.stringify(rootPackageJson.version),
  },
  resolve: {
    alias: {
      "@oqlet/react-fill": path.resolve(__dirname, "../src"),
      DynamicForm: path.resolve(__dirname, "../src/DynamicForm"),
      FormEngine: path.resolve(__dirname, "../src/FormEngine"),
      index: path.resolve(__dirname, "../src/index"),
    },
  },
});
