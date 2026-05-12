# src/components/admin — Admin deltas

Layered on root `CLAUDE.md` and `src/app/CLAUDE.md`. Only admin-specific rules.

## Rules

- **Admin layout (`src/app/[locale]/admin/layout.tsx`) auto-applies** — provides sidebar, topbar, mobile nav, login modal, notification popup. Don't render your own.
- **Gate admin pages with `<ProtectedRoute requireAdmin>`** until middleware auth lands (audit 1.1).
- **Modal shape:** Props `{ isOpen, onClose, onSuccess? }`. Parent owns `isOpen`. Modal calls the mutation hook. Calls `onClose()` and `onSuccess?.()` after success.
- **Admin state hooks live in `src/hooks/admin/`** — they wrap React Query hooks plus local modal/selection state.
- **No `@radix-ui/themes`** — existing files using it are audit 3.3 cleanup.
- **No mega-modals.** Over 500 lines is an anti-pattern (current `UpdateCarModal.tsx` at 910 is the bad example). Split by section.

## Pattern map

| Concern | Location |
|---|---|
| Admin page | `src/components/admin/pages/AdminXPage.tsx` |
| Table view | `src/components/admin/views/XView.tsx` |
| Create/update modal | `src/components/admin/modals/{Create,Update}XModal.tsx` |
| State hook | `src/hooks/admin/useAdminXState.ts` |
| Mutation hook | `src/lib/react-query/hooks/useX.ts` |
| API function | `src/lib/admin/<action>X.ts` |
| Schema | `src/lib/admin/schemas/x.schema.ts` |

## Exemplars

- Page: `pages/AdminUsersPage.tsx` · View: `views/UsersView.tsx`
- Modal: `modals/UpdateAvailableCarModal.tsx` (RHF + Zod + photo upload + mutation hook)
- State: `src/hooks/admin/useAdminUsersState.ts` · Mutation: `src/lib/react-query/hooks/useUsers.ts`
