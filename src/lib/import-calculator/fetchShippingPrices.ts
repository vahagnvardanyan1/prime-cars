import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "../auth/token";

export type ShippingData = {
  city: string;
  shippingUsd: number;
  base_price?: number;
  auction?: string;
  base_last_adjustment_amount?: number;
  total_adjustment_amount?: number;
};

export type FetchCitiesParams = {
  category: string;
};

export type FetchCitiesResult =
  | { success: true; cities: string[]; priceMap: Record<string, number> }
  | { success: false; error: string };

/**
 * Fetch cities and prices from the shippings API endpoint
 * Returns both cities list and a map of city->price
 */
export const fetchShippingCities = async (
  params: FetchCitiesParams
): Promise<FetchCitiesResult> => {
  try {
    const url = `${API_BASE_URL}/shippings/prices?category=${params.category}`;
    
    const response = await authenticatedFetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to fetch shipping data" }));
      return {
        success: false,
        error: errorData.error || errorData.message || `HTTP error! status: ${response.status}`,
      };
    }

    const result = await response.json();
    const responseData = result.data || result;
    
    if (Array.isArray(responseData)) {
      const cities: string[] = [];
      const priceMap: Record<string, number> = {};
      
      responseData.forEach((item: ShippingData) => {
        if (item.city) {
          cities.push(item.city);
          priceMap[item.city] = (item.base_price ?? 0) + (item?.base_last_adjustment_amount ?? 0)   + (item?.total_adjustment_amount ?? 0) 
        }
      });
      
      return {
        success: true,
        cities,
        priceMap,
      };
    }
    
    return {
      success: true,
      cities: [],
      priceMap: {},
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Keep old exports for backwards compatibility but deprecated
export type ShippingPrice = {
  id: number;
  category: string;
  city: string;
  price: number;
  createdAt: string;
  updatedAt: string;
};

export const getUniqueCities = (cities: string[]): string[] => {
  return Array.from(new Set(cities)).sort();
};
