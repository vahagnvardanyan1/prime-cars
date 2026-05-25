import { API_BASE_URL } from "@/i18n/config";
import type { Car, CarCategory, FetchCarsResponse, BackendAvailableCar } from "./types";
import { publicFetchJson } from "./publicFetchJson";

// Map backend available car to frontend Car type
const mapBackendCarToFrontend = (backendCar: BackendAvailableCar): Car => {
  // Extract brand from model (e.g., "BMW X5" -> brand: "BMW", model: "X5")
  const modelParts = backendCar.carModel.split(' ');
  const brand = modelParts[0] || backendCar.carModel;

  return {
    id: backendCar.id,
    imageUrl: backendCar.carPhotos?.[0] || '',
    photos: backendCar.carPhotos || [],
    brand,
    model: backendCar.carModel, // Keep full model name
    year: backendCar.carYear,
    priceUsd: backendCar.carPrice,
    category: backendCar.carCategory,
    status: 'available', // Default status based on category
    location: backendCar.boughtPlace,
    engine: backendCar.engineType,
    horsepower: backendCar.engineHp,
    fuelType: backendCar.engineType,
    transmission: backendCar.transmission,
    description: backendCar.carDescription,
    vin: backendCar.carVin,
    engineSize: backendCar.engineSize,
    driveType: backendCar.driveType,
    mileage: backendCar.mileage,
  };
};

// Pull cars out of either a bare array or a `{ cars: [...] }` wrapper.
const unwrapCarsArray = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  const wrapped = (value as { cars?: T[] } | null)?.cars;
  return Array.isArray(wrapped) ? wrapped : [];
};

// Fetch paginated available cars from the /available-cars/paginated endpoint
export const fetchAvailableCarsPaginated = async ({
  page = 1,
  limit = 25,
  search,
  carCategory,
}: {
  page?: number;
  limit?: number;
  search?: string;
  carCategory?: CarCategory;
} = {}): Promise<FetchCarsResponse & { total?: number; totalPages?: number; page?: number; limit?: number }> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  if (search) {
    params.append("search", search);
  }
  if (carCategory) {
    params.append("carCategory", carCategory);
  }

  type PaginatedRaw = {
    data?: {
      data?: BackendAvailableCar[];
      meta?: {
        totalItems?: number;
        currentPage?: number;
        itemsPerPage?: number;
        totalPages?: number;
      };
    };
  };

  const result = await publicFetchJson<PaginatedRaw>({
    url: `${API_BASE_URL}/available-cars/paginated?${params.toString()}`,
    logPrefix: "Error fetching paginated available cars",
  });

  if (!result.success) {
    return {
      success: false,
      cars: [],
      error: result.error,
      total: 0,
      page: 1,
      limit: 25,
      totalPages: 0,
    };
  }

  // Response structure: { data: { data: [...], meta: {...} } }
  const dataWrapper = result.data?.data;
  const carsArray: BackendAvailableCar[] = dataWrapper?.data || [];
  const meta = dataWrapper?.meta || {};

  const cars = carsArray.map(mapBackendCarToFrontend);
  return {
    success: true,
    cars,
    total: meta.totalItems || 0,
    page: meta.currentPage || page,
    limit: meta.itemsPerPage || limit,
    totalPages: meta.totalPages || 0,
  };
};

// Fetch all available cars from the /available-cars endpoint
export const fetchAllAvailableCars = async (): Promise<FetchCarsResponse> => {
  const result = await publicFetchJson<unknown>({
    url: `${API_BASE_URL}/available-cars`,
    logPrefix: "Error fetching available cars",
  });

  if (!result.success) {
    return { success: false, cars: [], error: result.error };
  }

  // Handle wrapped response: { status: "success", data: [...] }
  const raw = result.data as { data?: unknown } | null;
  const inner = raw?.data ?? result.data;
  const backendCars = unwrapCarsArray<BackendAvailableCar>(inner);
  const cars = backendCars.map(mapBackendCarToFrontend);

  return { success: true, cars };
};

// Fetch a single available car by ID from available-cars endpoint
export const fetchAvailableCarById = async (
  carId: string
): Promise<{ success: boolean; car?: Car; error?: string }> => {
  const result = await publicFetchJson<{ data?: BackendAvailableCar } | BackendAvailableCar | null>({
    url: `${API_BASE_URL}/available-cars/${carId}`,
    notFoundMessage: "Available car not found",
    logPrefix: `Error fetching available car ${carId}`,
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  // Handle wrapped response: { status: "success", data: {...} }
  const raw = result.data;
  const backendCar = (raw && typeof raw === "object" && "data" in raw && raw.data
    ? raw.data
    : raw) as BackendAvailableCar | null;

  if (!backendCar) {
    return { success: false, error: "Available car not found" };
  }

  return { success: true, car: mapBackendCarToFrontend(backendCar) };
};
