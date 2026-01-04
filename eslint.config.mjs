import nextPlugin from "@next/eslint-plugin-next";

// Use the flat config provided by Next to avoid circular config conversion issues.
export default [nextPlugin.configs["core-web-vitals"]];
