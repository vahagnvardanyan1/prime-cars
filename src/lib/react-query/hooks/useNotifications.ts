import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/auth/token";
import type { Notification } from "@/lib/admin/notifications/types";
import { queryKeys } from "../keys";

type FetchNotificationsParams = {
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
};

type FetchNotificationsResponse = {
  notifications: Notification[];
  total: number;
  unreadCount: number;
};

type CreateNotificationData = {
  message: string;
  description?: string;
  reason?: string;
  userId?: string;
};

// Fetch notifications
const fetchNotifications = async (params?: FetchNotificationsParams): Promise<FetchNotificationsResponse> => {
  const searchParams = new URLSearchParams();
  
  if (params?.unreadOnly) searchParams.append("unreadOnly", "true");
  if (params?.page) searchParams.append("page", String(params.page));
  if (params?.limit) searchParams.append("limit", String(params.limit));

  const url = `${API_BASE_URL}/notifications/all${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  
  const response = await authenticatedFetch(url, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }

  const result = await response.json();
  const notifications = Array.isArray(result) ? result : result.data || [];

  const mapped = notifications.map((item: any) => {
    const notif = item.notification || item;
    return {
      id: notif._id || notif.id || "",
      recordId: item._id || "",
      message: notif.message || "",
      description: notif.description || "",
      reason: notif.reason || "",
      createdAt: notif.createdAt || new Date().toISOString(),
      isRead: item.is_read !== undefined ? item.is_read : (notif.isRead || false),
      userId: notif.userId || item.userId || "",
    };
  });

  return {
    notifications: mapped,
    total: result.total || mapped.length,
    unreadCount: mapped.filter((n: Notification) => !n.isRead).length,
  };
};

// Create notification
const createNotification = async (data: CreateNotificationData): Promise<Notification> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/notifications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to create notification" }));
    throw new Error(error.error || error.message || "Failed to create notification");
  }

  const result = await response.json();
  const notif = result.data || result;

  return {
    id: notif._id || notif.id || "",
    recordId: notif._id || "",
    message: notif.message || "",
    description: notif.description || "",
    reason: notif.reason || "",
    createdAt: notif.createdAt || new Date().toISOString(),
    isRead: notif.isRead || false,
    userId: notif.userId || "",
  };
};

// Mark as read
const markAsRead = async (id: string): Promise<void> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: "PATCH",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to mark as read" }));
    throw new Error(error.error || error.message || "Failed to mark as read");
  }
};

// Delete notification
const deleteNotification = async (id: string): Promise<void> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/notifications/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to delete notification" }));
    throw new Error(error.error || error.message || "Failed to delete notification");
  }
};

// Hooks

export const useNotifications = (params?: FetchNotificationsParams) => {
  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => fetchNotifications(params),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
};

export const useUnreadNotifications = () => {
  return useQuery({
    queryKey: queryKeys.notifications.unread,
    queryFn: () => fetchNotifications({ unreadOnly: true }),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      toast.success("Notification created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create notification", {
        description: error.message,
      });
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
    onError: (error: Error) => {
      toast.error("Failed to mark as read", {
        description: error.message,
      });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      toast.success("Notification deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete notification", {
        description: error.message,
      });
    },
  });
};
