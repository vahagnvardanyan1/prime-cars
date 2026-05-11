import type { AdminCar } from "@/lib/admin/types";

import { API_BASE_URL } from "@/i18n/config";

import { authenticatedFetch } from "@/lib/auth/token";
import { appendIf, appendDateIf } from "@/lib/admin/formData";

type CreateCarData = {
  userId?: string;
  model: string;
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
  containerNumberBooking?: string;
  promisedPickUpDate?: string;
  deliveredWarehouse?: string;
  destinationPort?: string;
  receiverName?: string;
};

type CreateCarResponse = {
  success: boolean;
  car?: AdminCar;
  error?: string;
};

export const createCar = async ({
  data,
  images = [],
  vehiclePdfFile,
  insurancePdfFile,
  shippingPdfFile,
}: {
  data: CreateCarData;
  images?: File[];
  vehiclePdfFile?: File | null;
  insurancePdfFile?: File | null;
  shippingPdfFile?: File | null;
}): Promise<CreateCarResponse> => {
  try {
    const formData = new FormData();

    appendIf(formData, "client", data.userId);
    appendIf(formData, "model", data.model);
    appendIf(formData, "vehicleModel", data.model);
    appendIf(formData, "type", data.type);
    appendIf(formData, "auction", data.auction);
    appendIf(formData, "year", data.year);
    appendIf(formData, "autoPrice", data.priceUsd);
    appendIf(formData, "paid", data.carPaid);
    appendIf(formData, "shippingPaid", data.shippingPaid);
    appendIf(formData, "insurance", data.insurance);
    appendIf(formData, "city", data.city);
    appendIf(formData, "lot", data.lot);
    appendIf(formData, "vin", data.vin);
    appendIf(formData, "customerNotes", data.customerNotes);
    appendIf(formData, "containerNumberBooking", data.containerNumberBooking);
    appendIf(formData, "destinationPort", data.destinationPort);
    appendIf(formData, "receiverName", data.receiverName);
    appendDateIf(formData, "purchaseDate", data.purchaseDate);
    appendDateIf(formData, "promisedPickUpDate", data.promisedPickUpDate);
    appendDateIf(formData, "deliveredWarehouse", data.deliveredWarehouse);

    images.forEach((image) => formData.append("vehiclePhotos", image));
    if (vehiclePdfFile) formData.append("vehiclePdf", vehiclePdfFile);
    if (insurancePdfFile) formData.append("insurancePdf", insurancePdfFile);
    if (shippingPdfFile) formData.append("shippingPdf", shippingPdfFile);

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
