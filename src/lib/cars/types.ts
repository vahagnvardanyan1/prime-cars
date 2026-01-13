export type CarStatus = "available" | "reserved" | "sold" | "in_transit" | "available_to_order";

// Backend enum values for car categories
export type CarCategory = "AVAILABLE" | "ONROAD" | "TRANSIT";

// Transmission types enum
export enum Transmission {
  AUTOMATIC = 'AUTOMATIC',
  MECHANIC = 'MECHANIC',
  VARIATOR = 'VARIATOR',
  ROBOT = 'ROBOT',
}

// Backend response structure for available cars
export type BackendAvailableCar = {
  id: string;
  carModel: string;
  carYear: number;
  carVin: string;
  carPrice: number;
  carCategory: CarCategory;
  carPhotos: string[];
  carDescription?: string;
  engineType?: string;
  engineHp?: number;
  engineSize?: number;
  boughtPlace?: string;
  transmission?: string;
};

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
  vin?: string;
  engineSize?: number;
};

export type FetchCarsResponse = {
  success: boolean;
  cars: Car[];
  error?: string;
};
