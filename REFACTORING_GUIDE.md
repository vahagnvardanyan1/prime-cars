# Prime Cars Application Refactoring Guide

This document outlines the comprehensive refactoring of the Prime Cars application to use modern best practices with React Query, Formik, Zod, and RBAC (Role-Based Access Control).

## Table of Contents

1. [Overview](#overview)
2. [Technologies Used](#technologies-used)
3. [Architecture](#architecture)
4. [React Query Implementation](#react-query-implementation)
5. [Form Management with Formik & Zod](#form-management-with-formik--zod)
6. [RBAC System](#rbac-system)
7. [Migration Guide](#migration-guide)
8. [Examples](#examples)

## Overview

The application has been refactored to follow industry best practices:

- **Data Fetching**: Migrated from manual `fetch` calls to `@tanstack/react-query` for better caching, loading states, and automatic refetching
- **Form Management**: Implemented Formik with Zod validation for type-safe, robust form handling
- **Permissions**: Created a comprehensive RBAC system with granular permissions
- **Code Organization**: Improved separation of concerns with dedicated hooks, schemas, and utilities

## Technologies Used

### Core Dependencies

```json
{
  "@tanstack/react-query": "Latest",
  "@tanstack/react-query-devtools": "Latest",
  "formik": "Latest",
  "zod": "Latest",
  "zod-formik-adapter": "Latest"
}
```

## Architecture

### Directory Structure

```
src/
├── lib/
│   ├── react-query/
│   │   ├── client.ts              # Query client configuration
│   │   ├── keys.ts                # Query key factory
│   │   └── hooks/
│   │       ├── index.ts           # Export all hooks
│   │       ├── useAuth.ts         # Authentication hooks
│   │       ├── useUsers.ts        # User management hooks
│   │       ├── useCars.ts         # Car management hooks
│   │       ├── useNotifications.ts # Notification hooks
│   │       └── useShipping.ts     # Shipping management hooks
│   ├── validation/
│   │   └── schemas.ts             # Zod validation schemas
│   └── rbac/
│       ├── permissions.ts         # Permission definitions
│       └── hooks.ts               # RBAC hooks
├── contexts/
│   ├── QueryProvider.tsx          # React Query provider
│   └── UserContext.tsx            # User context (refactored)
└── components/
    ├── rbac/
    │   ├── ProtectedComponent.tsx # Permission-based rendering
    │   └── ProtectedRoute.tsx     # Protected route wrapper
    └── admin/
        ├── modals/
        │   ├── AddCarModalFormik.tsx
        │   ├── CreateUserModalFormik.tsx
        │   └── CreateNotificationModalFormik.tsx
        └── pages/
            └── AdminUsersPageRefactored.tsx
```

## React Query Implementation

### 1. Query Client Setup

```typescript
// src/lib/react-query/client.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: (failureCount, error) => {
        // Don't retry on 401, 403, 404
        if ([401, 403, 404].includes(error.status)) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
  },
});
```

### 2. Query Keys Factory

```typescript
// src/lib/react-query/keys.ts
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  users: {
    all: ["users"] as const,
    list: (filters?: Record<string, any>) => ["users", "list", filters] as const,
    detail: (id: string) => ["users", "detail", id] as const,
  },
  // ... more keys
};
```

### 3. Custom Hooks

```typescript
// Example: src/lib/react-query/hooks/useUsers.ts
export const useUsers = (params?: FetchUsersParams) => {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => fetchUsers(params),
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("User created successfully");
    },
  });
};
```

### 4. Usage in Components

```typescript
const { data, isLoading, error, refetch } = useUsers({ search });
const createUserMutation = useCreateUser();

// In submit handler
createUserMutation.mutate(values, {
  onSuccess: () => {
    // Handle success
  },
});
```

## Form Management with Formik & Zod

### 1. Define Zod Schemas

```typescript
// src/lib/validation/schemas.ts
import { z } from "zod";

export const createUserSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required"),
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  // ... more fields
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
```

### 2. Implement Formik Form

```typescript
import { Formik, Form, Field } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";

<Formik
  initialValues={initialValues}
  validationSchema={toFormikValidationSchema(createUserSchema)}
  onSubmit={async (values, { setSubmitting }) => {
    createUserMutation.mutate(values, {
      onSuccess: () => {
        // Handle success
      },
      onSettled: () => {
        setSubmitting(false);
      },
    });
  }}
>
  {({ errors, touched, isSubmitting, isValid }) => (
    <Form>
      <Field
        name="firstName"
        className={touched.firstName && errors.firstName ? "error" : ""}
      />
      {touched.firstName && errors.firstName && (
        <p className="error-message">{errors.firstName}</p>
      )}
      <Button type="submit" disabled={!isValid || isSubmitting}>
        Submit
      </Button>
    </Form>
  )}
</Formik>
```

## RBAC System

### 1. Permission Definitions

```typescript
// src/lib/rbac/permissions.ts
export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  USER = "user",
  SUPPORT = "support",
  VIEWER = "viewer",
}

export enum Permission {
  VIEW_ALL_USERS = "view_all_users",
  CREATE_USER = "create_user",
  EDIT_USER = "edit_user",
  DELETE_USER = "delete_user",
  // ... more permissions
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // All permissions
  ],
  [UserRole.MANAGER]: [
    // Manager permissions
  ],
  // ... more roles
};
```

### 2. RBAC Hooks

```typescript
// src/lib/rbac/hooks.ts
export const usePermission = (permission: Permission): boolean => {
  const { user } = useUser();
  return hasPermission({ role: user?.role, permission });
};

export const useCanAccessAdminPanel = (): boolean => {
  const { user } = useUser();
  return canAccessAdminPanel(user?.role);
};
```

### 3. Protected Components

```typescript
// Component-level protection
<ProtectedComponent permission={Permission.CREATE_USER}>
  <Button onClick={handleCreate}>Create User</Button>
</ProtectedComponent>

// Route-level protection
<ProtectedRoute requireAdmin={true} permission={Permission.VIEW_DASHBOARD}>
  <AdminDashboard />
</ProtectedRoute>
```

## Migration Guide

### Old Pattern (Before)

```typescript
// ❌ Old way with manual fetch
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  fetchUsers();
}, []);

// ❌ Old way with custom form validation
const [formData, setFormData] = useState({});
const [errors, setErrors] = useState({});

const validate = () => {
  const newErrors = {};
  if (!formData.firstName) {
    newErrors.firstName = "Required";
  }
  // ... more validation
  return newErrors;
};
```

### New Pattern (After)

```typescript
// ✅ New way with React Query
const { data: users, isLoading, error } = useUsers();

// ✅ New way with Formik + Zod
<Formik
  initialValues={initialValues}
  validationSchema={toFormikValidationSchema(createUserSchema)}
  onSubmit={handleSubmit}
>
  {/* Form content */}
</Formik>
```

## Examples

### Example 1: Fetching Data

```typescript
// Using React Query hook
const { data, isLoading, error } = useAdminCars({
  search: "BMW",
  status: "active",
});

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;

return <CarsList cars={data.cars} />;
```

### Example 2: Creating a Resource

```typescript
const createCarMutation = useCreateCar();

const handleSubmit = (values) => {
  createCarMutation.mutate(
    {
      data: values,
      images: files,
    },
    {
      onSuccess: () => {
        toast.success("Car created!");
      },
    }
  );
};
```

### Example 3: Protected UI

```typescript
<ProtectedComponent permission={Permission.DELETE_CAR}>
  <Button onClick={handleDelete}>Delete</Button>
</ProtectedComponent>
```

## Best Practices

1. **Always use Query Keys Factory**: Use `queryKeys` for consistent key management
2. **Invalidate Queries**: After mutations, invalidate related queries for fresh data
3. **Type Safety**: Use TypeScript types generated from Zod schemas
4. **Error Handling**: Use React Query's built-in error handling with toast notifications
5. **Loading States**: Always handle loading and error states in UI
6. **Permissions**: Check permissions at both component and route levels
7. **Form Validation**: Define all validation rules in Zod schemas
8. **Optimistic Updates**: Use React Query's optimistic updates for better UX

## Benefits

### React Query
- ✅ Automatic caching and background refetching
- ✅ Loading and error states out of the box
- ✅ Request deduplication
- ✅ Automatic retries with smart defaults
- ✅ DevTools for debugging

### Formik + Zod
- ✅ Type-safe form validation
- ✅ Single source of truth for validation rules
- ✅ Automatic error handling
- ✅ Easy form state management
- ✅ TypeScript inference from schemas

### RBAC
- ✅ Centralized permission management
- ✅ Easy to extend and maintain
- ✅ Type-safe permissions
- ✅ Component and route-level protection
- ✅ Clear separation of concerns

## Conclusion

This refactoring brings the Prime Cars application up to modern standards with professional-grade patterns and practices. The code is now more maintainable, testable, and scalable.

For questions or issues, please refer to the official documentation:
- [TanStack Query](https://tanstack.com/query/latest)
- [Formik](https://formik.org/)
- [Zod](https://zod.dev/)
