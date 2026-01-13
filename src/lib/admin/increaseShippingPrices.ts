import { API_BASE_URL } from "@/i18n/config";

import { authenticatedFetch } from "@/lib/auth/token";
import type { Auction } from "./types";

type IncreaseShippingPricesResponse = {
  success: boolean;
  error?: string;
};

export const increaseShippingPrices = async ({
  amount,
  auction,
  isAdmin = false,
}: {
  amount: number;
  auction: Auction;
  isAdmin?: boolean;
}): Promise<IncreaseShippingPricesResponse> => {
  try {
    const endpoint = isAdmin
      ? `${API_BASE_URL}/shippings/adjust-base-price`
      : `${API_BASE_URL}/shippings/adjust-price`;
    
    const response = await authenticatedFetch(endpoint, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ adjustment_amount: amount, category: auction }),
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

