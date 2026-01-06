"use client";

import { useMemo, useState } from "react";

import type { AdminUser } from "@/lib/admin/types";
import { fetchUsers } from "@/lib/admin/fetchUsers";
import { toast } from "sonner";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Module-level cache that persists across component mounts/unmounts
let usersCache: {
  data: AdminUser[];
  timestamp: number;
} | null = null;

export const useAdminUsersState = () => {
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>(() => usersCache?.data || []);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const openCreateUser = () => setIsCreateUserOpen(true);
  const closeCreateUser = () => setIsCreateUserOpen(false);

  const isUsersCacheValid = useMemo(() => {
    if (!usersCache) return false;
    const now = Date.now();
    return (now - usersCache.timestamp) < CACHE_DURATION;
  }, []);

  const loadUsers = async ({ forceRefresh = false }: { forceRefresh?: boolean } = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      return;
    }

    if (!forceRefresh && usersCache && isUsersCacheValid) {
      setUsers(usersCache.data);
      return;
    }

    setIsLoadingUsers(true);
    try {
      const result = await fetchUsers();
      
      if (result.success && result.users) {
        setUsers(result.users);
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

  return {
    users,
    isLoadingUsers,
    isCreateUserOpen,
    openCreateUser,
    closeCreateUser,
    loadUsers,
    isUsersCacheValid,
  };
};

