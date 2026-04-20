# Sign-In Flow Documentation

## Overview
The sign-in flow allows users to authenticate and access the admin panel. There are two login modal implementations:
1. **LoginModal.tsx** - Primary modal using username/password with manual validation
2. **LoginModalFormik.tsx** - Alternative modal using email/password with Formik + Zod validation

---

## Component Architecture

```
SiteShell (manages login state)
├── Header
│   └── "Sign In" button → triggers onLoginClick
└── LoginModal (isOpen, onClose, onLoginSuccess)
    └── Form → validates → POST /auth/login → stores tokens → redirect

Alternative Flow:
AdminLayout
└── LoginModalFormik (uses Radix Dialog)
    └── Formik Form → Zod validation → useLogin hook → stores tokens
```

---

## File Structure

### Core Auth Components
| File | Purpose |
|------|---------|
| `src/components/LoginModal.tsx` | Primary login modal (username/password) |
| `src/components/LoginModalFormik.tsx` | Alternative modal (email/password with Formik) |
| `src/components/SiteShell.tsx` | Manages login modal state for public pages |
| `src/app/[locale]/admin/layout.tsx` | Admin layout with auth protection |

### Auth Logic
| File | Purpose |
|------|---------|
| `src/lib/auth/token.ts` | Token storage, refresh, authenticated fetch |
| `src/lib/react-query/hooks/useAuth.ts` | useMe, useLogin, useLogout hooks |
| `src/lib/validation/schemas.ts` | Zod schemas for form validation |
| `src/contexts/UserContext.tsx` | User state context provider |

### Supporting UI
| File | Purpose |
|------|---------|
| `src/components/ui/password-input.tsx` | Password field with show/hide toggle |
| `src/components/ui/dialog.tsx` | Radix Dialog wrapper (used by Formik modal) |

---

## Authentication Flow

### Login Process
```
1. User clicks "Sign In" in Header
2. SiteShell opens LoginModal
3. User enters credentials
4. Form validation (manual or Zod)
5. POST /auth/login with { username, password } or { email, password }
6. Backend returns { access_token, refresh_token }
7. Tokens stored in localStorage
8. User redirected to /admin
9. Toast notification shown
```

### Token Management
```typescript
// Token storage keys
ACCESS_TOKEN_KEY = "access_token"
REFRESH_TOKEN_KEY = "refresh_token"

// Key functions (src/lib/auth/token.ts)
getAccessToken()        // Get from localStorage
getRefreshToken()       // Get from localStorage
setTokens({ accessToken, refreshToken })  // Store both
removeTokens()          // Clear on logout
isAuthenticated()       // Check if token exists
refreshAccessToken()    // POST /auth/refresh
authenticatedFetch()    // Wrapper with auto-refresh
```

### Token Refresh
```
1. Request made with authenticatedFetch()
2. If 401 response:
   a. Call refreshAccessToken()
   b. POST /auth/refresh with refresh_token
   c. Get new access_token
   d. Store new tokens
   e. Retry original request
3. Race condition prevention with isRefreshing flag
```

---

## API Endpoints

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/auth/login` | POST | `{ username, password }` or `{ email, password }` | `{ data: { access_token, refresh_token, user } }` |
| `/auth/refresh` | POST | `{ refresh_token }` | `{ data: { access_token, refresh_token } }` |
| `/auth/me` | GET | - (Bearer token) | `{ data: { id, email, role, ... } }` |

---

## Types

### User Type
```typescript
type User = {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  customerId?: string;
  companyName?: string;
  companyLogo?: string;
};
```

### Login Schema (Zod)
```typescript
// src/lib/validation/schemas.ts
loginSchema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(1).min(6),
});

type LoginFormValues = {
  email: string;
  password: string;
};
```

---

## Translations Used

```json
"auth": {
  "closeAria": "Close",
  "welcomeBack": "Welcome back",
  "subtitle": "Sign in to access your account",
  "username": "Username",
  "usernamePlaceholder": "Enter your username",
  "email": "Email",
  "password": "Password",
  "passwordPlaceholder": "Enter your password",
  "signIn": "Sign in",
  "signingIn": "Signing in...",
  "validation": {
    "usernameRequired": "Username is required",
    "usernameMinLength": "Username must be at least 3 characters",
    "passwordRequired": "Password is required",
    "passwordMinLength": "Password must be at least 6 characters"
  }
}
```

---

## React Query Hooks

### useMe
```typescript
// Fetches current user from /auth/me
const { data: user, isLoading, refetch } = useMe();
// Enabled only when access token exists
// 5 minute stale time
```

### useLogin
```typescript
// Mutation for login
const { mutate: login, isPending } = useLogin();
login({ email, password }, {
  onSuccess: () => { /* tokens stored, user cached */ },
  onError: (error) => { /* toast shown */ }
});
```

### useLogout
```typescript
// Clears tokens and query cache
const { mutate: logout } = useLogout();
logout();
```

---

## Component Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                        SiteShell                            │
│  ┌─────────────────┐  ┌────────────────────────────────┐   │
│  │     Header      │  │         LoginModal             │   │
│  │ ┌─────────────┐ │  │ ┌────────────────────────────┐ │   │
│  │ │ Sign In Btn │─┼──┼─│ Username Input             │ │   │
│  │ └─────────────┘ │  │ │                            │ │   │
│  │ ┌─────────────┐ │  │ ├────────────────────────────┤ │   │
│  │ │ LangSwitch  │ │  │ │ PasswordInput              │ │   │
│  │ │             │ │  │ │                            │ │   │
│  │ └─────────────┘ │  │ ├────────────────────────────┤ │   │
│  └─────────────────┘  │ │ Submit Button              │ │   │
│                       │ │                            │ │   │
│                       │ └────────────────────────────┘ │   │
│                       └────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```
