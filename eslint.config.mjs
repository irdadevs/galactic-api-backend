import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      ".husky/**",
      "src/infra/db/migrations/**/*.sql",
    ],
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      "no-console": "off",
      "no-var": "error",
      "prefer-const": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["**/*.test.ts", "src/test/**/*.ts", "**/*.d.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
    },
    rules: {
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "no-var": "error",
      "prefer-const": "error",
    },
  },
];
