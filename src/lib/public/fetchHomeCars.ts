import type { CarCategory, FetchHomeCarsResponse, HomeCar } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export const fetchHomeCars = async ({
  category,
}: {
  category: CarCategory;
}): Promise<FetchHomeCarsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/home/cars?category=${category}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${category} cars`);
    }

    const data = await response.json();
    return {
      success: true,
      cars: data.cars || [],
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
