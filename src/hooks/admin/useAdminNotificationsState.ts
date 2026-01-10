"use client";

import { useState, useMemo } from "react";

import { toast } from "sonner";

import type { Notification, NotificationFilters } from "@/lib/admin/notifications/types";
import { fetchNotifications } from "@/lib/admin/notifications/fetchNotifications";
import { fetchAllNotifications } from "@/lib/admin/notifications/fetchAllNotifications";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useAdminNotificationsState = () => {
  const [notificationsCache, setNotificationsCache] = useState<{
    data: Notification[];
    timestamp: number;
  } | null>(null);

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

  const isNotificationsCacheValid = useMemo(() => {
    if (!notificationsCache) return false;
    const now = Date.now();
    return (now - notificationsCache.timestamp) < CACHE_DURATION;
  }, [notificationsCache]);

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

    // Check cache first (only if not forcing refresh and no filters applied)
    if (!forceRefresh && notificationsCache && isNotificationsCacheValid && Object.keys(filters).length === 0) {
      setNotifications(notificationsCache.data);
      return;
    }

    setIsLoadingNotifications(true);
    try {
      const result = isAdmin 
        ? await fetchAllNotifications()
        : await fetchNotifications({ filters });
      
      if (result.success && result.notifications) {
        setNotifications(result.notifications);
        // Only cache if no filters
        if (Object.keys(filters).length === 0) {
          setNotificationsCache({
            data: result.notifications,
            timestamp: Date.now(),
          });
        }
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
    isNotificationsCacheValid,
  };
};
