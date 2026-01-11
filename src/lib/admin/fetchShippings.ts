import type { ShippingCity, Auction } from "@/lib/admin/types";

import { API_BASE_URL } from "@/i18n/config";

import { authenticatedFetch } from "@/lib/auth/token";

type BackendShipping = {
  _id?: string;
  id?: string;
  city?: string;
  base_price?: number;
  shippingUsd?: number;
  auction?: string;
};

type FetchShippingsResponse = {
  success: boolean;
  cities?: ShippingCity[];
  error?: string;
};

export const fetchShippings = async ({ auction }: { auction?: Auction } = {}): Promise<FetchShippingsResponse> => {
  try {
    // Build URL with query parameter if auction is provided
    const url = auction 
      ? `${API_BASE_URL}/shippings?category=${auction}`
      : `${API_BASE_URL}/shippings`;
    
    const response = await authenticatedFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to fetch shipping cities" }));
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    const result = (await response.json())?.data;
    console.log('result', result);

    // Transform backend data to ShippingCity format
    const cities: ShippingCity[] = result?.map((shipping: BackendShipping) => ({
      id: shipping._id || shipping.id || "",
      city: shipping.city || "",
      shippingUsd: shipping.shippingUsd || shipping.base_price || 0,
      auction: shipping.auction,
    })) || [];

    return {
      success: true,
      cities,
    };
  } catch (error) {
    console.error("Error fetching shipping cities:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};

