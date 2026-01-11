import { API_BASE_URL } from "@/i18n/config";
import type { Car, CarCategory, FetchCarsResponse, BackendAvailableCar } from "./types";

// Map backend available car to frontend Car type
const mapBackendCarToFrontend = (backendCar: BackendAvailableCar): Car => {
  // Extract brand from model (e.g., "BMW X5" -> brand: "BMW", model: "X5")
  const modelParts = backendCar.carModel.split(' ');
  const brand = modelParts[0] || backendCar.carModel;
  const model = modelParts.slice(1).join(' ') || backendCar.carModel;

  return {
    id: backendCar.id,
    imageUrl: backendCar.carPhotos[0] || '', // First photo as main image
    photos: backendCar.carPhotos,
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
  };
};

// Fetch all cars from the old /api/cars endpoint (legacy)
export const fetchAllCarsLegacy = async (): Promise<FetchCarsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cars`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Don't cache to always get fresh data
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Ensure data is in the expected format
    const cars = Array.isArray(data) ? data : data.cars || [];

    return {
      success: true,
      cars,
    };
  } catch (error) {
    console.error("Error fetching cars from legacy endpoint:", error);
    return {
      success: false,
      cars: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Fetch all available cars from the /available-cars endpoint
export const fetchAllAvailableCars = async (): Promise<FetchCarsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/available-cars`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Don't cache to always get fresh data
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Handle wrapped response: { status: "success", data: [...] }
    const data = result.data || result;
    const backendCars: BackendAvailableCar[] = Array.isArray(data) ? data : data.cars || [];
    
    // Map backend available-cars structure to frontend Car type
    const cars = backendCars.map(mapBackendCarToFrontend);

    return {
      success: true,
      cars,
    };
  } catch (error) {
    console.error("Error fetching available cars:", error);
    return {
      success: false,
      cars: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Fetch cars by category from available-cars endpoint (AVAILABLE, ONROAD, TRANSIT)
export const fetchCarsByCategory = async ({
  category,
}: {
  category: CarCategory;
}): Promise<FetchCarsResponse> => {
  try {
    console.log(`🔍 Fetching ${category} cars from available-cars endpoint...`);
    
    const response = await fetch(
      `${API_BASE_URL}/available-cars/by-category?carCategory=${category}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`📦 Raw response from available-cars/by-category (${category}):`, result);
    
    // Handle wrapped response: { status: "success", data: [...] }
    const data = result.data || result;
    const backendCars: BackendAvailableCar[] = Array.isArray(data) ? data : data.cars || [];
    console.log(`🚗 Backend cars count for ${category}:`, backendCars.length);
    
    // Map backend available-cars structure to frontend Car type
    const cars = backendCars.map(mapBackendCarToFrontend);
    console.log(`✅ Mapped cars for ${category}:`, cars);

    return {
      success: true,
      cars,
    };
  } catch (error) {
    console.error(`❌ Error fetching ${category} cars from available-cars:`, error);
    return {
      success: false,
      cars: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
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
  try {
    const response = await fetch(`${API_BASE_URL}/api/cars/${carId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: "Car not found" };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const car = await response.json();

    if (!car) {
      return { success: false, error: "Car not found" };
    }

    return {
      success: true,
      car,
    };
  } catch (error) {
    console.error(`Error fetching car ${carId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Fetch a single available car by ID from available-cars endpoint
export const fetchAvailableCarById = async (
  carId: string
): Promise<{ success: boolean; car?: Car; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/available-cars/${carId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: "Available car not found" };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Handle wrapped response: { status: "success", data: {...} }
    const backendCar: BackendAvailableCar = result.data || result;

    if (!backendCar) {
      return { success: false, error: "Available car not found" };
    }

    // Map backend available-car structure to frontend Car type
    const car = mapBackendCarToFrontend(backendCar);

    return {
      success: true,
      car,
    };
  } catch (error) {
    console.error(`Error fetching available car ${carId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
