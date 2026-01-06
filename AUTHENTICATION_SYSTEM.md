# Authentication System Documentation

## Overview

This document explains the authentication and token refresh mechanism used throughout the Prime Cars platform. It's essential for maintaining secure, uninterrupted API communication.

---

## Core Concept: `authenticatedFetch`

### What is `authenticatedFetch`?

`authenticatedFetch` is a wrapper around the native `fetch` API that automatically handles authentication tokens and token refresh logic. It's located in `/src/lib/auth/token.ts`.

### Why Use `authenticatedFetch` Instead of Regular `fetch`?

**❌ Problem with Regular `fetch`:**
```typescript
// Manual token handling - AVOID THIS PATTERN
const token = localStorage.getItem('access_token');
const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

// What happens when token expires? 
// → User gets logged out
// → Request fails with 401
// → Poor user experience
```

**✅ Solution with `authenticatedFetch`:**
```typescript
// Automatic token handling - USE THIS PATTERN
import { authenticatedFetch } from "@/lib/auth/token";

const response = await authenticatedFetch(`${API_BASE_URL}/vehicles/${id}`, {
  method: 'DELETE',
});

// Benefits:
// → Automatically adds Authorization header
// → Detects expired tokens (401 response)
// → Refreshes token automatically
// → Retries the original request
// → Seamless user experience
```

---

## How Token Refresh Works

### Token Lifecycle

1. **Initial Login**
   - User logs in with credentials
   - Backend returns two tokens:
     - `access_token`: Short-lived (e.g., 15 minutes)
     - `refresh_token`: Long-lived (e.g., 7 days)
   - Both stored in `localStorage`

2. **Making API Requests**
   ```typescript
   // authenticatedFetch automatically:
   const response = await authenticatedFetch(url, options);
   ```
   - Gets `access_token` from localStorage
   - Adds `Authorization: Bearer {token}` header
   - Makes the request

3. **When Token Expires**
   - Backend returns `401 Unauthorized`
   - `authenticatedFetch` detects the 401
   - Automatically calls refresh endpoint: `POST /auth/refresh`
   - Gets new `access_token` (and optionally new `refresh_token`)
   - **Retries the original request** with new token
   - User never notices the token expired

4. **When Refresh Fails**
   - If refresh token is invalid/expired
   - Tokens are cleared from localStorage
   - User is redirected to login modal
   - Clean logout experience

### Race Condition Prevention

The system handles **multiple simultaneous requests** during token refresh:

```typescript
// Multiple requests at once
Promise.all([
  authenticatedFetch('/api/cars'),
  authenticatedFetch('/api/users'),
  authenticatedFetch('/api/settings'),
]);

// What happens:
// 1. First request gets 401 → starts token refresh
// 2. Other requests wait (subscriber pattern)
// 3. Token refreshed successfully
// 4. All requests retry with new token
// ✅ Only ONE refresh request to backend
```

This is handled by the `isRefreshing` flag and subscriber pattern in `token.ts`:

```typescript
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

if (isRefreshing) {
  // Wait for ongoing refresh to complete
  return new Promise((resolve) => {
    addRefreshSubscriber((token: string) => {
      resolve(token);
    });
  });
}
```

---

## Implementation Guide

### ✅ Correct Pattern (Always Use This)

For **ANY** authenticated API call, use `authenticatedFetch`:

```typescript
import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/auth/token";

// GET request
export const fetchCars = async () => {
  const response = await authenticatedFetch(`${API_BASE_URL}/vehicles`);
  if (!response.ok) {
    throw new Error('Failed to fetch cars');
  }
  return await response.json();
};

// POST request with JSON body
export const createCar = async (data: CarData) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/vehicles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return await response.json();
};

// PATCH request with FormData
export const updateCar = async ({ id, data }: { id: string; data: FormData }) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/vehicles/${id}`, {
    method: 'PATCH',
    body: data, // FormData automatically sets Content-Type
  });
  return await response.json();
};

// DELETE request
export const deleteCar = async ({ id }: { id: string }) => {
  const response = await authenticatedFetch(`${API_BASE_URL}/vehicles/${id}`, {
    method: 'DELETE',
  });
  return response.ok;
};
```

### ❌ Anti-Patterns (Avoid These)

```typescript
// ❌ DON'T manually handle tokens
const token = localStorage.getItem('access_token');
fetch(url, {
  headers: { Authorization: `Bearer ${token}` }
});

// ❌ DON'T use getValidToken + fetch
const token = await getValidToken();
fetch(url, {
  headers: { Authorization: `Bearer ${token}` }
});

