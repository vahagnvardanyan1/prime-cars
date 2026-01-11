# Quick Start Guide - Using the New System

This guide provides quick, copy-paste examples for common tasks.

---

## 📋 Table of Contents

1. [Fetching Data](#fetching-data)
2. [Creating Forms](#creating-forms)
3. [Mutations (Create/Update/Delete)](#mutations)
4. [Permission Checks](#permission-checks)
5. [Common Patterns](#common-patterns)

---

## 1. Fetching Data

### Fetch Users

```typescript
import { useUsers } from "@/lib/react-query/hooks";

const MyComponent = () => {
  const { data, isLoading, error, refetch } = useUsers({
    search: "john",
    role: "user",
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.users.map(user => (
        <div key={user.id}>{user.firstName} {user.lastName}</div>
      ))}
    </div>
  );
};
```

### Fetch Cars

```typescript
import { useAdminCars } from "@/lib/react-query/hooks";

const CarsPage = () => {
  const { data, isLoading } = useAdminCars({
    search: "BMW",
    status: "active",
  });

  return (
    <div>
      {data?.cars.map(car => (
        <div key={car.id}>{car.model} - {car.year}</div>
      ))}
    </div>
  );
};
```

### Fetch Notifications

```typescript
import { useNotifications, useUnreadNotifications } from "@/lib/react-query/hooks";

const NotificationsPage = () => {
  // All notifications
  const { data: allNotifications } = useNotifications();
  
  // Only unread
  const { data: unreadData } = useUnreadNotifications();

  return (
    <div>
      <p>Unread: {unreadData?.unreadCount}</p>
      {/* Display notifications */}
    </div>
  );
};
```

---

## 2. Creating Forms

### Login Form

```typescript
import { Formik, Form, Field } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { loginSchema } from "@/lib/validation/schemas";
import { useLogin } from "@/lib/react-query/hooks";

const LoginForm = () => {
  const loginMutation = useLogin();

  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      validationSchema={toFormikValidationSchema(loginSchema)}
      onSubmit={(values, { setSubmitting }) => {
        loginMutation.mutate(values, {
          onSuccess: () => {
            // Handle success
          },
          onSettled: () => {
            setSubmitting(false);
          },
        });
      }}
    >
      {({ errors, touched, isSubmitting }) => (
        <Form>
          <div>
            <label>Email</label>
            <Field name="email" type="email" />
            {touched.email && errors.email && <p>{errors.email}</p>}
          </div>

          <div>
            <label>Password</label>
            <Field name="password" type="password" />
            {touched.password && errors.password && <p>{errors.password}</p>}
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </Form>
      )}
    </Formik>
  );
};
```

### Create User Form

```typescript
import { Formik, Form, Field } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { createUserSchema } from "@/lib/validation/schemas";
import { useCreateUser } from "@/lib/react-query/hooks";

const CreateUserForm = ({ onSuccess }) => {
  const createUserMutation = useCreateUser();

  return (
    <Formik
      initialValues={{
        firstName: "",
        lastName: "",
        email: "",
        login: "",
        password: "",
      }}
      validationSchema={toFormikValidationSchema(createUserSchema)}
      onSubmit={(values, { setSubmitting, resetForm }) => {
        createUserMutation.mutate(values, {
          onSuccess: () => {
            resetForm();
            onSuccess?.();
          },
          onSettled: () => {
            setSubmitting(false);
          },
        });
      }}
    >
      {({ errors, touched, isSubmitting, isValid }) => (
        <Form>
          <Field name="firstName" placeholder="First Name" />
          {touched.firstName && errors.firstName && <p>{errors.firstName}</p>}

          <Field name="lastName" placeholder="Last Name" />
          {touched.lastName && errors.lastName && <p>{errors.lastName}</p>}

          <Field name="email" type="email" placeholder="Email" />
          {touched.email && errors.email && <p>{errors.email}</p>}

          <Field name="login" placeholder="Login" />
          {touched.login && errors.login && <p>{errors.login}</p>}

          <Field name="password" type="password" placeholder="Password" />
          {touched.password && errors.password && <p>{errors.password}</p>}

          <button type="submit" disabled={!isValid || isSubmitting}>
            {isSubmitting ? "Creating..." : "Create User"}
          </button>
        </Form>
      )}
    </Formik>
  );
};
```

### Create Car Form with File Upload

```typescript
import { useState } from "react";
import { Formik, Form, Field } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { createCarSchema } from "@/lib/validation/schemas";
import { useCreateCar } from "@/lib/react-query/hooks";

const CreateCarForm = () => {
  const [imageFiles, setImageFiles] = useState([]);
  const [invoiceFile, setInvoiceFile] = useState(null);
  const createCarMutation = useCreateCar();

  return (
    <Formik
      initialValues={{
        userId: "",
        model: "bmw",
        year: 2024,
        priceUsd: 0,
        carPaid: false,
        shippingPaid: false,
        insurance: false,
        purchaseDate: new Date().toISOString().split("T")[0],
        type: "auto",
        auction: "copart",
        vin: "",
      }}
      validationSchema={toFormikValidationSchema(createCarSchema)}
      onSubmit={(values, { setSubmitting }) => {
        createCarMutation.mutate(
          {
            data: values,
            images: imageFiles,
            invoiceFile,
          },
          {
            onSettled: () => setSubmitting(false),
          }
        );
      }}
    >
      {({ errors, touched, isSubmitting, setFieldValue }) => (
        <Form>
          <Field as="select" name="model">
            <option value="bmw">BMW</option>
            {/* More options */}
          </Field>

          <Field name="year" type="number" />
          <Field name="priceUsd" type="number" />
          <Field name="vin" />

          {/* File upload */}
          <input
            type="file"
            multiple
            onChange={(e) => setImageFiles([...e.target.files])}
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Car"}
          </button>
        </Form>
      )}
    </Formik>
  );
};
```

---

## 3. Mutations

### Create Mutation

```typescript
import { useCreateUser } from "@/lib/react-query/hooks";

const MyComponent = () => {
  const createUserMutation = useCreateUser();

  const handleCreate = () => {
    createUserMutation.mutate(
      {
        firstName: "John",
        lastName: "Doe",
        login: "johndoe",
        password: "password123",
      },
      {
        onSuccess: (data) => {
          console.log("Created user:", data);
        },
        onError: (error) => {
          console.error("Error:", error);
        },
      }
    );
  };

  return (
    <button onClick={handleCreate} disabled={createUserMutation.isPending}>
      {createUserMutation.isPending ? "Creating..." : "Create User"}
    </button>
  );
};
```

### Update Mutation

```typescript
import { useUpdateUser } from "@/lib/react-query/hooks";

const EditUserButton = ({ userId, currentData }) => {
  const updateUserMutation = useUpdateUser();

  const handleUpdate = () => {
    updateUserMutation.mutate(
      {
        id: userId,
        data: {
          firstName: "Updated Name",
          email: "newemail@example.com",
        },
      },
      {
        onSuccess: () => {
          console.log("Updated!");
        },
      }
    );
  };

  return (
    <button onClick={handleUpdate} disabled={updateUserMutation.isPending}>
      Update
    </button>
  );
};
```

### Delete Mutation

```typescript
import { useDeleteUser } from "@/lib/react-query/hooks";

const DeleteUserButton = ({ userId }) => {
  const deleteUserMutation = useDeleteUser();

  const handleDelete = () => {
    if (confirm("Are you sure?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  return (
    <button onClick={handleDelete} disabled={deleteUserMutation.isPending}>
      {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
    </button>
  );
};
```

---

## 4. Permission Checks

### Component-Level Protection

```typescript
import { ProtectedComponent } from "@/components/rbac/ProtectedComponent";
import { Permission } from "@/lib/rbac/permissions";

// Hide button if user doesn't have permission
<ProtectedComponent permission={Permission.CREATE_USER}>
  <button>Create User</button>
</ProtectedComponent>

// Multiple permissions (require ANY)
<ProtectedComponent
  permissions={[Permission.EDIT_USER, Permission.DELETE_USER]}
  requireAll={false}
>
  <button>Manage User</button>
</ProtectedComponent>

// Multiple permissions (require ALL)
<ProtectedComponent
  permissions={[Permission.EDIT_USER, Permission.VIEW_ALL_USERS]}
  requireAll={true}
>
  <button>Edit User</button>
</ProtectedComponent>

// With fallback
<ProtectedComponent
  permission={Permission.CREATE_USER}
  fallback={<p>You don't have permission</p>}
>
  <button>Create User</button>
</ProtectedComponent>
```

### Using Permission Hooks

```typescript
import { usePermission, usePermissions, useRole } from "@/lib/rbac/hooks";
import { Permission } from "@/lib/rbac/permissions";

const MyComponent = () => {
  // Check single permission
  const canCreateUser = usePermission(Permission.CREATE_USER);

  // Check multiple permissions
  const { hasAny, hasAll, check } = usePermissions([
    Permission.EDIT_USER,
    Permission.DELETE_USER,
  ]);

  // Get role info
  const { role, isAdmin, isManager } = useRole();

  return (
    <div>
      {canCreateUser && <button>Create User</button>}
      {hasAny && <button>Manage User</button>}
      {isAdmin && <button>Admin Settings</button>}
    </div>
  );
};
```

### Route Protection

```typescript
import { ProtectedRoute } from "@/components/rbac/ProtectedRoute";
import { Permission } from "@/lib/rbac/permissions";

// Require authentication
<ProtectedRoute requireAuth={true}>
  <ProfilePage />
</ProtectedRoute>

// Require admin
<ProtectedRoute requireAdmin={true}>
  <AdminDashboard />
</ProtectedRoute>

// Require specific permission
<ProtectedRoute permission={Permission.VIEW_DASHBOARD}>
  <Dashboard />
</ProtectedRoute>

// Custom redirect
<ProtectedRoute
  requireAuth={true}
  redirectTo="/login"
>
  <PrivatePage />
</ProtectedRoute>
```

---

## 5. Common Patterns

### Loading State

```typescript
const { data, isLoading, error } = useUsers();

if (isLoading) {
  return (
    <div className="flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
```

### Error State

```typescript
const { data, error, refetch } = useUsers();

if (error) {
  return (
    <div className="bg-red-50 border border-red-200 rounded p-4">
      <p className="text-red-600">Error: {error.message}</p>
      <button onClick={() => refetch()}>Retry</button>
    </div>
  );
}
```

### Refetching Data

```typescript
const { data, refetch, isRefetching } = useUsers();

<button onClick={() => refetch()} disabled={isRefetching}>
  {isRefetching ? "Refreshing..." : "Refresh"}
</button>
```

### Search with Debounce

```typescript
import { useState } from "react";
import { useDebounce } from "use-debounce"; // install: npm install use-debounce

const SearchUsers = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  
  const { data } = useUsers({ search: debouncedSearch });

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search users..."
      />
      {/* Display results */}
    </div>
  );
};
```

### Pagination

```typescript
const [page, setPage] = useState(1);
const { data } = useUsers({ page, limit: 10 });

return (
  <div>
    {/* Display data */}
    <button
      onClick={() => setPage(p => p - 1)}
      disabled={page === 1}
    >
      Previous
    </button>
    <button
      onClick={() => setPage(p => p + 1)}
      disabled={page >= data.totalPages}
    >
      Next
    </button>
  </div>
);
```

### Optimistic Updates

```typescript
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/keys";

const updateUserMutation = useUpdateUser();
const queryClient = useQueryClient();

const handleUpdate = (userId, newData) => {
  // Optimistic update
  queryClient.setQueryData(
    queryKeys.users.detail(userId),
    (old) => ({ ...old, ...newData })
  );

  // Perform mutation
  updateUserMutation.mutate(
    { id: userId, data: newData },
    {
      onError: () => {
        // Rollback on error
        queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
      },
    }
  );
};
```

### Dependent Queries

```typescript
const { data: user } = useMe();
const { data: cars } = useAdminCars(
  { userId: user?.id },
  {
    enabled: !!user?.id, // Only fetch when user.id is available
  }
);
```

---

## 📦 Import Cheat Sheet

```typescript
// React Query Hooks
import {
  useMe,
  useLogin,
  useLogout,
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useAdminCars,
  useCreateCar,
  useUpdateCar,
  useDeleteCar,
  useNotifications,
  useCreateNotification,
  useMarkAsRead,
  useShipping,
  useCreateShipping,
} from "@/lib/react-query/hooks";

// Validation Schemas
import {
  loginSchema,
  createUserSchema,
  updateUserSchema,
  createCarSchema,
  updateCarSchema,
  createNotificationSchema,
} from "@/lib/validation/schemas";

// Formik
import { Formik, Form, Field } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";

// RBAC
import { ProtectedComponent } from "@/components/rbac/ProtectedComponent";
import { ProtectedRoute } from "@/components/rbac/ProtectedRoute";
import { Permission } from "@/lib/rbac/permissions";
import { usePermission, usePermissions, useRole } from "@/lib/rbac/hooks";

// Query Client
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/keys";
```

---

## 🎯 Tips

1. **Always handle loading and error states** in your UI
2. **Use TypeScript** for type safety with inferred types from Zod schemas
3. **Check permissions** before rendering sensitive UI elements
4. **Invalidate queries** after mutations to keep data fresh
5. **Use query keys factory** for consistent cache management
6. **Add toast notifications** for user feedback on mutations
7. **Test thoroughly** with React Query DevTools

---

## 🚀 Ready to Go!

You now have everything you need to use the new system. Copy these examples and adapt them to your needs!

For more details, see:
- `REFACTORING_GUIDE.md` - Full architecture guide
- `IMPLEMENTATION_SUMMARY.md` - What was implemented
