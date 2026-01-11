"use client";

import type { ReactNode } from "react";

import { usePermission, usePermissions } from "@/lib/rbac/hooks";
import type { Permission } from "@/lib/rbac/permissions";

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
  const hasSinglePermission = usePermission({ 
    permission: permission || "view_own_profile" as Permission 
  });
  
  // Multiple permissions check
  const { hasAny, hasAll } = usePermissions({ permissions: permissions || [] });

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
