import { API_BASE_URL } from "@/i18n/config";

export type ShippingData = {
  city: string;
  shippingUsd: number;
  base_price?: number;
  tax?: number;
  auction?: string;
  base_last_adjustment_amount?: number;
  total_adjustment_amount?: number;
};

export type FetchPublicCitiesParams = {
  category: string;
};

export type FetchPublicCitiesResult =
  | { success: true; cities: string[]; category?: string }
  | { success: false; error: string };

/**
 * Fetch cities and prices from the shippings API endpoint
 * Returns both cities list and a map of city->price
 */
export const fetchShippingCitiesPublic = async (
  params: FetchPublicCitiesParams
): Promise<FetchPublicCitiesResult> => {
  try {
    const url = `${API_BASE_URL}/public/cities?category=${params.category}`;
    
    const response = await fetch(url, {
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
    const responseData = result.data as [{ cities: string[] }] | undefined;

    if (Array.isArray(responseData)) {
      const cities: string[] = [];

      responseData[0].cities.forEach((city: string) => {
        if (city) {
          cities.push(city);
        }
      });

      return {
        success: true,
        cities,
      };
    }
    
    return {
      success: true,
      cities: [],
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
