"use client";

import { useState, useCallback } from "react";

import { toast } from "sonner";

import type { Notification, NotificationFilters } from "@/lib/admin/notifications/types";
import { fetchNotifications } from "@/lib/admin/notifications/fetchNotifications";
import { fetchAllNotifications } from "@/lib/admin/notifications/fetchAllNotifications";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

type CacheData = {
  data: Notification[];
  timestamp: number;
};

type CacheKey = {
  isAdmin: boolean;
  filters: NotificationFilters;
};

// In-memory cache per filter+role combination
const notificationsCache = new Map<string, CacheData>();

// Generate cache key from filters and admin status
const getCacheKey = ({ isAdmin, filters }: CacheKey): string => {
  const filterKey = JSON.stringify(filters || {});
  return `${isAdmin ? "admin" : "user"}-${filterKey}`;
};

export const useAdminNotificationsState = () => {
  const [isCreateNotificationOpen, setIsCreateNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [currentCacheKey, setCurrentCacheKey] = useState<string | null>(null);

  const openCreateNotification = () => setIsCreateNotificationOpen(true);
  const closeCreateNotification = () => setIsCreateNotificationOpen(false);

  const updateFilters = (nextFilters: NotificationFilters) => {
    setFilters(nextFilters);
  };

  const clearFilters = () => {
    setFilters({});
  };

  const isCacheValid = useCallback(({ isAdmin, filters }: CacheKey): boolean => {
    const key = getCacheKey({ isAdmin, filters });
    const cached = notificationsCache.get(key);
    if (!cached) return false;
    const now = Date.now();
    return (now - cached.timestamp) < CACHE_DURATION;
  }, []);

  const invalidateCache = useCallback(() => {
    notificationsCache.clear();
    console.log("🗑️ Notifications cache cleared");
  }, []);

  const loadNotifications = async ({ 
    forceRefresh = false,
    isAdmin = false,
  }: { 
    forceRefresh?: boolean;
    isAdmin?: boolean;
  } = {}) => {
    // Check if user is authenticated
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      return; // Don't show error if not authenticated
    }

    const cacheKey = getCacheKey({ isAdmin, filters });

    // Check cache first (only if not forcing refresh)
    if (!forceRefresh && isCacheValid({ isAdmin, filters })) {
      const cached = notificationsCache.get(cacheKey);
      if (cached) {
        console.log(`✅ Using cached notifications for ${cacheKey}`);
        setNotifications(cached.data);
        setCurrentCacheKey(cacheKey);
        return;
      }
    }

    setIsLoadingNotifications(true);
    try {
      console.log(`🔄 Fetching notifications from API for ${cacheKey}`);
      const result = isAdmin 
        ? await fetchAllNotifications()
        : await fetchNotifications({ filters });
      
      if (result.success && result.notifications) {
        setNotifications(result.notifications);
        setCurrentCacheKey(cacheKey);
        
        // Cache the result
        notificationsCache.set(cacheKey, {
          data: result.notifications,
          timestamp: Date.now(),
        });
        console.log(`💾 Cached ${result.notifications.length} notifications for ${cacheKey}`);
      } else {
        // Only show error if authenticated (not 401/403 errors)
        if (!result.error?.includes('401') && !result.error?.includes('403') && !result.error?.includes('Unauthorized')) {
          toast.error("Failed to load notifications", {
            description: result.error || "Could not fetch notifications from server.",
          });
        }
      }
    } catch (error) {
      // Only show error if it's not an auth error
      const errorMessage = error instanceof Error ? error.message : "";
      if (!errorMessage.includes('401') && !errorMessage.includes('403') && !errorMessage.includes('Unauthorized')) {
        toast.error("Failed to load notifications", {
          description: errorMessage || "An unexpected error occurred.",
        });
      }
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  return {
    notifications,
    isLoadingNotifications,
    isCreateNotificationOpen,
    openCreateNotification,
    closeCreateNotification,
    loadNotifications,
    filters,
    updateFilters,
    clearFilters,
    invalidateCache,
    isCacheValid,
  };
};
