import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/auth/token";

export type MarkNotificationAsReadResponse = {
  success: boolean;
  error?: string;
};

export const markNotificationAsRead = async ({ 
  notificationId 
}: { 
  notificationId: string 
}): Promise<MarkNotificationAsReadResponse> => {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/notifications/mark-read`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        notificationId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: "Failed to mark notification as read" 
      }));
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};
