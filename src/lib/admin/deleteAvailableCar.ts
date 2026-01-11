import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/auth/token";

type DeleteAvailableCarResponse = {
  success: boolean;
  error?: string;
};

export const deleteAvailableCar = async ({ id }: { id: string }): Promise<DeleteAvailableCarResponse> => {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/available-cars/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to delete available car" }));
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting available car:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};
