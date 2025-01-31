/** @type {import('prettier').Config} */
module.exports = {
  // We need to explicitly define the plugin here for husky's lint-staged hook to work properly
  plugins: ["prettier-plugin-jsdoc"],
  printWidth: 120,
  semi: true,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
};