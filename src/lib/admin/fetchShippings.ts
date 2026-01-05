import { API_BASE_URL } from "@/i18n/config";
import { getAccessToken } from "@/lib/auth/token";
import type { ShippingCity } from "@/lib/admin/types";

type FetchShippingsResponse = {
  success: boolean;
  cities?: ShippingCity[];
  error?: string;
};

export const fetchShippings = async (): Promise<FetchShippingsResponse> => {
  try {
    const token = getAccessToken();

    const response = await fetch(`${API_BASE_URL}/shippings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to fetch shipping cities" }));
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    const result = await response.json();

    // Transform backend data to ShippingCity format
    const cities: ShippingCity[] = result?.map((shipping: any) => ({
      id: shipping._id || shipping.id,
      city: shipping.city || "",
      shippingUsd: shipping.shipping || shipping.shippingUsd || 0,
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

