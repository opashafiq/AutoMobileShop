# Models & Interfaces Guidelines

Keep shared TypeScript model interfaces in a central file to improve maintainability.

Location
- Primary file: `src/app/models/interfaces.ts`

How to add a new interface
1. Add the new export to `src/app/models/interfaces.ts`.
2. Import the interface where needed, for example:

```ts
import type { TaxType } from '@/app/models/interfaces'
```

Why
- Centralized interfaces make it easier to update types used across multiple components and CRUD handlers.

Notes
- Use `import type` for pure type imports to keep runtime bundles small.
- If your models grow large, consider splitting into domain-specific files like `models/tax.ts` and re-exporting from `models/index.ts`.
