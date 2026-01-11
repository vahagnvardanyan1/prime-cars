"use client";

import { useUser } from "@/contexts/UserContext";
import { hasPermission, hasAnyPermission, hasAllPermissions, canAccessAdminPanel, type Permission } from "./permissions";

export const usePermission = (permission: Permission): boolean => {
  const { user } = useUser();
  
  if (!user || !user.role) {
    return false;
  }
  
  return hasPermission({ role: user.role, permission });
};

export const usePermissions = (permissions: Permission[]): {
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

export const useCanAccessAdminPanel = (): boolean => {
  const { user } = useUser();
  
  if (!user || !user.role) {
    return false;
  }
  
  return canAccessAdminPanel(user.role);
};

export const useRole = () => {
  const { user } = useUser();
  
  return {
    role: user?.role || null,
    isAdmin: user?.role?.toLowerCase() === "admin",
    isManager: user?.role?.toLowerCase() === "manager",
    isSupport: user?.role?.toLowerCase() === "support",
    isViewer: user?.role?.toLowerCase() === "viewer",
    isUser: user?.role?.toLowerCase() === "user",
  };
};
