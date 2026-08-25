this app is based on the specification provided in docs/spec.md make sure to follow it
<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Commands

- Dev server: `npm run dev` (Turbopack, port 3000). Build/prod: `npm run build` then `npm start`.
- Lint: `npm run lint` (ESLint 9 flat config).
- Typecheck: `npx tsc --noEmit` — there is no npm script for it.
- No test framework is configured.

# Gotchas

- `tsconfig.json` includes generated route types from `.next/types/**` and `.next/dev/types/**` (e.g. the global `LayoutProps<"/">` used in `app/layout.tsx`). On a fresh clone, `npx tsc --noEmit` fails until `next dev` or `next build` has generated them.
- Tailwind CSS v4 with CSS-first config: there is no `tailwind.config.*`; theme tokens are declared under `@theme inline` in `app/globals.css`.
- shadcn/ui uses the "base-nova" style built on **@base-ui/react** primitives, not Radix. Check Base UI props/APIs (`import ... from "@base-ui/react/*"`) when editing `components/ui/` — Radix patterns will not apply.
- Add UI primitives via the shadcn CLI (`npx shadcn add <component>`); it writes to `components/ui/` using the aliases in `components.json`.
- Repo agent skills live in `.agents/skills/` (frontend-design, shadcn, vercel-react-best-practices), locked by `skills-lock.json` — use them for UI work instead of guessing component APIs.

# Layout

- Single Next.js App Router app (not a monorepo): routes in `app/`, shadcn components in `components/ui/`, helpers in `lib/` (`cn()` in `lib/utils.ts`).
- Path alias: `@/*` maps to the repo root (e.g. `@/components/ui/button`).
- Icons come from `lucide-react`; animations from `tw-animate-css`.
- `data/` and `types/` are currently empty placeholders.