// ❌ DON'T handle 401 responses manually
const response = await fetch(url);
if (response.status === 401) {
  await refreshAccessToken();
  // retry...
}
```

**Why?** Because `authenticatedFetch` handles ALL of this automatically and correctly handles race conditions.

---

## File Structure

### Core Files

1. **`/src/lib/auth/token.ts`**
   - Contains all token management logic
   - Exports `authenticatedFetch`, `setTokens`, `removeTokens`, etc.
   - Handles refresh token logic and race conditions

2. **API Functions Pattern**
   ```
   /src/lib/admin/
   ├── fetchCars.ts       ✅ Uses authenticatedFetch
   ├── createCar.ts       ✅ Uses authenticatedFetch
   ├── updateCar.ts       ✅ Uses authenticatedFetch
   ├── deleteCar.ts       ✅ Uses authenticatedFetch
   ├── fetchUsers.ts      ✅ Uses authenticatedFetch
   └── ...
   ```

### API Function Template

Use this template for all new authenticated API functions:

```typescript
import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/auth/token";

type ResponseType = {
  success: boolean;
  error?: string;
  data?: any;
};

export const apiFunction = async ({ 
  param 
}: { 
  param: string 
}): Promise<ResponseType> => {
  try {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/endpoint/${param}`,
      {
        method: 'METHOD',
        // Add headers/body as needed
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: "Operation failed" 
      }));
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error in apiFunction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};
```

---

## Benefits Summary

### 1. **Seamless User Experience**
- Users stay logged in even when tokens expire
- No sudden logouts during active sessions
- Invisible token refresh in background

### 2. **Security**
- Short-lived access tokens (15 min) minimize risk
- Long-lived refresh tokens (7 days) for convenience
- Automatic cleanup on auth failures

### 3. **Code Quality**
- Centralized authentication logic
- Consistent error handling
- Reduced code duplication
- Easier to maintain and test

### 4. **Developer Experience**
- Simple API: just replace `fetch` with `authenticatedFetch`
- No manual token management
- No need to handle 401 responses
- Handles edge cases automatically

### 5. **Reliability**
- Prevents race conditions
- Handles multiple simultaneous requests
- Graceful degradation on failures

---

## Common Scenarios

### Scenario 1: User Making Multiple Requests

```typescript
// Component making multiple API calls
const loadDashboard = async () => {
  const [cars, users, settings] = await Promise.all([
    fetchCars(),      // All use authenticatedFetch
    fetchUsers(),     // internally
    fetchSettings(),
  ]);
};

// If access token expired:
// 1. First API call triggers refresh
// 2. Other calls wait for new token
// 3. All requests succeed with new token
// 4. User sees no errors
```

### Scenario 2: Token Expired Mid-Session

```typescript
// User editing a car for 20 minutes (token expired at 15 min)
const handleSave = async () => {
  const result = await updateCar({ id, data });
  
  // Behind the scenes:
  // 1. updateCar uses authenticatedFetch
  // 2. Gets 401 (token expired)
  // 3. Refreshes token automatically
  // 4. Retries update with new token
  // 5. Returns success to user
  
  if (result.success) {
    toast.success("Car updated!");
  }
};
```

### Scenario 3: Refresh Token Expired

```typescript
// User returns after 8 days (refresh token expired)
const handleAction = async () => {
  const result = await somAction();
  
  // Behind the scenes:
  // 1. Access token expired → tries refresh
  // 2. Refresh token also expired → refresh fails
  // 3. Tokens cleared from localStorage
  // 4. UserContext detects no user
  // 5. Login modal shown automatically
  
  // No crashes, clean logout experience
};
```

---

## Testing Checklist

When implementing new authenticated endpoints:

- [ ] Use `authenticatedFetch` instead of `fetch`
- [ ] Import from `@/lib/auth/token`
- [ ] Import `API_BASE_URL` from `@/i18n/config`
- [ ] Handle response errors properly
- [ ] Test with expired access token (should auto-refresh)
- [ ] Test with expired refresh token (should show login)
- [ ] Test with multiple simultaneous calls

---

## Migration Guide

If you find old code using manual token handling:

### Before (❌):
```typescript
const token = localStorage.getItem('access_token');
const response = await fetch(`${API_BASE_URL}/endpoint`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  method: 'POST',
  body: JSON.stringify(data),
});
```

### After (✅):
```typescript
import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/auth/token";

const response = await authenticatedFetch(`${API_BASE_URL}/endpoint`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});
```

### Changes:
1. Remove manual token retrieval
2. Remove Authorization header (added automatically)
3. Import and use `authenticatedFetch`
4. Everything else stays the same!

---

## Summary

**Golden Rule**: For any authenticated API call, always use `authenticatedFetch`.

**Why?** 
- Automatic token refresh
- Better user experience
- Cleaner code
- Handles edge cases
- Production-ready reliability

**When NOT to use it?**
- Public endpoints (no auth required)
- Login/refresh endpoints themselves
- External API calls (non-Prime Cars backend)

---

## Questions?

If you're unsure whether to use `authenticatedFetch`, ask:
- Does this endpoint require authentication? → **Yes, use it**
- Is it calling the Prime Cars backend? → **Yes, use it**
- Does it need the access token? → **Yes, use it**

When in doubt, use `authenticatedFetch`. It's safe even for endpoints that might not need auth.

---

**Last Updated**: January 2026  
**Maintained By**: Prime Cars Development Team

