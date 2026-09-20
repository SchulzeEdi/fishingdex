import type { Preview } from "@storybook/react";
import "../src/app/globals.css"; // tokens -> tailwind -> aqui

const preview: Preview = {
  parameters: {
    backgrounds: { default: "app" },
    a11y: { config: { rules: [{ id: "color-contrast", enabled: true }] } },
  },
};
export default preview;
