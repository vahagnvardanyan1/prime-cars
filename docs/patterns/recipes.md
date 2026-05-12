# Patterns and recipes

Canonical exemplars for common tasks. **Before writing a new component, find the matching recipe here and follow it exactly.** Pattern consistency is what keeps the codebase reviewable.

Each recipe has four parts:

- **Exemplar** — the canonical file in `src/` that demonstrates the pattern. The exemplar is the source of truth; this doc just points at it.
- **Code** — minimal template you can copy.
- **Why this way** — the reason this is the senior-level pattern, in one or two sentences. So you can defend the choice in a review.
- **Common mistakes** — the anti-patterns Claude routinely produces if not constrained. The `frontend-reviewer` subagent flags these.

If you need a pattern that's not here, add it. A new recipe takes about 10 minutes. Don't write a new component without one.

---

## 1. Fetching data with React Query

**Exemplar:** `src/lib/react-query/hooks/useUsers.ts`, `useCars.ts`

```ts
import { useUsers } from "@/lib/react-query/hooks";

const UsersList = () => {
  const { data, isLoading, error, refetch } = useUsers({
    search: "john",
    role: "user",
  });

  if (isLoading) return <GridSkeleton />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;
  if (!data?.users.length) return <EmptyState />;

  return (
    <div>
      {data.users.map((u) => (
        <div key={u.id}>{u.firstName} {u.lastName}</div>
      ))}
    </div>
  );
};
```

Rules: query keys come from `src/lib/react-query/keys.ts`. Defaults (15 min stale, 30 min gc, no retry on 401/403/404) are in `src/lib/react-query/client.ts`. Dependent queries: `useX(..., { enabled: !!dependency })`.

**Why this way:** Server state has a fundamentally different lifecycle than client state — it lives somewhere else, can be stale, needs invalidation, refetches in the background. React Query is the right abstraction; `useState + useEffect` for backend data is the wrong one. A centralized key factory makes invalidation predictable across the app.

**Common mistakes:**
- `useState + useEffect + fetch` instead of `useQuery`. Always wrong for backend data.
- Inlining query keys as string literals (`["users"]`) — breaks invalidation when you typo, and bypasses central control.
- Skipping the loading/error/empty triad. Every fetched view handles all three.
- Defensive `data?.foo?.bar` chains everywhere instead of returning early on `isLoading` and `error`.

## 2. Forms — react-hook-form + Zod

**Exemplar:** `src/components/admin/modals/UpdateAvailableCarModal.tsx`

Schemas live in `src/lib/validation/schemas.ts` (or alongside the modal for modal-specific shapes, e.g. `src/lib/admin/schemas/availableCar.schema.ts`).

```ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

export const LoginForm = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    // call a mutation hook from recipe 3
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} />
      {errors.email ? <p>{errors.email.message}</p> : null}
      <input type="password" {...register("password")} />
      {errors.password ? <p>{errors.password.message}</p> : null}
      <button type="submit" disabled={isSubmitting}>Sign in</button>
    </form>
  );
};
```

Acceptable shortcut: plain `useState` is fine for forms with ≤ 4 fields and no validation (e.g. `src/components/pages/ApplyPage.tsx`). Anything with validation or 5+ fields uses RHF + Zod. Formik is banned by lint.

**Why this way:** One Zod schema is the single source of truth — shape, validation rules, and TypeScript type (via `z.infer<typeof schema>`) all derive from it. Component code stops needing parallel "what shape" / "what to validate" / "what type to import" declarations. RHF avoids re-rendering the entire form tree on every keystroke, which matters once you have nested inputs.

**Common mistakes:**
- `useState` per field with hand-rolled validation. Drifts and re-renders the world.
- Duplicating the TS type alongside the schema instead of using `z.infer`. Guaranteed to drift.
- Calling `toast.success(...)` from the form's `onSubmit`. The mutation hook owns the toast (recipe 3).
- Disabling the submit button on every validation issue. Frustrating UX. Disable only when submission truly cannot proceed (mid-submit, or required fields empty on first attempt).
- Formik or `zod-formik-adapter` — banned. The lint config will reject the import.

## 3. Mutations — hook owns the toast and the invalidation

**Exemplar:** `src/lib/react-query/hooks/useUsers.ts` → `useCreateUser`, `useUpdateUser`

