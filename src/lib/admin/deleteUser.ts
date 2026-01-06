import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/auth/token";

type DeleteUserResponse = {
  success: boolean;
  error?: string;
};

export const deleteUser = async ({ id }: { id: string }): Promise<DeleteUserResponse> => {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to delete user" }));
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};

