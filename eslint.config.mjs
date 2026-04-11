import next from "eslint-config-next";

const config = [
  ...next,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "react-hooks/rules-of-hooks": "error",
    },
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default config;
