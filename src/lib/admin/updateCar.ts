import { API_BASE_URL } from "@/i18n/config";

import { authenticatedFetch } from "@/lib/auth/token";

type UpdateCarData = {
  client?: string;
  type?: string;
  purchaseDate?: string;
  model?: string;
  year?: number;
  vehicleModel?: string;
  auction?: string;
  city?: string;
  lot?: string;
  vin?: string;
  autoPrice?: number;
  customerNotes?: string;
  carPaid?: boolean;
  shippingPaid?: boolean;
  insurance?: boolean;
};

type UpdateCarResponse = {
  success: boolean;
  error?: string;
};

export const updateCar = async ({
  id,
  data,
  vehiclePdfFile,
  insurancePdfFile,
  shippingPdfFile,
  existingPhotos,
  newPhotos,
  photosToDelete,
}: {
  id: string;
  data: UpdateCarData;
  vehiclePdfFile?: File | null;
  insurancePdfFile?: File | null;
  shippingPdfFile?: File | null;
  existingPhotos?: string[];
  newPhotos?: File[];
  photosToDelete?: string[];
}): Promise<UpdateCarResponse> => {
  try {
    // Create FormData for multipart/form-data
    const formData = new FormData();

    // Append fields only if they exist
    if (data.client) formData.append("client", data.client);
    if (data.type) formData.append("type", data.type);
    if (data.purchaseDate) {
      const isoDate = new Date(data.purchaseDate).toISOString();
      formData.append("purchaseDate", isoDate);
    }
    if (data.model) formData.append("model", data.model);
    if (data.year) formData.append("year", data.year.toString());
    if (data.vehicleModel) formData.append("vehicleModel", data.vehicleModel);
    if (data.auction) formData.append("auction", data.auction);
    if (data.city) formData.append("city", data.city);
    if (data.lot) formData.append("lot", data.lot);
    if (data.vin) formData.append("vin", data.vin);
    if (data.autoPrice !== undefined) formData.append("autoPrice", data.autoPrice.toString());
    if (data.customerNotes) formData.append("customerNotes", data.customerNotes);
    if (data.carPaid !== undefined) formData.append("paid", data.carPaid.toString());
    if (data.shippingPaid !== undefined) formData.append("shippingPaid", data.shippingPaid.toString());
    if (data.insurance !== undefined) formData.append("insurance", data.insurance.toString());

    // Append new PDF files
    if (vehiclePdfFile) {
      formData.append("vehiclePdf", vehiclePdfFile);
    }
    if (insurancePdfFile) {
      formData.append("insurancePdf", insurancePdfFile);
    }
    if (shippingPdfFile) {
      formData.append("shippingPdf", shippingPdfFile);
    }

    // Append reordered existing photo URLs to maintain order
    if (existingPhotos && existingPhotos.length > 0) {
      existingPhotos.forEach((photoUrl) => {
        formData.append("reorderedPhotoUrls", photoUrl);
      });
    }

    // Append new photos
    if (newPhotos && newPhotos.length > 0) {
      newPhotos.forEach((photo) => {
        formData.append("vehiclePhotos", photo);
      });
    }

    // Mark photos for deletion
    if (photosToDelete && photosToDelete.length > 0) {
      photosToDelete.forEach((photo) => {
        formData.append("deletePhotoUrls", photo);
      });
    }

    const response = await authenticatedFetch(`${API_BASE_URL}/vehicles/${id}`, {
      method: "PATCH",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to update car" }));
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating car:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};

