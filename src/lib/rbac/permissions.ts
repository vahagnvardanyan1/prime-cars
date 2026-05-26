export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  USER = "user",
  SUPPORT = "support",
  VIEWER = "viewer",
}

export const isAdmin = ({ role }: { role: string }): boolean => {
  return role.toLowerCase() === UserRole.ADMIN;
};
