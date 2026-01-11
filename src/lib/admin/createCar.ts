import type { AdminCar } from "@/lib/admin/types";

import { API_BASE_URL } from "@/i18n/config";

import { authenticatedFetch } from "@/lib/auth/token";

type CreateCarData = {
  userId?: string;
  model: string; // VehicleModel enum value
  type: string; // VehicleType enum value
  auction: string; // Auction enum value
  year: number;
  priceUsd: number;
  carPaid: boolean;
  shippingPaid: boolean;
  insurance: boolean;
  purchaseDate?: string;
  city?: string;
  lot?: string;
  vin?: string;
  customerNotes?: string;
};

type CreateCarResponse = {
  success: boolean;
  car?: AdminCar;
  error?: string;
};

export const createCar = async ({
  data,
  images = [],
  invoiceFile,
}: {
  data: CreateCarData;
  images?: File[];
  invoiceFile?: File | null;
}): Promise<CreateCarResponse> => {
  try {
    // Create FormData
    const formData = new FormData();

    // Append required fields
    if (data.userId) formData.append("client", String(data.userId));
    formData.append("model", data.model); // VehicleModel enum value
    formData.append("type", data.type); // VehicleType enum value  
    formData.append("auction", data.auction); // Auction enum value
    formData.append("year", data.year.toString());
    formData.append("autoPrice", data.priceUsd.toString());
    formData.append("vehicleModel", data.model);
    formData.append("carPaid", data.carPaid.toString());
    formData.append("shippingPaid", data.shippingPaid.toString());
    formData.append("insurance", data.insurance.toString());
    
    // Append optional fields
    if (data.purchaseDate) {
      const isoDate = new Date(data.purchaseDate).toISOString();
      formData.append("purchaseDate", isoDate);
    }

    if (data.city) formData.append("city", data.city);
    if (data.lot) formData.append("lot", data.lot);
    if (data.vin) formData.append("vin", data.vin);
    if (data.customerNotes) formData.append("customerNotes", data.customerNotes);



    // Append image files
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append("vehiclePhotos", image);
      });
    }

    // Append invoice file
    if (invoiceFile) {
      formData.append("invoice", invoiceFile);
    }

    const response = await authenticatedFetch(`${API_BASE_URL}/vehicles`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to create car" }));
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    const result = await response.json();

    return {
      success: true,
      car: result.car,
    };
  } catch (error) {
    console.error("Error creating car:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};

