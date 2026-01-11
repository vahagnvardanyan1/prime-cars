import { Auction } from "./types";

import { API_BASE_URL } from "@/i18n/config";

import { authenticatedFetch } from "@/lib/auth/token";

type UpdateShippingResponse = {
  success: boolean;
  error?: string;
};

export const updateShipping = async ({
  city,
  shipping,
  category = Auction.COPART,
}: {
  city: string;
  shipping: number;
  category: Auction;
}): Promise<UpdateShippingResponse> => {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/shippings/${city}/${category}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ base_price: shipping }),
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

