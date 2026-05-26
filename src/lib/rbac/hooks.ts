"use client";

import { useUser } from "@/contexts/UserContext";

import { isAdmin } from "./permissions";

export const useRole = () => {
  const { user } = useUser();
  
  const userRole = user?.role || null;
  
  return {
    role: userRole,
    isAdmin: userRole ? isAdmin({ role: userRole }) : false,
  };
};
