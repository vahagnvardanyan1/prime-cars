"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useMe, useLogout } from "@/lib/react-query/hooks/useAuth";
import { removeTokens } from "@/lib/auth/token";

type User = {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  customerId?: string;
  companyName?: string;
  companyLogo?: string;
};

type UserContextType = {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  refreshUser: () => void;
  clearUser: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { data: user, isLoading, refetch } = useMe();
  const { mutate: logout } = useLogout();

  const refreshUser = () => {
    refetch();
  };

  const clearUser = () => {
    removeTokens();
    logout();
  };

  const isAdmin = user?.role?.toLowerCase() === "admin";

  return (
    <UserContext.Provider value={{ user: user || null, isLoading, isAdmin, refreshUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
