import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/auth/token";
import type { Auction } from "./types";

type ApiGlobalAdjustmentResponse = {
  base_adjustment_amount?: number | null;
  base_price?: number | null;
  adjustment_amount?: number | null;
  adjusted_by?: string | null;
  last_adjustment_amount?: number | null;
  last_adjustment_date?: string | null;
  user_adjustment_amount?: number | null;
};

type GlobalAdjustmentData = {
  adjustmentAmount?: number;
  basePrice?: number;
  category?: string;
  lastAdjustmentAmount?: number;
  lastAdjustmentDate?: string;
};

type FetchGlobalAdjustmentResult = 
  | { success: true; data: GlobalAdjustmentData }
  | { success: false; error: string };

export const fetchGlobalAdjustment = async (category?: Auction): Promise<FetchGlobalAdjustmentResult> => {
  try {
    debugger
    // Add category as query parameter if provided
    let url = `${API_BASE_URL}/shippings/price-summary`;
    if (category) {
      url += `?category=${category}`;
    }
    
    const response = await authenticatedFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: true,
          data: {},
        };
      }
      
      const errorData = await response.json().catch(() => ({ error: "Failed to fetch global adjustment" }));
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    const responseData = await response.json();
    const adjustmentData: ApiGlobalAdjustmentResponse = responseData.data || responseData;
    debugger
    
    const mappedData: GlobalAdjustmentData = {
      adjustmentAmount: adjustmentData.base_adjustment_amount ?? adjustmentData.adjustment_amount ?? adjustmentData?.user_adjustment_amount ?? 0,
      basePrice: adjustmentData.base_price ?? undefined,
      category: category, 
      lastAdjustmentAmount: adjustmentData.last_adjustment_amount ?? undefined,
      lastAdjustmentDate: adjustmentData.last_adjustment_date ?? undefined,
    };
    debugger
    
    return {
      success: true,
      data: mappedData,
    };
  } catch (error) {
    console.error("Error fetching global adjustment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch global adjustment",
    };
  }
};
