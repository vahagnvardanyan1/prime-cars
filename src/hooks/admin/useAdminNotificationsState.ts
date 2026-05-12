"use client";

import { useState, useCallback } from "react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import type { Notification, NotificationFilters } from "@/lib/admin/notifications/types";
import { fetchNotifications } from "@/lib/admin/notifications/fetchNotifications";
import { fetchAllNotifications } from "@/lib/admin/notifications/fetchAllNotifications";
import { createKeyedTTLCache } from "@/lib/utils/cache";

type CacheKey = {
  isAdmin: boolean;
  filters: NotificationFilters;
};

// Notifications are cached per (role × filters) combination. Default 10-min TTL
// from CACHE_DURATION applies — appropriate for admin-broadcast notifications
// that aren't expected to change minute-to-minute.
const notificationsCache = createKeyedTTLCache<string, Notification[]>();

const getCacheKey = ({ isAdmin, filters }: CacheKey): string => {
  const filterKey = JSON.stringify(filters || {});
  return `${isAdmin ? "admin" : "user"}-${filterKey}`;
};

// Module-level escape hatch so other components (e.g., NotificationPopup) can
// invalidate the cache after mutations they perform out-of-band.
export const clearNotificationsCache = () => {
  notificationsCache.clear();
};

export const useAdminNotificationsState = () => {
  const tNotifications = useTranslations("admin.notifications");
  const tCommon = useTranslations("common");

  const [isCreateNotificationOpen, setIsCreateNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [filters, setFilters] = useState<NotificationFilters>({});

  const openCreateNotification = () => setIsCreateNotificationOpen(true);
  const closeCreateNotification = () => setIsCreateNotificationOpen(false);

  const updateFilters = (nextFilters: NotificationFilters) => {
    setFilters(nextFilters);
  };

  const clearFilters = () => {
    setFilters({});
  };

  const invalidateCache = useCallback(() => {
    notificationsCache.clear();
  }, []);

  const updateNotificationInState = useCallback((notificationId: string, updates: Partial<Notification>) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, ...updates } : n))
    );
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

    if (!forceRefresh) {
      const cached = notificationsCache.get(cacheKey);
      if (cached) {
        setNotifications(cached);
        return;
      }
    }

    setIsLoadingNotifications(true);
    try {
      const result = isAdmin
        ? await fetchAllNotifications()
        : await fetchNotifications({ filters });

      if (result.success && result.notifications) {
        setNotifications(result.notifications);
        notificationsCache.set(cacheKey, result.notifications);
      } else {
        // Only show error if authenticated (not 401/403 errors)
        if (!result.error?.includes('401') && !result.error?.includes('403') && !result.error?.includes('Unauthorized')) {
          toast.error(tNotifications("loadFailedTitle"), {
            description: result.error || tNotifications("loadFailedDescription"),
          });
        }
      }
    } catch (error) {
      // Only show error if it's not an auth error
      const errorMessage = error instanceof Error ? error.message : "";
      if (!errorMessage.includes('401') && !errorMessage.includes('403') && !errorMessage.includes('Unauthorized')) {
        toast.error(tNotifications("loadFailedTitle"), {
          description: errorMessage || tCommon("unexpectedError"),
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
    updateNotificationInState,
    filters,
    updateFilters,
    clearFilters,
    invalidateCache,
  };
};
