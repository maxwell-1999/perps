module.exports = {
  extends: [
    "next",
    "prettier",
    "plugin:storybook/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  rules: {
    "react/no-unescaped-entities": [0],
    "@next/next/no-img-element": [0],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-explicit-any": "off",
  },
  parser: "@typescript-eslint/parser",
  root: true,
  plugins: ["jsx-a11y", "@typescript-eslint"],
};