```ts
// In src/lib/react-query/hooks/useFoo.ts
export const useCreateFoo = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("admin.toasts");

  return useMutation({
    mutationFn: (data: CreateFooData) => createFoo({ data }),
    onSuccess: () => {
      toast.success(t("fooCreatedTitle"), { description: t("fooCreatedDescription") });
      queryClient.invalidateQueries({ queryKey: queryKeys.foo.all });
    },
    onError: (e) => {
      toast.error(t("fooCreateFailedTitle"), { description: e.message });
    },
  });
};
```

```tsx
// In the calling modal — DO NOT fire a toast here
const mutation = useCreateFoo();

const onSubmit = (data: FormData) => {
  mutation.mutate(data, {
    onSuccess: () => {
      onClose();        // close the modal
      onSuccess?.();    // optional parent callback
    },
  });
};
```

**Why this way:** A mutation has consistent side effects everywhere it's used — same toast copy, same cache invalidation, same error handling. Centralizing them in the hook means no consumer can forget one or do it differently. The consumer's only job is "after success, close the modal."

**Common mistakes:**
- Firing the toast in both the hook and the calling component. Double toast.
- Forgetting to invalidate the relevant queries — UI shows stale data after the mutation.
- Hand-rolling `useState({ loading, error }) + fetch + setState` instead of `useMutation`. Loses retry, network status, type inference.
- Performing optimistic cache writes AND invalidating on success. Pick one model (recipe 12).

## 4. Permission checks

**Exemplar:** `src/lib/rbac/permissions.ts`, `src/lib/rbac/hooks.ts`

```tsx
import { ProtectedComponent } from "@/components/rbac/ProtectedComponent";
import { Permission } from "@/lib/rbac/permissions";

<ProtectedComponent permission={Permission.CREATE_USER}>
  <button>Create User</button>
</ProtectedComponent>
```

```ts
import { usePermission, useRole } from "@/lib/rbac/hooks";

const canCreate = usePermission({ permission: Permission.CREATE_USER });
const { isAdmin } = useRole();
```

**Why this way:** Role and permission strings are normalized in one place (case-insensitive, with the role hierarchy). Direct string comparison breaks the moment the backend returns `"Admin"` instead of `"admin"` or someone changes the role taxonomy. The helpers also keep the permission matrix testable as data rather than scattered conditionals.

**Common mistakes:**
- `if (user.role === "admin")` — bypass the helper, get caught by case differences.
- Inlining permission strings instead of using the `Permission` enum.
- Treating frontend permission checks as security. They're UI gates; the backend must still enforce.

## 5. Authenticated API call

**Exemplar:** `src/lib/admin/deleteCar.ts`, `src/lib/admin/createCar.ts`

```ts
import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/auth/token";

type Result =
  | { success: true; data: SomeType }
  | { success: false; error: string };

export const updateThing = async ({ id, data }: { id: string; data: ThingData }): Promise<Result> => {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/things/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.error ?? `Server error: ${response.status}` };
    }

    return { success: true, data: (await response.json()).data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Network error" };
  }
};
```

Bare `fetch` is banned for any backend endpoint. The lint config rejects it. See `docs/architecture/auth.md`.

**Why this way:** `authenticatedFetch` handles the 401-refresh-retry dance automatically. Bare `fetch` silently 401s as soon as the access token expires, which causes random "logout on action" bugs that are extremely hard to reproduce. Returning a `Result` type instead of throwing means callers cannot forget to handle errors — the type system makes them write the `if (!result.success)` branch.

**Common mistakes:**
- Bare `fetch` with manual `Authorization` header from `localStorage`. Will silently fail in production once tokens expire.
- Throwing for expected errors. Use the `Result` discriminated union; throw only for programmer errors.
- Returning `response.json()` directly without checking `response.ok` first. HTTP 500 responses with JSON bodies look like success.
- Forgetting the `try/catch` around the fetch. Network errors crash the caller.

## 6. New public page (Server Component default)

**Exemplar:** `src/app/[locale]/page.tsx` + `src/components/pages/HomePage.tsx`

The route segment (`page.tsx`) is a Server Component. It owns `generateMetadata` and either renders the page component directly or awaits data and passes it down. The page component itself is also a Server Component by default — it calls `fetchX` from `src/lib/` and renders the layout. Only the interactive sub-sections become `"use client"` islands (filters, carousels, maps) and receive data via props.

**Why this way:** Server Components fetch on the server, ship rendered HTML, and don't add JS to the bundle. That means real SEO (the cars are in the initial HTML, not lazy-loaded after hydration) and faster first paint. Pushing `"use client"` as far down the tree as possible — Vercel calls this "the client/server boundary" — is the canonical App Router pattern.

