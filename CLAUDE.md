# CLAUDE.md

Guidance for AI agents (Claude Code, Cursor, Aider, Codex CLI, etc.) working in this repository. Read this top-to-bottom before making changes — it captures the conventions and gotchas that aren't obvious from the code alone.

For non-Claude tools, `AGENTS.md` redirects here.

---

## 1. Project at a glance

- **What**: `primecars.am` — Armenian vehicle-import platform. Public marketing site + import-cost calculator + customer-facing car listings, plus a full RBAC-protected admin panel for managing cars, users, shipping prices, and notifications.
- **Stack**: Next.js 14 (App Router) + TanStack Query + next-intl (`hy`/`en`/`ru`, default `hy`) + Tailwind + Radix/shadcn UI + sonner toasts.
- **Where it runs**: Frontend on **Vercel** (DNS via `ns{1,2}.vercel-dns.com`). Backend (auth, cars, users, shipping) on **Google Cloud Run** (me-west1). Image hosting on Railway + Google Cloud Storage. Email via Resend.

---

## 2. Build & development commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build (also runs next-sitemap postbuild)
npm run start        # Serve production build
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
npm run type-check   # TypeScript check, no emit
```

No test framework is configured — there is no `jest`, `vitest`, or `playwright` setup. Manual verification = `npm run type-check && npm run lint` plus a browser smoke test.

---

## 3. Tech stack (libraries you'll actually touch)

| Concern | Library | Where |
|---|---|---|
| Framework | `next@14` App Router | `src/app/[locale]/**` |
| i18n | `next-intl` | `src/i18n/`, `src/messages/{en,hy,ru}.json` |
| Server state | `@tanstack/react-query` | `src/lib/react-query/` |
| UI primitives | Radix UI + shadcn patterns | `src/components/ui/` (~50 files) |
| Styling | Tailwind CSS, class-based dark mode | `tailwind.config.ts`, `src/app/globals.css` |
| Forms (new) | `react-hook-form` + `zod` | `src/lib/validation/schemas.ts` |
| Forms (legacy) | Formik — **don't add new Formik code** | `*Formik.tsx` files |
| Toasts | `sonner` | `src/components/ui/sonner.tsx` + globals.css block |
| Theme | **Homegrown context, NOT `next-themes`** | `src/components/ThemeContext.tsx` |
| Maps | `react-simple-maps` + world-atlas CDN | `src/components/pages/home/ShippingMap.tsx` |
| Email | `resend` | `src/app/api/registration-request/route.ts` |
| Icons | `lucide-react`, `react-icons` | scattered |

Import alias: `@/*` resolves to `src/*`.

---

## 4. Project structure

```
src/
├── app/
│   ├── [locale]/              # All user-facing routes are locale-prefixed
│   │   ├── (home page)        # LandingPage
│   │   ├── cars/              # Public listing
│   │   ├── cars/[id]/         # Public car detail
│   │   ├── calculator/        # Import-cost calculator
│   │   ├── apply/             # Customer registration form
│   │   ├── partners/          # Partners page
│   │   └── admin/             # 7 RBAC-protected admin pages:
│   │                          #   /, cars, available-cars, users,
│   │                          #   notifications, settings, calculator
│   └── api/
│       └── registration-request/route.ts   # Resend-backed email POST
│
├── components/
│   ├── ui/                    # ~50 Radix/shadcn primitives + ErrorMessage, sonner.tsx
│   ├── admin/
│   │   ├── cards/  filters/  modals/  pages/  primitives/  views/
│   │   ├── AdminSidebar.tsx  AdminSidebarContent.tsx
│   │   ├── AdminTopbar.tsx   AdminPreferencesMenu.tsx
│   ├── pages/                 # HomePage, CarsPage, CarDetailsPage, CalculatorPage, ApplyPage, PartnersPage
│   │   ├── cars/              # Page-local components (e.g., Spec.tsx)
│   │   └── home/              # Home subsections (HeroSection, ServicesSection, ShippingMap, …)
│   ├── layouts/               # Container (max-w-1440 + px-12), SectionHeader
│   ├── calculator/            # Calculator-specific UI
│   ├── rbac/                  # Access-gating wrappers
│   ├── ThemeContext.tsx       # Theme state — DON'T replace with next-themes
│   ├── LoginModal.tsx         # Auth entry point
│   └── ...
│
├── lib/
│   ├── admin/                 # 28 admin API functions (CRUD via authenticatedFetch)
│   ├── auth/                  # Token storage + auto-refresh (token.ts)
│   ├── cars/                  # Public car-list fetchers
│   ├── react-query/           # client.ts (defaults), keys.ts, hooks/ (useAuth, useCars, useUsers, useShipping)
│   ├── rbac/                  # Roles + permission matrix
│   ├── validation/            # Zod schemas
│   ├── import-calculator/     # 18 files: tax engines + COPART fee/shipping data
│   ├── seo/                   # SEO metadata helpers
│   ├── theme/                 # Theme helpers
│   ├── utils/                 # General utilities
│   └── public/                # Public fetchers (e.g., fetchHomeCars)
│
├── hooks/
│   ├── useCarDetails.ts  useCarsPage.ts  useMediaQuery.ts  useSortedCars.ts
│   └── admin/                 # 12 admin form/state hooks (some have *Refactored.ts duplicates)
│
├── contexts/                  # UserContext, QueryProvider
├── messages/                  # en.json, hy.json, ru.json — ~1,330 keys each, KEEP IN SYNC
└── i18n/                      # next-intl: config.ts (incl. API_BASE_URL), routing.ts, request.ts
```

Top-level config files: `next.config.js`, `tailwind.config.ts`, `tsconfig.json` (`@/*` alias, strict mode, ES2022), `postcss.config.js`, `eslint.config.json` (extends `next/core-web-vitals` + `next/typescript`), `next-sitemap.config.js`. No `vercel.json` — zero-config Next.js deploy. No Prettier or `.editorconfig`.

Deep-dive markdown docs live in `docs/`:
- `docs/AUTHENTICATION_SYSTEM.md` — auth flows + token refresh
- `docs/TOKEN_REFRESH_GUIDE.md` — refresh internals
- `docs/COMPLETE_LOCALIZATION_SUMMARY.md` — i18n migration history
- `docs/MASTER_REFACTORING_SUMMARY.md` — refactor history
- `docs/QUICK_START.md` — onboarding for humans

---

## 5. Provider hierarchy

Defined in `src/app/[locale]/layout.tsx`:
```
NextIntlClientProvider → QueryProvider → ThemeProvider → UserProvider → SiteShell
```
`useTheme`, `useUser`, `useTranslations`, and React Query hooks all require this hierarchy.

---

## 6. Critical patterns (DO / DON'T)

### Theme
- ✅ `import { useTheme } from "@/components/ThemeContext"` → returns `{ theme: "light" | "dark", toggleTheme, setTheme }`.
- ❌ Don't `import { useTheme } from "next-themes"`. This repo never uses next-themes; it has its own localStorage-backed context. `useTheme()` throws if called outside `<ThemeProvider>`.

### Toasts (sonner)
- ✅ `import { toast } from "sonner"`. Title as first arg, description in options: `toast.success(t("...Title"), { description: t("...Description") })`.
- ✅ Translation keys live under `auth.toasts.*`, `admin.toasts.*`, or `applyPage.*`. Generic fallback: `common.unexpectedError`.
- ✅ Sonner's CSS is anchored on `.app-toaster` in `src/app/globals.css` and scoped via `[data-sonner-theme="light"|"dark"]` so we beat sonner's runtime-injected styles. The `<Toaster>` in `src/components/ui/sonner.tsx` syncs `theme` from `useTheme()`.
- ❌ **Don't double-fire.** If a mutation hook (`useCreateCar`, `useUpdateAvailableCar`, etc.) fires a toast in `onSuccess`, the calling page/modal must NOT also fire one. Single source of truth per action. Recent example fix: `AdminAvailableCarsPage` used to fire `toast.success(carUpdated)` while the modal already did — caused a visible double toast.

### i18n
- ✅ `const t = useTranslations("admin.toasts")`. Default locale is `hy`. All routes are locale-prefixed (`/hy/...`, `/en/...`, `/ru/...`).
- ✅ **Sync all 3 locales** (`en.json`, `hy.json`, `ru.json`) when adding a key. Missing translations break renders.
- ⚠️ Armenian definite article `-ն` (after vowel) vs `-ը` (after consonant) depends on the noun. If a string concatenates a placeholder like `{name}-ը`, the suffix will be wrong for any name ending in a vowel. **Fix by attaching the article to a surrounding fixed noun** (e.g., `"{name} օգտատերը …"` — article on `օգտատեր`, not on `name`).
- ⚠️ Russian past-tense and participles agree on grammatical gender. Avoid per-user gendering by restructuring around a masculine noun (e.g., `"Пользователь {name} добавлен"` — the participle agrees with `Пользователь`, gender-neutral for any actual person).

### Auth + API
- ✅ Use `authenticatedFetch(url, options)` from `src/lib/auth/token.ts` for any backend call. It injects the Bearer token, intercepts 401, calls `refreshAccessToken()`, and retries.
- ✅ Token storage is `localStorage` (`access_token`, `refresh_token`).
- ✅ Refresh is debounced (a single in-flight refresh — concurrent 401s wait for it). Don't simplify this lock.
- ❌ Don't use bare `fetch` for backend calls — you'll get silent 401s and won't trigger refresh.
- API base URL: `src/i18n/config.ts` → `API_BASE_URL = "https://prime-auto-backend-622391373915.me-west1.run.app"` (Google Cloud Run me-west1). Most call sites `import { API_BASE_URL } from "@/i18n/config"`. One outlier: `src/lib/public/fetchHomeCars.ts` reads `process.env.NEXT_PUBLIC_API_BASE_URL || ""` instead.

### React Query
- ✅ Query keys live in `src/lib/react-query/keys.ts` as a factory: `queryKeys.cars.admin.list(filters)`.
- ✅ Defaults in `src/lib/react-query/client.ts`: `staleTime: 15min`, `gcTime: 30min`, **no retry on 401/403/404**, `refetchOnWindowFocus: false`, `refetchOnReconnect: true`, mutations don't retry.
- ✅ Mutations invalidate on success: `queryClient.invalidateQueries({ queryKey: queryKeys.cars.all })`.
- ❌ Don't bake retries onto a 401 — token refresh already handles that.

### RBAC
- 5 roles: `ADMIN`, `MANAGER`, `SUPPORT`, `VIEWER`, `USER`. Matrix in `src/lib/rbac/permissions.ts`.
- ✅ Use helpers: `hasPermission({ role, permission })`, `canAccessAdminPanel({ role })`, `isAdmin({ role })`.
- ✅ Role strings are case-insensitive — the helpers normalize. Don't compare strings yourself.
- Hooks: `usePermission()`, `useRole()`, `useCanAccessAdminPanel()`.

### Forms
- ✅ New forms: `react-hook-form` + `zod`. Schemas live in `src/lib/validation/schemas.ts`. Example: `UpdateAvailableCarModal.tsx`.
- ✅ Plain `useState` is acceptable for ≤4-field forms (e.g., `ApplyPage.tsx`).
- ❌ Don't add new Formik. Legacy `*Formik.tsx` files exist and should not grow.

### Modals
Typical shape:
```ts
type Props = { isOpen: boolean; onClose: () => void; onSuccess?: () => void; /* + entity */ };
```
- ✅ Modal calls a mutation hook. The hook handles the toast and query invalidation.
- ✅ Modal calls `onClose()` and the optional `onSuccess()` callback after the mutation resolves.
- ❌ Don't manage open state inside the modal — parent owns it.
- ❌ Don't toast in the parent if the hook (or modal) already does.

---

## 7. External integrations

| Service | Purpose | Where configured |
|---|---|---|
| Google Cloud Run (me-west1) | Primary backend (auth, cars, users, shipping, calculator) | `src/i18n/config.ts:15` |
| Resend | Apply-page registration emails | `src/app/api/registration-request/route.ts` |
| Railway storage + GCS | Car/image hosting | `next.config.js` `images.remotePatterns` |
| Unsplash | Demo/fallback images | `next.config.js` `images.remotePatterns` |
| world-atlas CDN (`cdn.jsdelivr.net/npm/world-atlas@2`) | ShippingMap topology | `src/components/pages/home/ShippingMap.tsx:19` |
| next-sitemap | Post-build sitemap generation | `next-sitemap.config.js` |

---

## 8. Environment variables

`.env.local` is git-ignored; `.env.local.example` documents the shape.

**Resend (email)** — required for the Apply form to actually send mail; route returns 503 otherwise:
- `RESEND_API_KEY` — required.
- `REGISTRATION_NOTIFICATION_EMAIL` — defaults to `geghamsimonyan08@gmail.com`.
- `RESEND_FROM_EMAIL` — defaults to `onboarding@resend.dev` (Resend's shared test sender). Swap to a verified-domain sender (e.g., `team@primecars.am`) in production via Resend's auto-configure → Vercel integration.

**Public (`NEXT_PUBLIC_*`)** — exposed to browser:
- `NEXT_PUBLIC_API_BASE_URL` — only read by `src/lib/public/fetchHomeCars.ts` (every other call site imports `API_BASE_URL` from `@/i18n/config`).
- `NEXT_PUBLIC_SITE_URL` — defaults to `https://primecars.am`; affects SEO + sitemap.
- `NEXT_PUBLIC_MAINTENANCE_MODE` — set to `"true"` to enable maintenance gating.

