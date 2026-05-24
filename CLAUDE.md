# CLAUDE.md

AI-agent guide for this repo. Read top to bottom before edits. For non-Claude tools, `AGENTS.md` redirects here. Operational rules: [`.claude/AI_AGENT_OPS.md`](./.claude/AI_AGENT_OPS.md).

@.claude/AI_AGENT_OPS.md

---

## 1. What this is

`primecars.am` — Armenian vehicle-import platform. Marketing site + import-cost calculator + customer car listings + RBAC-protected admin panel. Frontend: Vercel. Backend: Google Cloud Run (me-west1). Stack visible from `package.json` (Next.js 14 App Router, TanStack Query, next-intl, Tailwind, Radix/shadcn, sonner, react-hook-form + zod, resend).

---

## 2. Commands

```bash
npm run dev          # http://localhost:3000
npm run build        # production (next-sitemap postbuild)
npm run lint         # ESLint
npm run lint:fix     # ESLint --fix
npm run type-check   # TypeScript --noEmit
```

No tests. Verification = `type-check && lint` + browser smoke.

---

## 3. Non-obvious choices

- Theme: **homegrown context** at `src/components/ThemeContext.tsx`, NOT `next-themes`.
- Sonner CSS specificity (0,3,0) in `globals.css` `.app-toaster` is deliberately tuned to beat sonner's runtime styles — never use `!important`.
- `formik` and `zod-formik-adapter` remain in `package.json` but are removed from `src/`. Do not reintroduce.
- Default locale: `hy`. All routes locale-prefixed.
- Import alias: `@/*` → `src/*`.

---

## 4. Where things live

- Routes: `src/app/[locale]/**` (admin under `/admin/`). Next API: `src/app/api/`.
- Components: `src/components/{ui,layouts,admin,pages,calculator,rbac}/`.
- Data layer: `src/lib/react-query/hooks/`, `src/lib/admin/`, `src/lib/cars/`, `src/lib/public/` (SSR).
- Business logic: `src/lib/{auth,rbac,validation,import-calculator,seo,utils}/`.
- i18n: `src/messages/{en,hy,ru}.json`, `src/i18n/config.ts`.

Deep-dive docs in `docs/`. Scoped CLAUDE.md files: see §13.

---

## 5. Providers

`src/app/[locale]/layout.tsx`: `NextIntlClientProvider → QueryProvider → ThemeProvider → UserProvider → SiteShell`. All `useTheme`/`useUser`/`useTranslations`/React Query hooks require this hierarchy.

---

## 6. Rules

### Theme
- `useTheme` from `@/components/ThemeContext` → `{ theme, toggleTheme, setTheme }`. Throws outside `<ThemeProvider>`. (Hook blocks `next-themes` imports.)

### Toasts (sonner)
- `toast.success(t("...Title"), { description: t("...Description") })`.
- **Mutation hook owns the toast** — parent/modal does NOT also fire one for the same action.
- Keys: `auth.toasts.*`, `admin.toasts.*`, `applyPage.*`. Fallback: `common.unexpectedError`.

### i18n
- `const t = useTranslations("namespace"); t("yourKey")`. Default locale `hy`.
- Keys must exist in all 3 of `src/messages/{en,hy,ru}.json`. (Hook enforces.)
- Morphology rules → `src/messages/CLAUDE.md`.

### Auth + API
- `authenticatedFetch` from `src/lib/auth/token.ts` for backend calls. Exceptions: login bootstrap, public listings, Next API routes, the auth machinery itself.
- Don't simplify the single-flight refresh lock in `token.ts` — it prevents thundering-herd 401s.
- `API_BASE_URL` from `@/i18n/config`.

### Forms
- `react-hook-form` + `zod`. Schemas in `src/lib/validation/schemas.ts`. Plain `useState` OK for ≤4-field forms.

### Modals
- Props: `{ isOpen, onClose, onSuccess?, ...entity }`. Parent owns open state. Mutation hook owns toast.

### RBAC
- 5 roles: `ADMIN`, `MANAGER`, `SUPPORT`, `VIEWER`, `USER`. Matrix: `src/lib/rbac/permissions.ts`.
- Use helpers: `hasPermission`, `isAdmin`, `canAccessAdminPanel`. They normalize case.