**Common mistakes:**
- One-liner Server Component page that just renders a 500-line `"use client"` page component. This is the SPA pattern in App Router clothing — you get none of the RSC benefits. See `src/components/pages/CarsPage.tsx` for what NOT to do; see `HomePage.tsx` for what to do.
- Fetching data with `useEffect + setState` in a client component when the same fetch could have run on the server.
- Adding `"use client"` at the top of the page just because one component deep in the tree needs a hook. Lift the boundary down: wrap only the leaf in a client component.

## 7. New admin page

**Exemplar:** `src/app/[locale]/admin/users/page.tsx` + `src/components/admin/pages/AdminUsersPage.tsx`

Same structure as recipe 6, but:

- The admin layout (`src/app/[locale]/admin/layout.tsx`) is applied automatically by the route segment.
- Gate the page with `<ProtectedRoute requireAdmin>` until middleware auth lands (tracked in `docs/AUDIT_2026-05-12.md` item 1.1).
- Mutations go through the React Query admin hooks; they handle toasts and invalidation.

**Why this way:** Admin pages share a sidebar, a topbar, a notification gate, and an auth check. Putting them under `app/[locale]/admin/` makes the layout automatic; using the admin hooks means toasts, invalidation, and error handling stay consistent.

**Common mistakes:**
- Forgetting the `<ProtectedRoute requireAdmin>` wrapper. Non-admins reach the page.
- Adding a second sidebar or topbar inside the admin page. The admin layout already provides them.
- Calling raw API functions from the page instead of the corresponding `useX` hook. Loses caching and toast consistency.

## 8. New modal

**Exemplar:** `src/components/admin/modals/UpdateAvailableCarModal.tsx`

```ts
type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  // ... entity-specific props
};
```

Parent owns `isOpen`. Modal calls a mutation hook (recipe 3); the hook owns the toast and invalidation. Modal calls `onClose()` and `onSuccess?.()` after the mutation resolves successfully.

**Why this way:** Modal lifecycle is presentation; mutation effects are domain. Keeping them separate means the modal stays composable (parent can wire it up however it wants) and the mutation stays canonical (always the same toast, always the same invalidation).

**Common mistakes:**
- Modal manages its own `useState(false)` open state. Parent can't programmatically open or close it.
- Toast fired inside the modal's `onSubmit` instead of the mutation hook. Double-toasts when both fire.
- Modal does its own `fetch` instead of using a query hook. Bypasses cache.
- Custom dialog instead of the Radix `<Dialog>` primitive in `@/components/ui/dialog`. Lose focus trap, ESC handling, return-focus.

## 9. Adding a translation key

1. Add the key to `src/messages/en.json` under the appropriate namespace.
2. Add the same key — with a real translation, not an empty string — to `hy.json` and `ru.json`. **Both, every time.**
3. Use in code:

```ts
const t = useTranslations("admin.toasts");
toast.success(t("userCreatedTitle"), { description: t("userCreatedDescription") });
```

**Why this way:** A missing key renders the raw key string in production. Armenian and Russian have morphology traps that catch naive concatenation — they're worth knowing once, then forgetting because you'll structure your strings to avoid them.

**Common mistakes:**
- Adding to `en.json` only. Armenian and Russian users see `admin.toasts.userCreatedTitle` literal.
- **Armenian definite article (`-ը` vs `-ն`)** — depends on the noun's last letter (consonant vs vowel). Don't do `"{name}-ը"` — the suffix is wrong for vowel-ending names. Move the article onto a fixed noun: `"{name} օգտատերը …"` puts the article on `օգտատեր` ("user"), not the variable.
- **Russian past-tense and participles agree with grammatical gender.** Don't do `"{name} добавлен/добавлена"` and pick one. Restructure: `"Пользователь {name} добавлен"` — `добавлен` (masculine) agrees with the fixed noun `Пользователь`, not the variable.
- Translating into the wrong namespace (key collisions silently win the last entry).

## 10. Loading / error / empty states

Every fetched view handles all three. Skeletons live in `src/components/ui/skeletons/`.

```tsx
if (isLoading) return <GridSkeleton />;
if (error) return <ErrorMessage error={error} onRetry={refetch} />;
if (!data?.length) return <EmptyState />;
```

