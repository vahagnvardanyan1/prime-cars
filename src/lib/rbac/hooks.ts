"use client";

import { useUser } from "@/contexts/UserContext";

import type { Permission } from "./permissions";
import { hasPermission, hasAnyPermission, hasAllPermissions, canAccessAdminPanel, isAdmin, isManager } from "./permissions";

/**
 * Hook to check if the current user has a specific permission
 */
export const usePermission = ({ permission }: { permission: Permission }): boolean => {
  const { user } = useUser();
  
  if (!user || !user.role) {
    return false;
  }
  
  return hasPermission({ role: user.role, permission });
};

/**
 * Hook to check multiple permissions for the current user
 */
export const usePermissions = ({ permissions }: { permissions: Permission[] }): {
  hasAny: boolean;
  hasAll: boolean;
  check: (permission: Permission) => boolean;
} => {
  const { user } = useUser();
  
  if (!user || !user.role) {
    return {
      hasAny: false,
      hasAll: false,
      check: () => false,
    };
  }
  
  return {
    hasAny: hasAnyPermission({ role: user.role, permissions }),
    hasAll: hasAllPermissions({ role: user.role, permissions }),
    check: (permission: Permission) => hasPermission({ role: user.role, permission }),
  };
};

/**
 * Hook to check if the current user can access the admin panel
 */
export const useCanAccessAdminPanel = (): boolean => {
  const { user } = useUser();
  
  if (!user || !user.role) {
    return false;
  }
  
  return canAccessAdminPanel({ role: user.role });
};

/**
 * Hook to get the current user's role and role-based flags
 */
export const useRole = () => {
  const { user } = useUser();
  
  const userRole = user?.role || null;
  
  return {
    role: userRole,
    isAdmin: userRole ? isAdmin({ role: userRole }) : false,
    isManager: userRole ? isManager({ role: userRole }) : false,
    isSupport: userRole?.toLowerCase() === "support",
    isViewer: userRole?.toLowerCase() === "viewer",
    isUser: userRole?.toLowerCase() === "user",
  };
};
