import type { CarCategory, FetchHomeCarsResponse, HomeCar } from "./types";
import type { BackendAvailableCar } from "@/lib/cars/types";
import type { CarCategory as BackendCategory } from "@/lib/cars/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// Map home page categories to backend categories
const mapCategoryToBackend = (category: CarCategory): BackendCategory => {
  switch (category) {
    case "current":
      return "AVAILABLE";
    case "coming":
      return "ONROAD";
    case "order":
      return "TRANSIT";
  }
};

// Map backend available car to home page car
const mapBackendCarToHomeCar = (backendCar: BackendAvailableCar, homeCategory: CarCategory): HomeCar => {
  // Extract brand from model (e.g., "BMW X5" -> brand: "BMW")
  const modelParts = backendCar.carModel.split(' ');
  const brand = modelParts[0] || backendCar.carModel;

  return {
    id: backendCar.id,
    imageUrl: backendCar.carPhotos[0] || '',
    brand,
    model: backendCar.carModel,
    year: backendCar.carYear,
    priceUsd: backendCar.carPrice,
    category: homeCategory,
    status: 'available', // Default status
    location: backendCar.boughtPlace,
    engine: backendCar.engineType,
    horsepower: backendCar.engineHp,
    fuelType: backendCar.engineType,
    transmission: backendCar.transmission,
  };
};

export const fetchHomeCars = async ({
  category,
}: {
  category: CarCategory;
}): Promise<FetchHomeCarsResponse> => {
  try {
    console.log(`🏠 Fetching ${category} cars for home page...`);
    
    // Map home category to backend category
    const backendCategory = mapCategoryToBackend(category);
    
    const response = await fetch(
      `${API_BASE_URL}/available-cars/by-category?carCategory=${backendCategory}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch ${category} cars`);
    }

    const result = await response.json();
    console.log(`📦 Raw response for home ${category}:`, result);
    
    // Handle wrapped response: { status: "success", data: [...] }
    const data = result.data || result;
    console.log('Extracted data:', data);
    
    const backendCars: BackendAvailableCar[] = Array.isArray(data) ? data : data.cars || [];
    console.log(`🚗 Backend cars count for home ${category}:`, backendCars.length);
    
    // Map backend cars to home page format
    const cars = backendCars.map(car => mapBackendCarToHomeCar(car, category));
    console.log(`✅ Mapped ${category} cars for home (${cars.length} cars):`, cars);

    return {
      success: true,
      cars,
    };
  } catch (error) {
    console.error(`❌ Error fetching ${category} cars:`, error);
    return {
      success: false,
      cars: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const fetchAllHomeCars = async (): Promise<{
  current: HomeCar[];
  coming: HomeCar[];
  order: HomeCar[];
  errors: string[];
}> => {
  const categories: CarCategory[] = ["current", "coming", "order"];
  const errors: string[] = [];

  const results = await Promise.all(
    categories.map(async (category) => {
      const result = await fetchHomeCars({ category });
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
    { current: [], coming: [], order: [] } as Record<CarCategory, HomeCar[]>
  );

  return {
    ...carsByCategory,
    errors,
  };
};