### React Query
- Keys from `src/lib/react-query/keys.ts` factory (`queryKeys.cars.admin.list(filters)`).
- Defaults: `staleTime: 15min`, `gcTime: 30min`, no retry on 401/403/404.
- Mutations `invalidateQueries({ queryKey: queryKeys.<scope>.all })` on success.

---

## 7. Integrations

Backend: Google Cloud Run (me-west1) via `src/i18n/config.ts`. Email: Resend. Images: Railway + GCS in `next.config.js` `remotePatterns`. Maps: world-atlas CDN in ShippingMap. Sitemap: `next-sitemap.config.js`. Env vars: `docs/ENV.md`.

---

## 8. Fragile areas — explicit confirmation required before edits

- `src/components/pages/home/ShippingMap.tsx` — viewport/zoom/projection tuned across all origin/destination markers.
- `src/components/ui/sonner.tsx` + sonner block in `src/app/globals.css` — CSS specificity tuned to beat sonner runtime.
- `src/lib/auth/token.ts` — refresh lock.
- `src/lib/import-calculator/**` — interdependent tax math. See scoped CLAUDE.md.

---

## 9. Pitfalls (real bugs not caught by hooks)

1. Double-firing toasts (modal AND mutation hook). Mutation hook owns.
2. Bare `fetch` to backend bypasses token refresh.
3. Editing `ShippingMap.tsx` mobile zoom without re-checking markers.
4. `--no-verify` / `--no-gpg-sign` — never unless explicitly authorized.

Imports of `next-themes`/Formik and locale-parity drift are blocked by hooks; no prose enforcement needed.

---

## 10. Refactor discipline

- Refactor changes structure, not behavior. New features → separate branch.
- One concern per commit. Order: data → business → UI.
- `type-check && lint` after every commit. Visual smoke before merge.
- Fragile areas (§8) require user confirmation.
- Don't propagate patterns in `.claude/TECH_DEBT.md`. Implement correctly and flag existing copies.
- PR cap 400 LOC (`/pre-pr`). Override with `--allow-large` only when atomic.

Procedures: `.claude/skills/extract-from-mixed-file/`, `.claude/skills/dedupe/`. Run `recon` on files over 100 LOC.

---

## 11. Next.js 14 patterns

- Server Components by default. `"use client"` only when state/effects/refs/handlers/browser APIs or hooks like `useUser`/`useTheme`/`useTranslations` require it.
- All routes under `src/app/[locale]/`.
- Data: SSR via `src/lib/public/`. Auth CRUD via React Query hooks + `authenticatedFetch`.
- `next/image` for images. `Link` from next-intl (not `next/link`).
- Metadata via `generateMetadata`; helpers in `src/lib/seo/`.
- Co-located `loading.tsx` / `error.tsx` per route segment.
- Server Components render Client Components, not the reverse. Pass via `children`/props.

---

## 12. Reusable components

Rule of three: pattern in 3+ places → extract. 2 copies → leave alone.

Grep `src/components/` before creating a new component.

Location:
- Generic primitive → `src/components/ui/`
- Layout → `src/components/layouts/`
- Domain-shared → `src/components/<domain>/` or `pages/<scope>/`
- Admin-shared → `src/components/admin/{primitives,cards,filters}/`
- Route-local → `src/components/pages/<route>/`

Constraints:
- PascalCase. File name = component name. `<Name>Props` at top.
- Does NOT fetch data; does NOT own URL/locale state.
- Prop count ≤ 7. No `any`. No `useEffect` for derived state — `useMemo`.

When refactoring an oversized file, extract INTO an existing component if one fits.

---

## 13. Scoped memory

Auto-load (directory-level):
- `src/lib/import-calculator/CLAUDE.md` — tax engine internals, engine-volume rule.
- `src/messages/CLAUDE.md` — Armenian/Russian morphology, namespaces.

On-demand (skills or by request):
- `.claude/RECIPES.md` — feature scaffolding recipes.
- `.claude/TECH_DEBT.md` — live debt registry.
- `docs/ENV.md` — env vars.
