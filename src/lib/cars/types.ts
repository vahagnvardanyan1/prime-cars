export type CarStatus = "available" | "reserved" | "sold" | "in_transit" | "available_to_order";

// Backend enum values for car categories
export type CarCategory = "AVAILABLE" | "ONROAD" | "TRANSIT";

export type Car = {
  id: string;
  imageUrl: string;
  photos?: string[]; // Array of photo URLs
  brand: string;
  model: string;
  year: number;
  priceUsd: number;
  category: CarCategory;
  status: CarStatus;
  location?: string;
  engine?: string;
  horsepower?: number;
  fuelType?: string;
  transmission?: string;
  estimatedArrival?: string; // For ONROAD cars
  shippingProgress?: number; // 0-100 percentage for ONROAD cars
  description?: string;
};

export type FetchCarsResponse = {
  success: boolean;
  cars: Car[];
  error?: string;
};
