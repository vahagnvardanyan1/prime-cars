import { useMemo, useState, useEffect, useCallback } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { toast } from "sonner";

import type { AdminUser } from "@/lib/admin/types";

import { fetchUsers } from "@/lib/admin/fetchUsers";
import { isCacheValid, createCacheEntry } from "@/lib/utils/cache";
import { isAuthenticated, isAuthError } from "@/lib/utils/error-handling";
import { buildUrlParams, updateUrlWithParams } from "@/lib/utils/url-params";
import { filterUsers, defaultUserFilters } from "@/lib/utils/user-filters";
import type { UserFiltersState } from "@/lib/utils/user-filters";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Module-level cache that persists across component mounts/unmounts
let usersCache: {
  data: AdminUser[];
  timestamp: number;
} | null = null;

export type { UserFiltersState };

export const useAdminUsersState = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<AdminUser[]>(() => usersCache?.data || []);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  
  // Pagination state - initialize from URL
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const saved = searchParams.get("page");
    return saved ? parseInt(saved, 10) : 1;
  });
  const [pageSize, setPageSize] = useState<number>(() => {
    const saved = searchParams.get("pageSize");
    return saved ? parseInt(saved, 10) : 25;
  });
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Initialize filters from URL
  const [filters, setFilters] = useState<UserFiltersState>(() => ({
    search: searchParams.get("search") || "",
    country: searchParams.get("country") || "all",
  }));

  const openCreateUser = () => setIsCreateUserOpen(true);
  const closeCreateUser = () => setIsCreateUserOpen(false);

  const isUsersCacheValid = useMemo(() => {
    return isCacheValid({ cache: usersCache, duration: CACHE_DURATION });
  }, []);

  // Apply filters to get filtered users
  const filteredUsers = useMemo(() => {
    return filterUsers({ users: allUsers, filters });
  }, [allUsers, filters]);

  // Update URL when filters change
  const updateFilters = useCallback((newFilters: UserFiltersState) => {
    setFilters(newFilters);

    // Build URL params
    const params = buildUrlParams({ 
      params: {
        search: newFilters.search,
        country: newFilters.country !== "all" ? newFilters.country : "",
      }
    });

    updateUrlWithParams({ params, router });
  }, [router]);

  const clearFilters = useCallback(() => {
    updateFilters(defaultUserFilters);
  }, [updateFilters]);

  const loadUsers = useCallback(async ({ 
    forceRefresh = false,
    page,
    limit,
  }: { 
    forceRefresh?: boolean;
    page?: number;
    limit?: number;
  } = {}) => {
    if (!isAuthenticated()) {
      return;
    }

    const pageToFetch = page !== undefined ? page : currentPage;
    const limitToFetch = limit !== undefined ? limit : pageSize;

    const useCache = !forceRefresh && usersCache && isUsersCacheValid;
    
    if (useCache) {
      setAllUsers(usersCache.data);
    }

    if (!useCache) {
      setIsLoadingUsers(true);
    }
    
    try {
      const result = await fetchUsers({ page: pageToFetch, limit: limitToFetch });
      
      if (result.success && result.users) {
        setAllUsers(result.users);
        setTotalItems(result.total || 0);
        setTotalPages(result.totalPages || 0);
        setCurrentPage(result.page || pageToFetch);
        
        usersCache = createCacheEntry({ data: result.users });
      } else {
        if (!isAuthError({ errorMessage: result.error })) {
          toast.error("Failed to load users", {
            description: result.error || "Could not fetch users from server.",
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "";
      if (!isAuthError({ errorMessage })) {
        toast.error("Failed to load users", {
          description: errorMessage || "An unexpected error occurred.",
        });
      }
    } finally {
      setIsLoadingUsers(false);
    }
  }, [currentPage, pageSize, isUsersCacheValid]);

  const changePage = useCallback((page: number) => {
    setCurrentPage(page);
    
    // Update URL with new page
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    params.set("pageSize", pageSize.toString());
    updateUrlWithParams({ params, router });
    
    loadUsers({ page, limit: pageSize });
  }, [pageSize, router, loadUsers]);

  const changePageSize = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    
    // Update URL
    const params = new URLSearchParams(window.location.search);
    params.set("page", "1");
    params.set("pageSize", size.toString());
    updateUrlWithParams({ params, router });
    
    loadUsers({ page: 1, limit: size });
  }, [router, loadUsers]);

  // Sync filters and pagination with URL on mount and when searchParams change
  useEffect(() => {
    const urlFilters: UserFiltersState = {
      search: searchParams.get("search") || "",
      country: searchParams.get("country") || "all",
    };
    setFilters(urlFilters);
    
    // Sync pagination from URL
    const urlPage = searchParams.get("page");
    const urlPageSize = searchParams.get("pageSize");
    
    if (urlPage) {
      const parsedPage = parseInt(urlPage, 10);
      if (parsedPage !== currentPage) {
        setCurrentPage(parsedPage);
      }
    }
    
    if (urlPageSize) {
      const parsedSize = parseInt(urlPageSize, 10);
      if (parsedSize !== pageSize) {
        setPageSize(parsedSize);
      }
    }
  }, [searchParams, currentPage, pageSize]);

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
    // Pagination
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    changePage,
    changePageSize,
  };
};
