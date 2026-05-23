import React from "react";
import type { Preview } from "@storybook/react";

const cardStyle: React.CSSProperties = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontSize: "14px",
  color: "#111827",
  background: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 1px 4px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.06)",
  padding: "32px",
  minWidth: "360px",
  maxWidth: "640px",
  width: "100%",
  boxSizing: "border-box",
};

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    layout: "centered",
    backgrounds: {
      default: "light-gray",
      values: [
        { name: "light-gray", value: "#f3f4f6" },
        { name: "white", value: "#ffffff" },
      ],
    },
  },
  decorators: [
    (Story) => React.createElement("div", { style: cardStyle }, React.createElement(Story as any)),
  ],
};

export default preview;
