import { API_BASE_URL } from "@/i18n/config";

import { authenticatedFetch } from "@/lib/auth/token";
import { appendIf, appendDateIf } from "@/lib/admin/formData";

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
  containerNumberBooking?: string;
  promisedPickUpDate?: string;
  deliveredWarehouse?: string;
  destinationPort?: string;
  receiverName?: string;
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
    const formData = new FormData();

    appendIf(formData, "client", data.client);
    appendIf(formData, "type", data.type);
    appendIf(formData, "model", data.model);
    appendIf(formData, "vehicleModel", data.vehicleModel);
    appendIf(formData, "year", data.year);
    appendIf(formData, "auction", data.auction);
    appendIf(formData, "city", data.city);
    appendIf(formData, "lot", data.lot);
    appendIf(formData, "vin", data.vin);
    appendIf(formData, "autoPrice", data.autoPrice);
    appendIf(formData, "customerNotes", data.customerNotes);
    appendIf(formData, "paid", data.carPaid);
    appendIf(formData, "shippingPaid", data.shippingPaid);
    appendIf(formData, "insurance", data.insurance);
    appendIf(formData, "containerNumberBooking", data.containerNumberBooking);
    formData.append("destinationPort", data.destinationPort ?? "");
    formData.append("receiverName", data.receiverName ?? "");
    appendDateIf(formData, "purchaseDate", data.purchaseDate);
    appendDateIf(formData, "promisedPickUpDate", data.promisedPickUpDate);
    appendDateIf(formData, "deliveredWarehouse", data.deliveredWarehouse);

    if (vehiclePdfFile) formData.append("vehiclePdf", vehiclePdfFile);
    if (insurancePdfFile) formData.append("insurancePdf", insurancePdfFile);
    if (shippingPdfFile) formData.append("shippingPdf", shippingPdfFile);

    existingPhotos?.forEach((url) => formData.append("reorderedPhotoUrls", url));
    newPhotos?.forEach((photo) => formData.append("vehiclePhotos", photo));
    photosToDelete?.forEach((url) => formData.append("deletePhotoUrls", url));

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

    return { success: true };
  } catch (error) {
    console.error("Error updating car:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};
