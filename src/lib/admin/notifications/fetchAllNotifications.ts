import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/auth/token";
import type { Notification, BackendNotificationResponse } from "./types";

type FetchAllNotificationsResponse = {
  success: boolean;
  notifications?: Notification[];
  error?: string;
};

export const fetchAllNotifications = async (): Promise<FetchAllNotificationsResponse> => {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/notifications/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: "Failed to fetch all notifications" 
      }));
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    const result = await response.json();

    // Backend can return different structures:
    // Admin endpoint might return: [{ _id, message, description, ... }] (direct)
    // Or: [{ _id, notification: {...}, is_read }] (nested)
    const notifications: Notification[] = Array.isArray(result) ? result.map((item: BackendNotificationResponse) => {
      // Check if item has nested notification object or is direct
      const notif = item.notification || item;
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
    console.error("Error fetching all notifications:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};
