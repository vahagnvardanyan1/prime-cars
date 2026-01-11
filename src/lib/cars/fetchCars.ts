import { API_BASE_URL } from "@/i18n/config";
import type { Car, CarCategory, FetchCarsResponse } from "./types";

// Fetch all available cars from the backend
export const fetchAllAvailableCars = async (): Promise<FetchCarsResponse> => {
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
    console.error("Error fetching available cars:", error);
    return {
      success: false,
      cars: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Fetch cars by category (AVAILABLE, ONROAD, TRANSIT)
export const fetchCarsByCategory = async ({
  category,
}: {
  category: CarCategory;
}): Promise<FetchCarsResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/cars?category=${category}`,
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

    const data = await response.json();
    const cars = Array.isArray(data) ? data : data.cars || [];

    return {
      success: true,
      cars,
    };
  } catch (error) {
    console.error(`Error fetching ${category} cars:`, error);
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

// Fetch a single car by ID
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
