import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/auth/token";
import { appendIf } from "@/lib/admin/formData";
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
  driveType?: string;
  mileage?: number;
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
    const formData = new FormData();

    appendIf(formData, "carModel", data.carModel);
    appendIf(formData, "carYear", data.carYear);
    appendIf(formData, "carPrice", data.carPrice);
    appendIf(formData, "carCategory", data.carCategory);
    appendIf(formData, "carVin", data.carVin);
    appendIf(formData, "carDescription", data.carDescription);
    appendIf(formData, "engineType", data.engineType);
    appendIf(formData, "engineHp", data.engineHp);
    appendIf(formData, "engineSize", data.engineSize);
    appendIf(formData, "boughtPlace", data.boughtPlace);
    appendIf(formData, "transmission", data.transmission);
    appendIf(formData, "driveType", data.driveType);
    appendIf(formData, "mileage", data.mileage);

    photos.forEach((photo) => formData.append("carPhotos", photo));

    const response = await authenticatedFetch(`${API_BASE_URL}/available-cars`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: "Failed to create available car",
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