Set production values in Vercel project settings (Production + Preview + Development) and redeploy — Vercel reads env vars at build time.

---

## 9. Hardcoded data

`src/lib/import-calculator/` contains the tax/fee/shipping math. Most data is **fallback** — live values come from the backend, hardcoded data exists for offline / pre-API-call estimates.

| File | What |
|---|---|
| `copartShippingData.ts` | COPART US/Canada → Gyumri shipping prices (via Houston/LA/NY/Savannah/Seattle-Poti/Toronto-Poti) — fallback only |
| `auctionFees.ts` | COPART + IAAI gate/bid/title/environmental fee tiers |
| `truckTaxConstants.ts`, `quadricycleTaxConstants.ts` | Per-vehicle-type tax tiers |
| `calculate{Vehicle,Truck,Motorcycle,JetSki,Snowmobile,Quadricycle}Taxes.ts` | Vehicle-type-specific tax engines |
| `calculateAge.ts`, `calculateEnvironmentalTax.ts`, `normalizeEngineVolume.ts` | Shared math (engine volume normalizes to **cm³** — critical for tax tier math) |
| `vehicleCalculators.ts` | Dispatch by vehicle category |
| `fetchExchangeRates.ts`, `fetchShippingPrices.ts`, `fetchShippingCitiesPublic.ts` | Live data |