**Why this way:** Designs that only consider the success state are broken in production. Slow networks, empty databases, and 500s are not edge cases — they're the path that determines user trust.

**Common mistakes:**
- A `"Loading..."` string instead of a skeleton. Causes layout shift; looks broken.
- Hiding the error state with defensive optional chaining everywhere. The error becomes invisible; the UI just shows nothing.
- Empty state that looks identical to loading state. User can't tell if they should wait or there's no data.

## 11. Pagination

Page state goes in URL params, not `useState`, so it's bookmarkable and back-button-safe.

```ts
const params = useSearchParams();
const page = Number(params.get("page") ?? 1);
```

**Why this way:** A URL is shareable, bookmarkable, and survives back/forward navigation. `useState` page state doesn't do any of those. The same rule applies to filters, sort order, and search queries — anything you'd want to land directly on.

**Common mistakes:**
- `useState(1)` for the page index. Refreshing the page resets to page 1.
- Storing filter state in `localStorage`. Now the URL doesn't represent what the user sees, and the filter persists across logins.
- Reading `useSearchParams()` and then maintaining a parallel local state. Source-of-truth duplication.

## 12. Optimistic updates

```ts
const queryClient = useQueryClient();
const update = useUpdateThing();

update.mutate(input, {
  onMutate: async (vars) => {
    await queryClient.cancelQueries({ queryKey: queryKeys.things.detail(vars.id) });
    const prev = queryClient.getQueryData(queryKeys.things.detail(vars.id));
    queryClient.setQueryData(queryKeys.things.detail(vars.id), { ...prev, ...vars.data });
    return { prev };
  },
  onError: (_e, vars, ctx) => {
    if (ctx?.prev) queryClient.setQueryData(queryKeys.things.detail(vars.id), ctx.prev);
  },
  onSettled: (_d, _e, vars) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.things.detail(vars.id) });
  },
});
```

**Why this way:** Latency is the largest UX cost in CRUD. An optimistic update makes the UI feel instant. The rollback path is not optional — if the request fails, you must restore the previous state or the user sees a lie.

**Common mistakes:**
- `setQueryData` without `cancelQueries` first. In-flight fetches can overwrite your optimistic update with stale server data.
- No rollback in `onError`. UI shows the change; database doesn't have it.
- No `invalidateQueries` in `onSettled`. The optimistic data sticks until the next user-triggered refetch, drifting from the real server state.

## 13. Variable and function naming (Clean Code)

Names reveal what the variable is and why it exists. A senior reader shouldn't need to look at surrounding code to understand a name.

```ts
// Bad
const d = new Date();
const data = await fetchCars();
const tmp = users.filter((u) => u.isActive);

// Good
const purchaseDate = new Date();
const cars = await fetchCars();
const activeUsers = users.filter((u) => u.isActive);
```

**Banned name fragments** (the reviewer flags these): `data`, `info`, `obj`, `tmp`, `temp`, `result`, `manager`, `handler`, `helper`, `util`, `utils`, plus abbreviations outside the allow-list (`url`, `id`, `api`, `vin`, `usd`, `cm3`, `pdf`, `seo`, `jwt`).

**One verb per concept** across the whole codebase:

| Operation | Verb | Examples |
|---|---|---|
| Read from server | `fetch` | `fetchCars`, `fetchUserById` |
| Read via React Query | `use` | `useCars`, `useCar` |
| Write to server | `create` / `update` / `delete` | `createCar`, `updateUser` |
| Compute locally | `calculate` | `calculateTax`, `calculateShippingPrice` |
| Format for display | `format` | `formatPrice`, `formatDate` |
| Convert units | `normalize` / `convert` | `normalizeEngineVolumeToCm3` |

Don't introduce `get`/`retrieve`/`load` next to `fetch`, or `compute` next to `calculate`. Pick one.

**Quick rules:**

- Booleans start with `is` / `has` / `can` / `should` / `did` (`isLoading`, not `loading`).
- Functions are verbs (`calculateTax`); components and classes are nouns (`TaxBreakdown`).
- Event handlers: `handleX` inside, `onX` as prop. `<button onClick={handleClick}>` accepting `onSave` from props.
- No redundant prefix (`userUserId`, `useCarsHook`).
- Plural matches count (`users` is an array, `user` is one).
- Single-letter names only in tight loops (`i`/`j`/`k`) or event params (`e`).

Reference: *Clean Code* ch. 2 ("Meaningful Names"). The reviewer subagent has the full checklist.
