# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint
npm run lint:fix     # Run ESLint with auto-fix
npm run type-check   # TypeScript check without emitting
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with dark mode (class-based)
- **UI Components**: Radix UI primitives with shadcn/ui patterns
- **State Management**: TanStack React Query for server state
- **Forms**: React Hook Form + Zod validation (Formik exists for legacy)
- **i18n**: next-intl with 3 locales (hy, en, ru)
- **Notifications**: sonner for toasts

### Project Structure

```
src/
├── app/[locale]/           # Next.js App Router (locale-prefixed routes)
│   ├── admin/              # Admin panel routes (RBAC protected)
│   ├── cars/               # Cars listing + detail pages
│   ├── calculator/         # Import calculator
│   └── partners/           # Partners page
├── components/
│   ├── ui/                 # Reusable UI primitives (shadcn/ui style)
│   ├── admin/              # Admin-specific components
│   ├── pages/              # Page-level components
│   └── layouts/            # Container, SectionHeader
├── lib/
│   ├── admin/              # Admin API functions (CRUD for cars, users, shipping)
│   ├── auth/               # Token management (JWT with refresh logic)
│   ├── react-query/        # Query client, keys, hooks
│   ├── rbac/               # Role-based access control
│   ├── import-calculator/  # Vehicle tax calculation logic
│   └── validation/         # Zod schemas
├── hooks/                  # Custom React hooks
├── contexts/               # React Context providers (UserContext, QueryProvider)
├── messages/               # i18n JSON files (en.json, ru.json, hy.json)
└── i18n/                   # next-intl configuration
```

### Key Architectural Patterns

**Provider Hierarchy** (src/app/[locale]/layout.tsx):
```
NextIntlClientProvider → QueryProvider → ThemeProvider → UserProvider → SiteShell
```

**React Query Configuration**:
- Query keys defined in `src/lib/react-query/keys.ts`
- Hooks in `src/lib/react-query/hooks/` (useAuth, useCars, useUsers, useShipping)
- Default stale time: 5 minutes, gc time: 30 minutes

**Authentication**:
- Token management in `src/lib/auth/token.ts`
- `authenticatedFetch` wrapper handles Bearer tokens and auto-refresh on 401
- User context provides auth state via `useUser()` hook

**RBAC System** (src/lib/rbac/):
- Roles: ADMIN, MANAGER, SUPPORT, VIEWER, USER
- Permission matrix in `permissions.ts`
- Hooks: `usePermission()`, `useRole()`, `useCanAccessAdminPanel()`

**Localization**:
- All routes are locale-prefixed: `/{locale}/...`
- Default locale: `hy` (Armenian)
- Messages loaded from `src/messages/{locale}.json`
- Use `useTranslations()` hook from next-intl

**API Backend**:
- Base URL: `https://prime-auto-backend-production.up.railway.app` (defined in `src/i18n/config.ts`)
- Image hosting: Railway storage

### Import Alias
Use `@/*` for imports from `src/` directory.

### Hardcoded Data
- **COPART shipping prices**: `src/lib/import-calculator/copartShippingData.ts` contains hardcoded shipping prices from COPART auction cities to Gyumri (Armenia). Includes US cities (via Houston/LA/NY/Savannah ports), Seattle-Poti route, and Canada cities (via Toronto-Poti). This is fallback data - live prices are fetched from the API.
- **Auction fees**: `src/lib/import-calculator/auctionFees.ts` contains COPART and IAAI fee structures (gate fees, bid fees, title shipping, environmental fees) with tiered pricing based on vehicle price.

## Conventions

- UI components use Radix UI + Tailwind with dark mode support via `dark:` classes
- Skeleton components in `src/components/ui/skeletons/` for loading states
- Form validation uses Zod schemas in `src/lib/validation/schemas.ts`
- Admin routes protected by RBAC components in `src/components/rbac/`
- API functions return `{ data: {...} }` structure
- Mutations invalidate relevant query keys for cache updates