---

## 10. Fragile / recently tuned areas

Touch with care; verify visually before committing.

- **`src/components/pages/home/ShippingMap.tsx`** — Two tabs ("from"/"to") each have separate desktop and mobile viewports (`VIEWPORTS` const) plus separate default zooms (`DEFAULT_ZOOM` const). The `useEffect` that depends on `isMobile` re-syncs zoom + center when the breakpoint crosses so all markers stay visible. Changing any of `mapDimensions`, projection `scale`, `center`, or `DEFAULT_ZOOM` requires re-verifying all 10 origins ("from" tab) and 10 destinations ("to" tab) stay inside the visible viewBox at default zoom.
- **`src/components/ui/sonner.tsx` + `src/app/globals.css` (sonner block)** — CSS specificity tuned to (0,3,0) via `.app-toaster[data-sonner-toaster][data-sonner-theme="..."]` to beat sonner's (0,2,0) runtime-injected styles. The close-button position uses sonner's CSS vars (`--toast-close-button-start/end/transform`), not raw `left`/`right`. Don't shortcut with `!important`.
- **`src/lib/auth/token.ts`** — Debounced refresh prevents thundering-herd 401s. The `pendingRefresh` promise lock matters.
- **`src/lib/import-calculator/*`** — 18 interdependent files; engine volume in cm³ feeds every tier check.
- **`src/messages/{en,hy,ru}.json`** — Armenian morphology / Russian gender bugs reappear when keys are translated mechanically. See section 6 for the safe patterns.

