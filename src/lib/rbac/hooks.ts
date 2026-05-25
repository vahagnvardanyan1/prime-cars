"use client";

import { useUser } from "@/contexts/UserContext";

import { isAdmin, isManager } from "./permissions";

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
