import type { CreateNotificationData, Notification } from "./types";

import { API_BASE_URL } from "@/i18n/config";

import { authenticatedFetch } from "@/lib/auth/token";

type CreateNotificationResponse = {
  success: boolean;
  notification?: Notification;
  error?: string;
};

export const createNotification = async ({
  data,
}: {
  data: CreateNotificationData;
}): Promise<CreateNotificationResponse> => {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/notifications`, {
      method: "POST",
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
        error: "Failed to create notification" 
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
    console.error("Error creating notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};
