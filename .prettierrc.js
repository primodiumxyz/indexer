/** @type {import("prettier").Config} */
module.exports = {
  // We need to explicitly define the plugin here for husky's lint-staged hook to work properly
  printWidth: 120,
  semi: true,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,

  importOrderBuiltinModulesToTop: true,
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  importOrderCombineTypeAndValueImports: true,
  plugins: ["@ianvs/prettier-plugin-sort-imports", "prettier-plugin-jsdoc"],
  importOrder: ["<THIRD_PARTY_MODULES>", "", "^@primodiumxyz/(.*)$", "^@bin/(.*)$", "^@/(.*)$", "", "^[./]"],
};
