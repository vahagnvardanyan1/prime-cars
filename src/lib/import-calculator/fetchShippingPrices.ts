import { API_BASE_URL } from "@/i18n/config";

export type CitiesResponse = {
  cities: string[];
  category: string;
};

export type FetchCitiesParams = {
  category: string;
};

export type FetchCitiesResult =
  | { success: true; data: string[] }
  | { success: false; error: string };

/**
 * Fetch cities from the public API endpoint
 */
export const fetchShippingCities = async (
  params: FetchCitiesParams
): Promise<FetchCitiesResult> => {
  try {
    const queryParams = new URLSearchParams({
      category: params.category,
    });

    const url = `${API_BASE_URL}/public/cities?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to fetch cities" }));
      return {
        success: false,
        error: errorData.error || errorData.message || `HTTP error! status: ${response.status}`,
      };
    }

    const result = await response.json();
    
    // Handle the API response structure: { status: "success", data: [{ cities: [...], category: "..." }] }
    const responseData = result.data || result;
    
    if (Array.isArray(responseData) && responseData.length > 0) {
      const categoryData = responseData[0] as CitiesResponse;
      return {
        success: true,
        data: categoryData.cities || [],
      };
    }
    
    return {
      success: true,
      data: [],
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
