import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/auth/token";
import type { UpdateNotificationData, Notification } from "./types";

type UpdateNotificationResponse = {
  success: boolean;
  notification?: Notification;
  error?: string;
};

export const updateNotification = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateNotificationData;
}): Promise<UpdateNotificationResponse> => {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/notifications/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: data.message,
        description: data.description,
        reason: data.reason,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: "Failed to update notification" 
      }));
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    const result = await response.json();

    return {
      success: true,
      notification: result,
    };
  } catch (error) {
    console.error("Error updating notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};
