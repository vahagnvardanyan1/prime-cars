import { API_BASE_URL } from "@/i18n/config";

import { authenticatedFetch } from "@/lib/auth/token";

type FetchUnreadCountResponse = {
  success: boolean;
  unreadCount?: number;
  error?: string;
};

export const fetchUnreadCount = async (): Promise<FetchUnreadCountResponse> => {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/notifications/unread-count`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: "Failed to fetch unread count" 
      }));
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    const result = await response.json();

    return {
      success: true,
      unreadCount: result.unreadCount || 0,
    };
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};
