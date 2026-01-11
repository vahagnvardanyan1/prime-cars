"use client";

import type { ReactNode } from "react";

import { usePermission, usePermissions } from "@/lib/rbac/hooks";
import { Permission } from "@/lib/rbac/permissions";

type ProtectedComponentProps = {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
};

export const ProtectedComponent = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
}: ProtectedComponentProps) => {
  // Single permission check
  const hasSinglePermission = usePermission(permission || Permission.VIEW_OWN_PROFILE);
  
  // Multiple permissions check
  const { hasAny, hasAll } = usePermissions(permissions || []);

  let hasAccess = false;

  if (permission) {
    hasAccess = hasSinglePermission;
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll ? hasAll : hasAny;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
