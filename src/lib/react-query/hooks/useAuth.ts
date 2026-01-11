import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch, getAccessToken, removeTokens, setTokens } from "@/lib/auth/token";
import { queryKeys } from "../keys";

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

type LoginParams = {
  email: string;
  password: string;
};

type LoginResponse = {
  access_token: string;
  refresh_token: string;
  user: User;
};

// Fetch current user
const fetchMe = async (): Promise<User> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("No access token");
  }

  const response = await authenticatedFetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
  });

  if (!response.ok) {
    if (response.status === 401) {
      removeTokens();
    }
    throw new Error("Failed to fetch user");
  }

  const data = (await response.json())?.data;

  return {
    id: data.id || data._id,
    email: data.email,
    role: data.roles?.[0] || data.role || "user",
    firstName: data.firstName,
    lastName: data.lastName,
    userName: data.userName,
    customerId: data.customerId,
    companyName: data.companyName,
    companyLogo: data.companyLogo,
  };
};

// Login
const login = async ({ email, password }: LoginParams): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Login failed" }));
    throw new Error(error.error || error.message || "Invalid credentials");
  }

  const data = (await response.json())?.data;

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    user: {
      id: data.user?.id || data.user?._id,
      email: data.user?.email,
      role: data.user?.roles?.[0] || data.user?.role || "user",
      firstName: data.user?.firstName,
      lastName: data.user?.lastName,
      userName: data.user?.userName,
      customerId: data.user?.customerId,
      companyName: data.user?.companyName,
      companyLogo: data.user?.companyLogo,
    },
  };
};

// Hook to fetch current user
export const useMe = () => {
  const token = getAccessToken();
  
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: fetchMe,
    enabled: !!token,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // Store tokens
      setTokens({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      });

      // Set user data in cache
      queryClient.setQueryData(queryKeys.auth.me, data.user);

      toast.success("Login successful", {
        description: `Welcome back, ${data.user.firstName || data.user.email}!`,
      });
    },
    onError: (error: Error) => {
      toast.error("Login failed", {
        description: error.message || "Invalid credentials",
      });
    },
  });
};

// Hook for logout
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      removeTokens();
    },
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
      
      toast.success("Logged out successfully");
    },
  });
};
