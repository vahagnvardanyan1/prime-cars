/**
 * Car filtering utility functions
 */

import type { AdminCar } from "@/lib/admin/types";

import { matchesSearch, matchesFilter, matchesBooleanFilter, matchesDateRange } from "./filters";

export type CarFiltersState = {
  search: string;
  type: string;
  auction: string;
  carPaid: "all" | "paid" | "not-paid";
  shippingPaid: "all" | "paid" | "not-paid";
  insurance: "all" | "exists" | "not-exists";
  purchaseDateFrom: string;
  purchaseDateTo: string;
};

/**
 * Filter cars based on provided filter criteria
 */
export const filterCars = ({ cars, filters }: { cars: AdminCar[]; filters: CarFiltersState }): AdminCar[] => {
  return cars.filter((car) => {
    // Search filter
    if (filters.search) {
      const matches = matchesSearch({ 
        searchTerm: filters.search, 
        fields: [
          car.model,
          car.client,
          car.details?.vin,
          car.details?.lot,
          car.details?.city,
        ]
      });
      if (!matches) return false;
    }

    // Type filter
    if (!matchesFilter({ value: car.details?.type, filter: filters.type, allValue: "all" })) {
      return false;
    }

    // Auction filter
    if (!matchesFilter({ value: car.details?.auction, filter: filters.auction, allValue: "all" })) {
      return false;
    }

    // Car Paid filter
    if (filters.carPaid !== "all") {
      const matches = matchesBooleanFilter({ 
        value: car.carPaid, 
        filter: filters.carPaid === "paid" ? "yes" : "no" 
      });
      if (!matches) return false;
    }

    // Shipping Paid filter
    if (filters.shippingPaid !== "all") {
      const matches = matchesBooleanFilter({ 
        value: car.shippingPaid, 
        filter: filters.shippingPaid === "paid" ? "yes" : "no" 
      });
      if (!matches) return false;
    }

    // Insurance filter
    if (filters.insurance !== "all") {
      const matches = matchesBooleanFilter({ 
        value: car.insurance, 
        filter: filters.insurance === "exists" ? "yes" : "no" 
      });
      if (!matches) return false;
    }

    // Purchase Date Range filter
    if (filters.purchaseDateFrom || filters.purchaseDateTo) {
      const matches = matchesDateRange({ 
        date: car.details?.purchaseDate, 
        fromDate: filters.purchaseDateFrom || new Date().toISOString().split('T')[0],
        toDate: filters.purchaseDateTo 
      });
      if (!matches) return false;
    }

    return true;
  });
};

/**
 * Default car filters
 */
export const defaultCarFilters: CarFiltersState = {
  search: "",
  type: "all",
  auction: "all",
  carPaid: "all",
  shippingPaid: "all",
  insurance: "all",
  purchaseDateFrom: "",
  purchaseDateTo: "",
};
