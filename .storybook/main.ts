import type { StorybookConfig } from "@storybook/nextjs";

// Catalogo visual do design system (Fase 3). Cada botao/estado/cor navegavel.
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-a11y"],
  framework: { name: "@storybook/nextjs", options: {} },
};
export default config;
