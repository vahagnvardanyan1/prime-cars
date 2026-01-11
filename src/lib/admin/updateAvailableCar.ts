import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "../auth/token";
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
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    if (!token) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const formData = new FormData();

    // Append car data fields
    if (data.carModel) formData.append("carModel", data.carModel);
    if (data.carYear) formData.append("carYear", data.carYear.toString());
    if (data.carVin) formData.append("carVin", data.carVin);
    if (data.carPrice !== undefined) formData.append("carPrice", data.carPrice.toString());
    if (data.carCategory) formData.append("carCategory", data.carCategory);
    if (data.carDescription) formData.append("carDescription", data.carDescription);
    if (data.engineType && data.engineType !== "") formData.append("engineType", data.engineType);
    if (data.engineHp !== undefined && data.engineHp > 0) formData.append("engineHp", data.engineHp.toString());
    if (data.engineSize !== undefined && data.engineSize > 0) formData.append("engineSize", data.engineSize.toString());
    if (data.boughtPlace) formData.append("boughtPlace", data.boughtPlace);
    if (data.transmission) formData.append("transmission", data.transmission);

    newPhotos && newPhotos.forEach((photo) => {
      formData.append("carPhotos", photo);
    });

    if (photosToDelete && photosToDelete.length > 0) {
      photosToDelete.forEach((photo) => {
        formData.append("deletePhotoUrls", photo);
      });
    }
    


    
    const response = await authenticatedFetch(`${API_BASE_URL}/available-cars/${id}`, {
      method: "PATCH",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      
      
      // Handle different error response structures
      let errorMessage = `Failed to update car: ${response.statusText}`;
      
      if (errorData) {
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
        } else if (Array.isArray(errorData)) {
          errorMessage = errorData.map(err => err.message || JSON.stringify(err)).join(', ');
        } else {
          // Fallback for unknown object structures
          errorMessage = JSON.stringify(errorData);
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating available car:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};
