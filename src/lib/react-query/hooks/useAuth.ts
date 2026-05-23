import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
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
  username: string;
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
const login = async ({ username, password }: LoginParams): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("invalid_credentials");
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
  const t = useTranslations("auth.toasts");

  return useMutation({
    mutationFn: login,
    onSuccess: (data, variables) => {
      setTokens({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      });

      queryClient.setQueryData(queryKeys.auth.me, data.user);

      toast.success(t("loginSuccessTitle"), {
        description: t("loginSuccessDescription", { username: variables.username }),
      });
    },
    onError: (error: Error) => {
      const isNetworkError =
        error.name === "TypeError" || error.message === "Failed to fetch";
      toast.error(t("loginFailedTitle"), {
        description: t(isNetworkError ? "networkError" : "invalidCredentials"),
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
    },
  });
};
