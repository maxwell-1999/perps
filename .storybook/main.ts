import type { StorybookConfig } from "@storybook/nextjs";
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@chakra-ui/storybook-addon",
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  webpackFinal: (webpackConfig) => {
    //@ts-ignore
    const imageRule = webpackConfig.module.rules.find((rule) => {
      if (typeof rule !== "string" && rule.test instanceof RegExp) {
        return rule.test.test(".svg");
      }
    });
    if (typeof imageRule !== "string") {
      //@ts-ignore
      imageRule.exclude = /\.svg$/;
    }
    //@ts-ignore
    webpackConfig.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return webpackConfig;
  },
};
export default config;
