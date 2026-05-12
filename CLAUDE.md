# CLAUDE.md

Prescriptive rules for AI agents working in this repo. `AGENTS.md` redirects here.

Every line must answer "would removing this cause Claude to make a mistake?" If not, cut it.

## How to work

1. **Plan before code** for any non-trivial change. State where it lives, what it must preserve, what verifies it. Plan mode (Shift+Tab) for multi-file work.
2. **Reference a recipe** in [`docs/patterns/recipes.md`](docs/patterns/recipes.md) before writing a new component. Consistency over cleverness.
3. **The hook verifies every edit.** `.claude/hooks/post-edit.sh` runs `tsc` (project) + `eslint --quiet` (just the edited file). For non-trivial diffs, ask the `frontend-reviewer` subagent to review.
4. **Stop when done.** Never write a "what I implemented" summary file.
5. **If you correct yourself twice on the same issue, `/clear` and restart** with a better prompt.
6. **For multi-file changes**, re-read [`docs/patterns/recipes.md`](docs/patterns/recipes.md) before declaring done — long sessions drop earlier instructions. For diffs > 50 lines, invoke the `frontend-reviewer` subagent.

## MUST NOT

- **No new dependency for a concern already covered.** Check `package.json` before importing. Two form libraries, two icon sets, two UI primitive systems — none of these exist in a healthy codebase. If you think we need a new one, write the justification and ask first.
- **No bare `fetch` to the backend** — use `authenticatedFetch` from `@/lib/auth/token`. Bare `fetch` only for login, refresh, and external/public APIs.
- **No `useEffect` for derived state.** Compute with `useMemo` or inline. Effects sync to external systems only.
- **No `useState` cluster > 5 fields** in one component. Use `useReducer` or split.
- **No new markdown at the repo root.** Root holds exactly three: `README.md`, `CLAUDE.md`, `AGENTS.md`.
- **No `eslint-disable`** without a one-line reason.
- **No `console.*`** in feature code.
- **No comment poems.** Comment only when intent isn't obvious from the code — short, single sentence. If a comment explains WHAT the code does, rename instead.

## MUST

- **New pages are Server Components by default.** `"use client"` requires a one-line justification. Data fetching in the server component; interactive bits become client islands. Recipe 6.
- **Forms use `react-hook-form` + `zod`** (schemas in `src/lib/validation/schemas.ts`). Plain `useState` only for ≤ 4 fields with no validation.
- **Mutations go through React Query hooks in `src/lib/react-query/hooks/`.** The hook owns the toast and the invalidation. Consumers don't fire their own toast.
- **Query keys come from `src/lib/react-query/keys.ts`** — never inline.
- **Backend API functions** live in `src/lib/<area>/<action>.ts`, use `authenticatedFetch`, return `{ success, data?, error? }`.
- **Sync all three locales** (`en`, `hy`, `ru`) when adding a translation key. See recipe 9 for Armenian/Russian morphology traps.
- **RBAC via the helpers** in `src/lib/rbac/` (`hasPermission`, `canAccessAdminPanel`, `isAdmin`). Never compare role strings.
- **Names follow Clean Code** — intent revealed, no noise words (`data`/`info`/`tmp`/`result`/`manager`/`helper`), no abbreviations except well-known (`url`/`id`/`api`/`vin`/`usd`/`cm3`), one verb per concept, booleans `is`/`has`/`can`/`should`, functions are verbs, components are nouns. Recipe 13.

## Where things live

| Need | Location |
|---|---|
| Canonical exemplars | [`docs/patterns/recipes.md`](docs/patterns/recipes.md) |
| Auth subsystem | [`docs/architecture/auth.md`](docs/architecture/auth.md) |
| Open audit findings | [`docs/AUDIT_2026-05-12.md`](docs/AUDIT_2026-05-12.md) |
| Schemas / query keys / RBAC | `src/lib/validation/`, `src/lib/react-query/keys.ts`, `src/lib/rbac/` |

## Fragile areas (verify after any change)

- **`src/components/pages/home/ShippingMap.tsx`** — two tabs, separate desktop and mobile viewports. Changing `mapDimensions`, projection `scale`, `center`, or `DEFAULT_ZOOM` requires re-checking all 10 origins and 10 destinations stay in viewport on both breakpoints.
- **Sonner toast styling** (`ui/sonner.tsx` + `globals.css` sonner block) — specificity tuned to beat sonner's runtime styles. No `!important` shortcuts.
- **`src/lib/auth/token.ts`** — refresh lock prevents thundering-herd 401s. **Known bug:** subscribers leak on refresh failure (audit 1.2).
- **`src/lib/import-calculator/*`** — engine volume must be normalized to **cm³** before any tier check. The 18 files are interdependent.

## Stack

Next.js 14 App Router, TanStack Query, next-intl (`hy` default), Tailwind class-based dark mode, Radix primitives in `src/components/ui/`. No tests yet. Path alias `@/*` → `src/*`. Build: `npm run dev`/`build`. Verify: `npm run type-check && npm run lint`.
