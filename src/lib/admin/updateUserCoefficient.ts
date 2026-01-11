import { Auction } from "./types";

import { API_BASE_URL } from "@/i18n/config";

import { authenticatedFetch } from "@/lib/auth/token";

type UpdateUserCoefficientResponse = {
  success: boolean;
  error?: string;
};

export const updateUserCoefficient = async ({
  userId,
  coefficient,
  category,
}: {
  userId: string;
  coefficient: number;
  category?: string;
}): Promise<UpdateUserCoefficientResponse> => {
  try {
    const payload: { coefficient: number; category?: Auction } = { coefficient };
    if (category !== undefined) {
      payload.category = category as Auction;
    }
    
    const response = await authenticatedFetch(
      `${API_BASE_URL}/shippings/admin/bulk-default-prices?userId=${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `HTTP error! status: ${response.status}`,
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
