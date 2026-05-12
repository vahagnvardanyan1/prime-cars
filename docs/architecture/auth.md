# Authentication

How auth, tokens, and authenticated requests work in this codebase. This is a reference, not a guide — it documents what exists today, including known gaps.

## Surface area

- **Token storage:** `localStorage` keys `access_token` and `refresh_token`. Set by `setTokens`, cleared by `removeTokens`. See **Known issues** below.
- **Token refresh:** `refreshAccessToken()` calls `POST /auth/refresh` with the refresh token.
- **Authenticated request wrapper:** `authenticatedFetch(url, options)` — injects `Authorization: Bearer <accessToken>`, intercepts 401, refreshes the access token, retries the original request once.
- **In-flight refresh lock:** module-scoped `isRefreshing` flag plus a `refreshSubscribers` array — concurrent 401s wait on the same refresh instead of triggering N refresh calls.

All of the above lives in `src/lib/auth/token.ts`.

## Required backend contract

```
POST /auth/login
  body:  { email, password }
  200:   { data: { access_token, refresh_token } }

POST /auth/refresh
  body:  { refresh_token }
  200:   { data: { access_token, refresh_token? } }   // refresh_token rotation optional
  401:   refresh token invalid/expired — frontend clears tokens and falls back to login

GET /auth/me
  headers: Authorization: Bearer <access_token>
  200:     { id, email, role, firstName?, lastName?, companyName?, companyLogo? }
```

Backend response envelope is `{ data: ... }` for both auth endpoints. Frontend code unwraps `.data` after `.json()`.

## How to make an authenticated request

Always use `authenticatedFetch`. Bare `fetch` for backend endpoints will silently fail with 401 when the access token expires — no refresh, no retry.

```ts
import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/auth/token";

export const fetchCars = async () => {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/cars`);
  if (!response.ok) {
    return { success: false, error: `Server error: ${response.status}` };
  }
  return { success: true, data: await response.json() };
};

export const updateCar = async ({ id, data }: { id: string; data: FormData }) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/cars/${id}`, {
    method: "PATCH",
    body: data, // FormData sets its own Content-Type
  });
  // ...
};
```

Bare `fetch` is allowed for: login, refresh, public (unauthenticated) endpoints, and external APIs.

## Concurrent-request handling

When the access token has just expired, several in-flight requests may all hit 401 at once. The wrapper handles this by:

1. First 401 acquires the refresh lock (`isRefreshing = true`) and calls `/auth/refresh`.
2. Other 401s during this window register a callback via `addRefreshSubscriber` and `await` a promise.
3. On refresh success, `onTokenRefreshed(newToken)` resolves every waiter with the new token; all retries proceed.

This means N concurrent 401s produce exactly one refresh call, not N.

## Token lifetimes

The frontend does not assume specific lifetimes. Backend decides. Recommended ranges:

- Access token: 15–60 minutes
- Refresh token: 7–30 days

## Known issues (open)

Tracked in `docs/AUDIT_2026-05-12.md`.

1. **Subscribers leak on refresh failure** (`token.ts:80-84` and the failure paths at `:100-107`, `:125-132`). When refresh fails, `removeTokens()` empties the subscriber list but does not resolve or reject the awaiting promises. Callers wait forever. Fix: track failure subscribers separately and reject them, or change `addRefreshSubscriber`'s callback signature to `string | null`.

2. **Refresh token in `localStorage`.** Any XSS — including a compromised npm dependency — exfiltrates both tokens. Production goal is HttpOnly cookies set by the backend; until then, treat XSS as a session-stealing severity-1 risk.

3. **No server-side auth check on admin routes.** `src/middleware.ts` only handles locale routing. Auth is enforced purely client-side by `useUser()` + `LoginModal`. The admin JS bundle ships to every visitor. Move the check into middleware.

## Logout

```ts
import { removeTokens } from "@/lib/auth/token";

removeTokens(); // clears localStorage + resets refresh subscribers
```

`UserContext.clearUser()` wraps this and also calls the `useLogout` mutation.
