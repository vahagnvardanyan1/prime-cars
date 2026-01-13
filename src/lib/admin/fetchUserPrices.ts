import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/auth/token";
import { Auction } from "./types";

export type UserAdjustment = {
  id: string;
  category: string;
  adjustment_amount: number;
  last_adjustment_amount?: number;
  last_adjustment_date?: string;
};

type FetchUserAdjustmentResponse =
  | {
      success: true;
      adjustment?: UserAdjustment;
    }
  | {
      success: false;
      error: string;
    };

export const fetchUserAdjustment = async ({
  userId,
  category,
}: {
  userId: string;
  category?: Auction;
}): Promise<FetchUserAdjustmentResponse> => {
  try {
    const queryParams = category ? `?category=${category}` : "";
    const response = await authenticatedFetch(
      `${API_BASE_URL}/shippings/admin/user-adjustments/${userId}${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `HTTP error! status: ${response.status}`,
      };
    }

    const result = await response.json();
    
    // Get the first adjustment from the data array
    const adjustment = result.data && result.data.length > 0 ? result.data[0] : undefined;
    
    return {
      success: true,
      adjustment,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
