import { useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type { AdminUser } from "@/lib/admin/types";
import { useUsers } from "@/lib/react-query/hooks";

// No more manual cache! React Query handles it automatically

export type UserFiltersState = {
  search: string;
  country: string;
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

    return true;
  });
};

export const useAdminUsersStateRefactored = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

  // Get filters from URL
  const filters: UserFiltersState = useMemo(
    () => ({
      search: searchParams.get("search") || "",
      country: searchParams.get("country") || "all",
    }),
    [searchParams]
  );

  // Use React Query - automatic caching!
  const { data, isLoading, error, refetch } = useUsers({
    search: filters.search,
    // Add more server-side filters if API supports them
  });

  const allUsers = data?.users || [];

  // Client-side filtering (or move to server-side if API supports it)
  const filteredUsers = useMemo(
    () => filterUsers({ users: allUsers, filters }),
    [allUsers, filters]
  );

  const updateFilters = useCallback(
    ({ nextFilters }: { nextFilters: Partial<UserFiltersState> }) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(nextFilters).forEach(([key, value]) => {
        if (value && value !== "all" && value !== "") {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      });

      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const resetFilters = useCallback(() => {
    router.push("?");
  }, [router]);

  const openCreateUser = () => setIsCreateUserOpen(true);
  const closeCreateUser = () => setIsCreateUserOpen(false);

  return {
    filters,
    updateFilters,
    resetFilters,

    allUsers,
    filteredUsers,
    isLoading,
    error,
    refetch, // React Query's refetch function

    isCreateUserOpen,
    openCreateUser,
    closeCreateUser,

    // No more manual cache validation needed!
    // React Query handles it automatically based on staleTime
  };
};
