"use client";

import { useEffect, type ReactNode } from "react";

import { useRouter } from "next/navigation";

import { usePermission, useCanAccessAdminPanel } from "@/lib/rbac/hooks";
import { Permission } from "@/lib/rbac/permissions";
import { useUser } from "@/contexts/UserContext";

type ProtectedRouteProps = {
  children: ReactNode;
  permission?: Permission;
  requireAdmin?: boolean;
  requireAuth?: boolean;
  redirectTo?: string;
};

export const ProtectedRoute = ({
  children,
  permission,
  requireAdmin = false,
  requireAuth = true,
  redirectTo = "/",
}: ProtectedRouteProps) => {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const hasPermission = usePermission(permission || Permission.VIEW_OWN_PROFILE);
  const canAccessAdmin = useCanAccessAdminPanel();

  useEffect(() => {
    if (isLoading) return;

    // Check if authentication is required
    if (requireAuth && !user) {
      router.push(redirectTo);
      return;
    }

    // Check if admin access is required
    if (requireAdmin && !canAccessAdmin) {
      router.push(redirectTo);
      return;
    }

    // Check specific permission
    if (permission && !hasPermission) {
      router.push(redirectTo);
      return;
    }
  }, [user, isLoading, hasPermission, canAccessAdmin, requireAdmin, requireAuth, permission, redirectTo, router]);

  // Show nothing while checking permissions
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render children if unauthorized
  if (requireAuth && !user) return null;
  if (requireAdmin && !canAccessAdmin) return null;
  if (permission && !hasPermission) return null;

  return <>{children}</>;
};
