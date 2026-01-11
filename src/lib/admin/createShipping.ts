import type { ShippingCity, Auction } from "@/lib/admin/types";

import { API_BASE_URL } from "@/i18n/config";

import { authenticatedFetch } from "@/lib/auth/token";

export type CreateShippingData = {
  city: string;
  shipping: number;
  category?: Auction;
};

export type CreateShippingResponse = {
  success: boolean;
  data?: ShippingCity;
  error?: string;
};

export const createShipping = async (
  data: CreateShippingData
): Promise<CreateShippingResponse> => {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/shippings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        city: data.city,
        base_price: data.shipping,
        category: data.category,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `HTTP error ${response.status}`,
      };
    }

    const result = await response.json();

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error creating shipping:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

