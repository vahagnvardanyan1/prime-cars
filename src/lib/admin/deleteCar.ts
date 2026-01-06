import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/auth/token";

type DeleteCarResponse = {
  success: boolean;
  error?: string;
};

export const deleteCar = async ({ id }: { id: string }): Promise<DeleteCarResponse> => {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/vehicles/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to delete car" }));
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting car:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};
