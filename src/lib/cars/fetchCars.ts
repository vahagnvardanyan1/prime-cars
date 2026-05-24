import { API_BASE_URL } from "@/i18n/config";
import type { Car, CarCategory, FetchCarsResponse, BackendAvailableCar } from "./types";
import { safeFetchJson } from "./safeFetchJson";

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

// Fetch all cars from the old /api/cars endpoint (legacy)
export const fetchAllCarsLegacy = async (): Promise<FetchCarsResponse> => {
  const result = await safeFetchJson<unknown>({
    url: `${API_BASE_URL}/api/cars`,
    logPrefix: "Error fetching cars from legacy endpoint",
  });

  if (!result.success) {
    return { success: false, cars: [], error: result.error };
  }

  return { success: true, cars: unwrapCarsArray<Car>(result.data) };
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

  const result = await safeFetchJson<PaginatedRaw>({
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
  const result = await safeFetchJson<unknown>({
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

// Fetch cars by category from available-cars endpoint (AVAILABLE, ONROAD, TRANSIT)
export const fetchCarsByCategory = async ({
  category,
}: {
  category: CarCategory;
}): Promise<FetchCarsResponse> => {
  const result = await safeFetchJson<unknown>({
    url: `${API_BASE_URL}/available-cars/by-category?carCategory=${category}`,
    // Original swallowed the error silently — match that behavior.
  });

  if (!result.success) {
    return { success: false, cars: [], error: result.error };
  }

  const raw = result.data as { data?: unknown } | null;
  const inner = raw?.data ?? result.data;
  const backendCars = unwrapCarsArray<BackendAvailableCar>(inner);
  const cars = backendCars.map(mapBackendCarToFrontend);

  return { success: true, cars };
};

// Fetch all cars grouped by category
export const fetchAllCars = async (): Promise<{
  AVAILABLE: Car[];
  ONROAD: Car[];
  TRANSIT: Car[];
  errors: string[];
}> => {
  // Use single endpoint to get all cars at once
  const singleEndpointResult = await fetchAllAvailableCars();

  if (singleEndpointResult.success && singleEndpointResult.cars.length > 0) {
    // Group cars by category from the single response
    const carsByCategory = singleEndpointResult.cars.reduce(
      (acc, car) => {
        if (car.category === "AVAILABLE") acc.AVAILABLE.push(car);
        else if (car.category === "ONROAD") acc.ONROAD.push(car);
        else if (car.category === "TRANSIT") acc.TRANSIT.push(car);
        return acc;
      },
      { AVAILABLE: [], ONROAD: [], TRANSIT: [] } as Record<CarCategory, Car[]>
    );

    return {
      ...carsByCategory,
      errors: [],
    };
  }

  // Fallback to fetching by category if single endpoint fails
  const categories: CarCategory[] = ["AVAILABLE", "ONROAD", "TRANSIT"];
  const errors: string[] = [];

  const results = await Promise.all(
    categories.map(async (category) => {
      const result = await fetchCarsByCategory({ category });
      if (!result.success && result.error) {
        errors.push(`${category}: ${result.error}`);
      }
      return { category, cars: result.cars };
    })
  );

  const carsByCategory = results.reduce(
    (acc, { category, cars }) => {
      acc[category] = cars;
      return acc;
    },
    { AVAILABLE: [], ONROAD: [], TRANSIT: [] } as Record<CarCategory, Car[]>
  );

  return {
    ...carsByCategory,
    errors,
  };
};

// Fetch a single car by ID from legacy endpoint
export const fetchCarById = async (
  carId: string
): Promise<{ success: boolean; car?: Car; error?: string }> => {
  const result = await safeFetchJson<Car | null>({
    url: `${API_BASE_URL}/api/cars/${carId}`,
    notFoundMessage: "Car not found",
    logPrefix: `Error fetching car ${carId}`,
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  if (!result.data) {
    return { success: false, error: "Car not found" };
  }

  return { success: true, car: result.data };
};

// Fetch a single available car by ID from available-cars endpoint
export const fetchAvailableCarById = async (
  carId: string
): Promise<{ success: boolean; car?: Car; error?: string }> => {
  const result = await safeFetchJson<{ data?: BackendAvailableCar } | BackendAvailableCar | null>({
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
