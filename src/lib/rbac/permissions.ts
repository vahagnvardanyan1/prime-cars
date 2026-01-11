/**
 * Role-Based Access Control (RBAC) Permission System
 * Defines user roles, permissions, and access control functions
 */

export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  USER = "user",
  SUPPORT = "support",
  VIEWER = "viewer",
}

export enum Permission {
  // User permissions
  VIEW_OWN_PROFILE = "view_own_profile",
  EDIT_OWN_PROFILE = "edit_own_profile",
  VIEW_OWN_CARS = "view_own_cars",
  
  // Admin - User Management
  VIEW_ALL_USERS = "view_all_users",
  CREATE_USER = "create_user",
  EDIT_USER = "edit_user",
  DELETE_USER = "delete_user",
  UPDATE_USER_COEFFICIENT = "update_user_coefficient",
  
  // Admin - Car Management
  VIEW_ALL_CARS = "view_all_cars",
  CREATE_CAR = "create_car",
  EDIT_CAR = "edit_car",
  DELETE_CAR = "delete_car",
  
  // Admin - Notification Management
  VIEW_ALL_NOTIFICATIONS = "view_all_notifications",
  CREATE_NOTIFICATION = "create_notification",
  SEND_NOTIFICATION = "send_notification",
  DELETE_NOTIFICATION = "delete_notification",
  
  // Admin - Settings & System
  VIEW_SETTINGS = "view_settings",
  EDIT_SETTINGS = "edit_settings",
  VIEW_DASHBOARD = "view_dashboard",
  MANAGE_SHIPPING_PRICES = "manage_shipping_prices",
  
  // Calculator
  USE_CALCULATOR = "use_calculator",
  VIEW_CALCULATOR_RESULTS = "view_calculator_results",
}

// Permission map for each role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Admin has all permissions
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_OWN_CARS,
    Permission.VIEW_ALL_USERS,
    Permission.CREATE_USER,
    Permission.EDIT_USER,
    Permission.DELETE_USER,
    Permission.UPDATE_USER_COEFFICIENT,
    Permission.VIEW_ALL_CARS,
    Permission.CREATE_CAR,
    Permission.EDIT_CAR,
    Permission.DELETE_CAR,
    Permission.VIEW_ALL_NOTIFICATIONS,
    Permission.CREATE_NOTIFICATION,
    Permission.SEND_NOTIFICATION,
    Permission.DELETE_NOTIFICATION,
    Permission.VIEW_SETTINGS,
    Permission.EDIT_SETTINGS,
    Permission.VIEW_DASHBOARD,
    Permission.MANAGE_SHIPPING_PRICES,
    Permission.USE_CALCULATOR,
    Permission.VIEW_CALCULATOR_RESULTS,
  ],
  [UserRole.MANAGER]: [
    // Manager can manage users and cars but not settings
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_OWN_CARS,
    Permission.VIEW_ALL_USERS,
    Permission.CREATE_USER,
    Permission.EDIT_USER,
    Permission.VIEW_ALL_CARS,
    Permission.CREATE_CAR,
    Permission.EDIT_CAR,
    Permission.VIEW_ALL_NOTIFICATIONS,
    Permission.CREATE_NOTIFICATION,
    Permission.SEND_NOTIFICATION,
    Permission.VIEW_DASHBOARD,
    Permission.USE_CALCULATOR,
    Permission.VIEW_CALCULATOR_RESULTS,
  ],
  [UserRole.SUPPORT]: [
    // Support can view and assist but not delete or modify critical data
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_ALL_USERS,
    Permission.VIEW_ALL_CARS,
    Permission.VIEW_ALL_NOTIFICATIONS,
    Permission.CREATE_NOTIFICATION,
    Permission.SEND_NOTIFICATION,
    Permission.VIEW_DASHBOARD,
    Permission.USE_CALCULATOR,
    Permission.VIEW_CALCULATOR_RESULTS,
  ],
  [UserRole.VIEWER]: [
    // Viewer can only view data
    Permission.VIEW_OWN_PROFILE,
    Permission.VIEW_ALL_USERS,
    Permission.VIEW_ALL_CARS,
    Permission.VIEW_ALL_NOTIFICATIONS,
    Permission.VIEW_DASHBOARD,
    Permission.USE_CALCULATOR,
    Permission.VIEW_CALCULATOR_RESULTS,
  ],
  [UserRole.USER]: [
    // Regular user permissions
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_OWN_CARS,
    Permission.USE_CALCULATOR,
    Permission.VIEW_CALCULATOR_RESULTS,
  ],
};

/**
 * Checks if a role has a specific permission
 */
export const hasPermission = ({ role, permission }: { role: string; permission: Permission }): boolean => {
  const normalizedRole = role.toLowerCase() as UserRole;
  const permissions = ROLE_PERMISSIONS[normalizedRole];
  
  if (!permissions) {
    return false;
  }
  
  return permissions.includes(permission);
};

/**
 * Checks if a role has any of the specified permissions
 */
export const hasAnyPermission = ({ role, permissions }: { role: string; permissions: Permission[] }): boolean => {
  return permissions.some(permission => hasPermission({ role, permission }));
};

/**
 * Checks if a role has all of the specified permissions
 */
export const hasAllPermissions = ({ role, permissions }: { role: string; permissions: Permission[] }): boolean => {
  return permissions.every(permission => hasPermission({ role, permission }));
};

/**
 * Checks if a role is Admin
 */
export const isAdmin = ({ role }: { role: string }): boolean => {
  return role.toLowerCase() === UserRole.ADMIN;
};

/**
 * Checks if a role is Manager
 */
export const isManager = ({ role }: { role: string }): boolean => {
  return role.toLowerCase() === UserRole.MANAGER;
};

/**
 * Checks if a role can access the admin panel
 */
export const canAccessAdminPanel = ({ role }: { role: string }): boolean => {
  const normalizedRole = role.toLowerCase() as UserRole;
  return [UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPPORT, UserRole.VIEWER].includes(normalizedRole);
};
