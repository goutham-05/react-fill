import type { StorybookConfig } from "@storybook/react-vite";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal(config) {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      DynamicForm: path.resolve(__dirname, "../src/DynamicForm"),
      FormEngine: path.resolve(__dirname, "../src/FormEngine"),
      index: path.resolve(__dirname, "../src/index"),
    };
    return config;
  },
};

export default config;
