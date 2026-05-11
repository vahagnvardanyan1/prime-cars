import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "../auth/token";
import { appendIf } from "@/lib/admin/formData";

type UpdateAvailableCarArgs = {
  id: string;
  data: {
    carModel?: string;
    carYear?: number;
    carVin?: string;
    carPrice?: number;
    carCategory?: string;
    carDescription?: string;
    engineType?: string;
    engineHp?: number;
    engineSize?: number;
    boughtPlace?: string;
    transmission?: string;
    driveType?: string;
    mileage?: number;
  };
  existingPhotos?: string[];
  newPhotos?: File[];
  photosToDelete?: string[];
};

type UpdateAvailableCarResponse = {
  success: boolean;
  error?: string;
};

export const updateAvailableCar = async ({
  id,
  data,
  existingPhotos = [],
  newPhotos = [],
  photosToDelete = [],
}: UpdateAvailableCarArgs): Promise<UpdateAvailableCarResponse> => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

    if (!token) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const formData = new FormData();

    appendIf(formData, "carModel", data.carModel);
    appendIf(formData, "carYear", data.carYear);
    appendIf(formData, "carVin", data.carVin);
    appendIf(formData, "carPrice", data.carPrice);
    appendIf(formData, "carCategory", data.carCategory);
    appendIf(formData, "carDescription", data.carDescription);
    appendIf(formData, "engineType", data.engineType);
    if (data.engineHp !== undefined && data.engineHp > 0) {
      formData.append("engineHp", data.engineHp.toString());
    }
    if (data.engineSize !== undefined && data.engineSize > 0) {
      formData.append("engineSize", data.engineSize.toString());
    }
    appendIf(formData, "boughtPlace", data.boughtPlace);
    appendIf(formData, "transmission", data.transmission);
    formData.append("driveType", data.driveType ?? "");
    formData.append("mileage", data.mileage && data.mileage > 0 ? data.mileage.toString() : "");

    existingPhotos.forEach((url) => formData.append("reorderedPhotoUrls", url));
    newPhotos.forEach((photo) => formData.append("carPhotos", photo));
    photosToDelete.forEach((url) => formData.append("deletePhotoUrls", url));

    const response = await authenticatedFetch(`${API_BASE_URL}/available-cars/${id}`, {
      method: "PATCH",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      let errorMessage = `Failed to update car: ${response.statusText}`;

      if (errorData) {
        if (typeof errorData === "string") {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage =
            typeof errorData.error === "string" ? errorData.error : JSON.stringify(errorData.error);
        } else if (Array.isArray(errorData)) {
          errorMessage = errorData.map((err) => err.message || JSON.stringify(err)).join(", ");
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating available car:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};
