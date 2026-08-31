import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Next.js 16 flat config — the replacement for the removed `next lint`
 * command. React/Next hygiene + TypeScript rules with type-aware linting
 * disabled (the repo predates type-aware setup; enabling it is a follow-up).
 *
 * These rules are relaxed to `warn` because the existing template/providers code
 * predates them and exercises them by design:
 *  - `@typescript-eslint/no-explicit-any` — ApexCharts option bags are threaded
 *    as `Record<string, any>` repo-wide (see shared/charts.ts) because ApexCharts'
 *    own typings are internally inconsistent for the callbacks these charts use.
 *  - `react-hooks/set-state-in-effect` — the new React-19 guidance fires across
 *    the legacy providers/dialogs (auth, invoice/layaway editors, chat, …) which
 *    synchronise state in effects.
 *  - `react/no-unescaped-entities`, `react/display-name`, `react/jsx-key`,
 *    `@typescript-eslint/no-empty-object-type`, `@typescript-eslint/no-unsafe-function-type`
 *    — remaining legacy template/demo findings (curly apostrophes in JSX text,
 *    onward-ref'd demos, bootstrap-era `{}`/`Function` type usage). They stay
 *    surfaced as warnings; new code is expected to follow the current guidance.
 * `react-hooks/refs`, `react-hooks/rules-of-hooks` and `react-hooks/purity` are
 * deliberately NOT relaxed — render-time ref access, hooks-in-plain-functions and
 * impure render calls are real bug classes, and the existing hits were fixed in code.
 */
const config = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react/no-unescaped-entities": "warn",
      "react/display-name": "warn",
      "react/jsx-key": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-unsafe-function-type": "warn",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "public/**"]),
]);

export default config;