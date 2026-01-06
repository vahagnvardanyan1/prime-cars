"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getAccessToken, authenticatedFetch, removeTokens } from "@/lib/auth/token";
import { API_BASE_URL } from "@/i18n/config";

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
  refreshUser: (skipRefreshMechanism?: boolean) => Promise<void>;
  clearUser: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async (skipRefreshMechanism = false) => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      console.log("Fetching user from API...");
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      let response: Response;
      
      // If skipRefreshMechanism is true (right after login), use regular fetch
      // Otherwise use authenticatedFetch which handles token refresh
      if (skipRefreshMechanism) {
        console.log("Using fresh token from login - skipping refresh mechanism");
        response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          signal: controller.signal,
        });
      } else {
        response = await authenticatedFetch(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          signal: controller.signal,
        });
      }

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error("Failed to fetch user from API:", response.status, response.statusText);
        
        // If still unauthorized after token refresh attempt, clear tokens
        if (response.status === 401) {
          removeTokens();
        }
        
        setUser(null);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      console.log("User data received:", data);
      
      setUser({
        id: data.id || data._id,
        email: data.email,
        role: data.roles?.[0] || data.role || "user",
        firstName: data.firstName,
        lastName: data.lastName,
        userName: data.userName,
        customerId: data.customerId,
        companyName: data.companyName,
        companyLogo: data.companyLogo,
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching user:", error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error("Request timed out after 10 seconds");
        } else if (error.message.includes("refresh token")) {
          // Token refresh failed, clear everything
          removeTokens();
        }
      }
      setUser(null);
      setIsLoading(false);
    }
  };

  const refreshUser = async (skipRefreshMechanism = false) => {
    setIsLoading(true);
    await fetchUser(skipRefreshMechanism);
  };

  const clearUser = () => {
    setUser(null);
    removeTokens();
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const isAdmin = user?.role?.toLowerCase() === "admin";

  return (
    <UserContext.Provider value={{ user, isLoading, isAdmin, refreshUser, clearUser }}>
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