---

## 11. Common pitfalls

Distilled from real bugs in this repo:

1. **Importing `useTheme` from `next-themes`** — wrong; use `@/components/ThemeContext`. `resolvedTheme` will be `undefined`.
2. **Double-firing toasts** — modal + parent both calling `toast.success`. Make one party authoritative.
3. **Updating only `en.json`** — missing `hy.json` / `ru.json` entries break renders in those locales.
4. **Using bare `fetch` for backend calls** — bypasses token refresh; 401s become silent failures.
5. **`{name}-ը` in Armenian strings** — produces wrong suffix when `name` ends in a vowel. Move the article onto a surrounding noun.
6. **Adding Formik to a new form** — use `react-hook-form` + `zod` instead.
7. **Editing ShippingMap mobile zoom without re-checking markers** — drops Rotterdam (4°E) or Salalah (17°N) outside the viewport.
8. **Adding a `toast.success` after a mutation hook that already toasts** — see #2.
9. **Skipping a hook (`--no-verify`, `--no-gpg-sign`)** — never do this unless the user explicitly asks.
10. **Creating a new `docs/` markdown for a feature you implemented** — only create docs when asked; CLAUDE.md is the entry point.

---

## 12. Conventions

- Edit existing files; don't create new ones unless required.
- No comments unless WHY is non-obvious. Don't restate what the code says.
- No backwards-compat shims, `// removed for X` placeholders, or unused `_var` renames. Delete what's unused.
- Skeleton components for loading states live in `src/components/ui/skeletons/`.
- API responses generally use `{ data: {...} }` shape; unwrap consistently.
- Admin routes gated by wrappers in `src/components/rbac/`.
- All locale-prefixed paths must round-trip cleanly through next-intl's `Link`.

