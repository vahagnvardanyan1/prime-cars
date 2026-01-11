export type CarCategory = "current" | "coming" | "order";

export type HomeCarStatus =
  | "available"
  | "sold"
  | "reserved"
  | "in_transit"
  | "at_port"
  | "customs"
  | "available_to_order"
  | "pre_order";

export type HomeCar = {
  id: string;
  imageUrl: string;
  brand: string;
  model: string;
  year: number;
  priceUsd: number;
  category: CarCategory;
  status: HomeCarStatus;
  location?: string;
  engine?: string;
  horsepower?: number;
  fuelType?: string;
  transmission?: string;
  estimatedArrival?: string;
  shippingProgress?: number; // 0-100 percentage for coming cars
};

export type FetchHomeCarsResponse = {
  success: boolean;
  cars: HomeCar[];
  error?: string;
};
