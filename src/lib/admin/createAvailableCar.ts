import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/auth/token";
import type { CarCategory } from "@/lib/cars/types";
import type { EngineType } from "@/lib/admin/types";

type CreateAvailableCarData = {
  carModel: string;
  carYear: number;
  carVin: string;
  carPrice: number;
  carCategory: CarCategory;
  carDescription?: string;
  engineType?: EngineType | "";
  engineHp?: number;
  engineSize?: number;
  boughtPlace?: string;
  transmission?: string;
};

type CreateAvailableCarResponse = {
  success: boolean;
  car?: {
    id: string;
    model: string;
    year: number;
    priceUsd: number;
    category: CarCategory;
    vin: string;
  };
  error?: string;
};

export const createAvailableCar = async ({
  data,
  photos = [],
}: {
  data: CreateAvailableCarData;
  photos?: File[];
}): Promise<CreateAvailableCarResponse> => {
  try {
    // Create FormData
    const formData = new FormData();

    // Append required fields (matching backend schema exactly)
    formData.append("carModel", data.carModel);
    formData.append("carYear", data.carYear.toString());
    formData.append("carPrice", data.carPrice.toString());
    formData.append("carCategory", data.carCategory);
    formData.append("carVin", data.carVin);
    
    // Append optional fields (matching backend schema exactly)
    if (data.carDescription) {
      formData.append("carDescription", data.carDescription);
    }
    
    if (data.engineType) {
      formData.append("engineType", data.engineType);
    }
    
    if (data.engineHp) {
      formData.append("engineHp", data.engineHp.toString());
    }
    
    if (data.engineSize) {
      formData.append("engineSize", data.engineSize.toString());
    }
    
    if (data.boughtPlace) {
      formData.append("boughtPlace", data.boughtPlace);
    }
    
    if (data.transmission) {
      formData.append("transmission", data.transmission);
    }

    // Append photo files
    if (photos && photos.length > 0) {
      photos.forEach((photo) => {
        formData.append("carPhotos", photo);
      });
    }

    const response = await authenticatedFetch(`${API_BASE_URL}/available-cars`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: "Failed to create available car" 
      }));
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    const result = await response.json();

    return {
      success: true,
      car: result.car || result,
    };
  } catch (error) {
    console.error("Error creating available car:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};
