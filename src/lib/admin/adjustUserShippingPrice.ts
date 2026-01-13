import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/auth/token";

type AdjustUserShippingPriceParams = {
  userId: string;
  category: string;
  adjustmentAmount: number;
};

type AdjustUserShippingPriceResponse = {
  success: boolean;
  error?: string;
};

export const adjustUserShippingPrice = async ({
  userId,
  category,
  adjustmentAmount,
}: AdjustUserShippingPriceParams): Promise<AdjustUserShippingPriceResponse> => {
  try {
    debugger
    const response = await authenticatedFetch(
      `${API_BASE_URL}/shippings/adjust-price`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          category,
          adjustment_amount: adjustmentAmount,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || errorData.error || `HTTP error! status: ${response.status}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
