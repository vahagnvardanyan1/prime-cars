import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/auth/token";

type DeleteNotificationResponse = {
  success: boolean;
  error?: string;
};

export const deleteNotification = async ({ 
  id 
}: { 
  id: string 
}): Promise<DeleteNotificationResponse> => {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/notifications/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: "Failed to delete notification" 
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
    console.error("Error deleting notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};