---

## 13. Quick recipes

**Adding a new translation key:**
1. Add to `src/messages/en.json` under the appropriate namespace.
2. Add equivalent keys to `hy.json` and `ru.json` — watch morphology/gender.
3. Use via `const t = useTranslations("namespace"); t("yourKey")`.

**Adding a new admin API call:**
1. Create `src/lib/admin/yourAction.ts` that imports `API_BASE_URL` + `authenticatedFetch` and returns `{ data }` or throws.
2. Add a hook in `src/lib/react-query/hooks/` that wraps it with `useMutation`/`useQuery` and invalidates relevant `queryKeys.*` on success.
3. Add the toast inside the hook's `onSuccess`/`onError`, not in the calling component.

**Adding a new modal:**
1. Create `src/components/admin/modals/YourModal.tsx` with `{ isOpen, onClose, onSuccess? }` props.
2. Use `react-hook-form` + `zod` for the form.
3. Call the mutation hook from step 2 of the previous recipe. Don't fire toasts manually.

**Adding a new public page:**
1. Create `src/app/[locale]/your-route/page.tsx`.
2. Implement the page component under `src/components/pages/YourPage.tsx`.
3. Add nav entry in `src/lib/site-nav.ts` if user-facing.
4. Add metadata via `generateMetadata` for SEO.
