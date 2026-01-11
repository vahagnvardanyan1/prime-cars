import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/auth/token";
import type { Notification, NotificationFilters, BackendNotificationResponse } from "./types";

type FetchNotificationsResponse = {
  success: boolean;
  notifications?: Notification[];
  error?: string;
};

export const fetchNotifications = async ({
  filters,
}: {
  filters?: NotificationFilters;
} = {}): Promise<FetchNotificationsResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters?.isRead) {
      params.append("isRead", filters.isRead);
    }

    const url = `${API_BASE_URL}/notifications${params.toString() ? `?${params.toString()}` : ""}`;

    const response = await authenticatedFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: "Failed to fetch notifications" 
      }));
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    const result = (await response.json())?.data;

    // Backend returns structure: { _id, notification: {...}, is_read, readedTime }
    const notifications: Notification[] = Array.isArray(result) ? result.map((item: BackendNotificationResponse) => {
      const notif = item.notification || {}; // Support both nested and direct structure
      return {
        id: notif._id || notif.id || "", // notification._id - used for mark-as-read
        recordId: item._id || "", // Outer _id (user-notification record)
        message: notif.message || "",
        description: notif.description || "",
        reason: notif.reason || "",
        createdAt: notif.createdAt || new Date().toISOString(),
        isRead: item.is_read !== undefined ? item.is_read : (notif.isRead || false),
        userId: notif.userId || item.userId || "",
      };
    }) : [];

    return {
      success: true,
      notifications,
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};
