import { API_BASE_URL } from "@/i18n/config";
import { getAccessToken } from "@/lib/auth/token";

type UpdateShippingResponse = {
  success: boolean;
  error?: string;
};

export const updateShipping = async ({
  id,
  city,
  shipping,
}: {
  id: string;
  city: string;
  shipping: number;
}): Promise<UpdateShippingResponse> => {
  try {
    const token = getAccessToken();

    const response = await fetch(`${API_BASE_URL}/shippings/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ city, shipping }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to update shipping" }));
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating shipping:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};

