import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import type { AdminUser, AdminUserRole } from "@/lib/admin/types";
import { fetchUsers } from "@/lib/admin/fetchUsers";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Module-level cache that persists across component mounts/unmounts
let usersCache: {
  data: AdminUser[];
  timestamp: number;
} | null = null;

export type UserFiltersState = {
  search: string;
  country: string;
  role: AdminUserRole | "all";
};

const filterUsers = ({ users, filters }: { users: AdminUser[]; filters: UserFiltersState }) => {
  return users.filter((user) => {
    // Search filter (search in name, username, email, phone, passport)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.username.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.phone?.toLowerCase().includes(searchLower) ||
        user.passport?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;
    }

    // Country filter
    if (filters.country !== "all" && user.country !== filters.country) {
      return false;
    }

    // Role filter
    if (filters.role !== "all" && user.role !== filters.role) {
      return false;
    }

    return true;
  });
};

export const useAdminUsersState = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<AdminUser[]>(() => usersCache?.data || []);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Initialize filters from URL
  const [filters, setFilters] = useState<UserFiltersState>(() => ({
    search: searchParams.get("search") || "",
    country: searchParams.get("country") || "all",
    role: (searchParams.get("role") as AdminUserRole | "all") || "all",
  }));

  const openCreateUser = () => setIsCreateUserOpen(true);
  const closeCreateUser = () => setIsCreateUserOpen(false);

  const isUsersCacheValid = useMemo(() => {
    if (!usersCache) return false;
    const now = Date.now();
    return (now - usersCache.timestamp) < CACHE_DURATION;
  }, []);

  // Apply filters to get filtered users
  const filteredUsers = useMemo(() => {
    return filterUsers({ users: allUsers, filters });
  }, [allUsers, filters]);

  // Update URL when filters change
  const updateFilters = useCallback((newFilters: UserFiltersState) => {
    setFilters(newFilters);

    // Build URL params
    const params = new URLSearchParams();
    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.country !== "all") params.set("country", newFilters.country);
    if (newFilters.role !== "all") params.set("role", newFilters.role);

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;

    router.replace(newUrl, { scroll: false });
  }, [router]);

  const clearFilters = useCallback(() => {
    const defaultFilters: UserFiltersState = {
      search: "",
      country: "all",
      role: "all",
    };
    updateFilters(defaultFilters);
  }, [updateFilters]);

  const loadUsers = async ({ forceRefresh = false }: { forceRefresh?: boolean } = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      return;
    }

    if (!forceRefresh && usersCache && isUsersCacheValid) {
      setAllUsers(usersCache.data);
      return;
    }

    setIsLoadingUsers(true);
    try {
      const result = await fetchUsers();
      
      if (result.success && result.users) {
        setAllUsers(result.users);
        usersCache = {
          data: result.users,
          timestamp: Date.now(),
        };
      } else {
        if (!result.error?.includes('401') && !result.error?.includes('403') && !result.error?.includes('Unauthorized')) {
          toast.error("Failed to load users", {
            description: result.error || "Could not fetch users from server.",
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "";
      if (!errorMessage.includes('401') && !errorMessage.includes('403') && !errorMessage.includes('Unauthorized')) {
        toast.error("Failed to load users", {
          description: errorMessage || "An unexpected error occurred.",
        });
      }
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Sync filters with URL on mount and when searchParams change
  useEffect(() => {
    const urlFilters: UserFiltersState = {
      search: searchParams.get("search") || "",
      country: searchParams.get("country") || "all",
      role: (searchParams.get("role") as AdminUserRole | "all") || "all",
    };
    setFilters(urlFilters);
  }, [searchParams]);

  return {
    users: filteredUsers,
    isLoadingUsers,
    isCreateUserOpen,
    openCreateUser,
    closeCreateUser,
    loadUsers,
    isUsersCacheValid,
    filters,
    updateFilters,
    clearFilters,
  };
};

