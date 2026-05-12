# src/app — App Router deltas

Layered on root `CLAUDE.md`. Only rules that are stricter or specific to this tree.

## Rules

- **`generateMetadata`** lives in the route segment (`page.tsx`), not the page component. Use `getTranslations({ locale, namespace })` from `next-intl/server` + `createPageMetadata` from `@/lib/seo`.
- **`generateStaticParams` + `dynamicParams = false`** on the `[locale]` layout. Don't change.
- **All routes live under `[locale]/`.** `next-intl` middleware (`src/middleware.ts`) handles redirects. Never add manual locale redirects in `next.config.js`.
- **No bare `<head>` modifications.** Use `metadata` + `viewport` exports. The manual `<meta name="viewport">` at `[locale]/layout.tsx:100` is a known bug — don't replicate.

## Anti-patterns in this tree (don't copy)

- **SPA-shell:** `[locale]/cars/page.tsx` is a one-liner that renders the 539-line `"use client"` `CarsPage.tsx`. No SSR for SEO. Audit 2.1. Follow `HomePage.tsx`, not `CarsPage.tsx`.
- **Client-side admin auth:** `[locale]/admin/layout.tsx` gates with `useUser()` + `LoginModal`. Admin code ships to every visitor. Audit 1.1. Until middleware auth lands, gate pages with `<ProtectedRoute requireAdmin>`.

## Exemplars

- Public page: `src/components/pages/HomePage.tsx` (Server Component, server-fetched).
- Admin page: `src/app/[locale]/admin/users/page.tsx`.
- Metadata: `src/lib/seo/index.ts` → `createPageMetadata`, `SITE_NAME`, `SITE_URL`.
- Locale config: `src/i18n/config.ts` → `locales`, `defaultLocale`, `API_BASE_URL`.
