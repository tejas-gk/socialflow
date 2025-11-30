import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      // disable “defined but never used”
      "@typescript-eslint/no-unused-vars": "off",

      // disable “Unexpected any”
      "@typescript-eslint/no-explicit-any": "off",

      // disable missing deps warning
      "react-hooks/exhaustive-deps": "off",

      // disable <img> warnings
      "@next/next/no-img-element": "off",

      // 👇 disable the “use @ts-expect-error instead of @ts-ignore” rule
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },
];

export default eslintConfig;
