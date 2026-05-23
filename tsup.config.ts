import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  clean: true,
  outDir: "dist",
  // Never bundle peer dependencies — consumers provide these from their own app
  external: ["react", "react-dom", "react-hook-form"],
  legacyOutput: false,
  esbuildOptions(options, context) {
    if (context.format === "esm") {
      options.outExtension = { ".js": ".mjs" };
    } else {
      options.outExtension = { ".js": ".js" };
    }
  }
});
