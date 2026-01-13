import { API_BASE_URL } from "@/i18n/config";

import { authenticatedFetch } from "@/lib/auth/token";

type DeleteShippingResponse = {
  success: boolean;
  error?: string;
};

export const deleteShipping = async ({
  id,
}: {
  id: string;
}): Promise<DeleteShippingResponse> => {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/shippings/admin/city-prices/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to delete shipping" }));
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting shipping:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};

