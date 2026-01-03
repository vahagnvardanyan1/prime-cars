import type { CarListing } from "@/data/cars";

export type PriceRange = "all" | "under-100k" | "100k-150k" | "over-150k";

export type FilterCarsInput = {
  cars: CarListing[];
  searchTerm: string;
  selectedBrand: string;
  priceRange: PriceRange;
};

export const filterCars = ({
  cars,
  searchTerm,
  selectedBrand,
  priceRange,
}: FilterCarsInput) => {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return cars.filter((car) => {
    const matchesSearch = normalizedSearch
      ? `${car.brand} ${car.model}`.toLowerCase().includes(normalizedSearch)
      : true;

    const matchesBrand = selectedBrand === "all" || car.brand === selectedBrand;

    let matchesPrice = true;
    if (priceRange === "under-100k") matchesPrice = car.price < 100000;
    else if (priceRange === "100k-150k")
      matchesPrice = car.price >= 100000 && car.price <= 150000;
    else if (priceRange === "over-150k") matchesPrice = car.price > 150000;

    return matchesSearch && matchesBrand && matchesPrice;
  });
};
