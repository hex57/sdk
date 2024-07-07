/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@0x57/eslint-config/library.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
  },
  ignorePatterns: [".eslintrc.cjs"],
};
