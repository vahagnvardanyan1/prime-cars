import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { toast } from "sonner";

import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/auth/token";
import type { AdminUser, CreateUserData } from "@/lib/admin/types";
import { queryKeys } from "../keys";

type FetchUsersParams = {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
};

type FetchUsersResponse = {
  users: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
};

// Fetch all users
const fetchUsers = async (params?: FetchUsersParams): Promise<FetchUsersResponse> => {
  const searchParams = new URLSearchParams();
  
  if (params?.search) searchParams.append("search", params.search);
  if (params?.role) searchParams.append("role", params.role);
  if (params?.page) searchParams.append("page", String(params.page));
  if (params?.limit) searchParams.append("limit", String(params.limit));

  const url = `${API_BASE_URL}/users${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  
  const response = await authenticatedFetch(url, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  const result = await response.json();
  const users = Array.isArray(result) ? result : result.data || [];

  return {
    users: users.map((user: Record<string, unknown>) => {
      const roles = user.roles as unknown[] | undefined;
      return {
        id: user._id || user.id,
        customerId: user.customerId,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.userName || user.username,
        email: user.email,
        passport: user.passportNumber || user.passport,
        phone: user.phone,
        location: user.location,
        country: user.country,
        companyName: user.companyName,
        role: (roles?.[0] || user.role || "user") as string,
        coefficient: user.coefficient,
        category: user.category,
      };
    }),
    total: result.total || users.length,
    page: result.page || 1,
    totalPages: result.totalPages || 1,
  };
};

// Create user
const createUser = async (data: CreateUserData): Promise<AdminUser> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to create user" }));
    throw new Error(error.error || error.message || "Failed to create user");
  }

  const result = await response.json();
  const user = result.data || result;
  const userRoles = user.roles as unknown[] | undefined;

  return {
    id: user._id || user.id,
    customerId: user.customerId,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.userName || user.username,
    email: user.email,
    passport: user.passportNumber || user.passport,
    phone: user.phone,
    location: user.location,
    country: user.country,
    companyName: user.companyName,
    role: (userRoles?.[0] || user.role || "user") as string,
    coefficient: user.coefficient,
    category: user.category,
  };
};

// Update user
const updateUser = async ({ id, data }: { id: string; data: Partial<AdminUser> }): Promise<AdminUser> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to update user" }));
    throw new Error(error.error || error.message || "Failed to update user");
  }

  const result = await response.json();
  const user = result.data || result;
  const userRoles = user.roles as unknown[] | undefined;

  return {
    id: user._id || user.id,
    customerId: user.customerId,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.userName || user.username,
    email: user.email,
    passport: user.passportNumber || user.passport,
    phone: user.phone,
    location: user.location,
    country: user.country,
    companyName: user.companyName,
    role: (userRoles?.[0] || user.role || "user") as string,
    coefficient: user.coefficient,
    category: user.category,
  };
};

// Delete user
const deleteUser = async (id: string): Promise<void> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to delete user" }));
    throw new Error(error.error || error.message || "Failed to delete user");
  }
};

// Update user coefficient
const updateUserCoefficient = async ({ id, coefficient }: { id: string; coefficient: number }): Promise<AdminUser> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/users/${id}/coefficient`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ coefficient }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to update coefficient" }));
    throw new Error(error.error || error.message || "Failed to update coefficient");
  }

  const result = await response.json();
  const user = result.data || result;
  const userRoles = user.roles as unknown[] | undefined;

  return {
    id: user._id || user.id,
    customerId: user.customerId,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.userName || user.username,
    email: user.email,
    passport: user.passportNumber || user.passport,
    phone: user.phone,
    location: user.location,
    country: user.country,
    companyName: user.companyName,
    role: (userRoles?.[0] || user.role || "user") as string,
    coefficient: user.coefficient,
    category: user.category,
  };
};

// Hooks

export const useUsers = (params?: FetchUsersParams, options?: Omit<UseQueryOptions<FetchUsersResponse>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => fetchUsers(params),
    staleTime: 1000 * 60, // 1 minute
    ...options,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("User created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create user", {
        description: error.message,
      });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(data.id) });
      toast.success("User updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update user", {
        description: error.message,
      });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("User deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete user", {
        description: error.message,
      });
    },
  });
};

export const useUpdateUserCoefficient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserCoefficient,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(data.id) });
      toast.success("Coefficient updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update coefficient", {
        description: error.message,
      });
    },
  });
};
