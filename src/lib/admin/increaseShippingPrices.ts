import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/auth/token";

type IncreaseShippingPricesResponse = {
  success: boolean;
  error?: string;
};

export const increaseShippingPrices = async ({
  amount,
}: {
  amount: number;
}): Promise<IncreaseShippingPricesResponse> => {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/shippings/increase-prices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to increase shipping prices" }));
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error increasing shipping prices:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};

