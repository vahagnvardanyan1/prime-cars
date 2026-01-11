import { useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type { AdminCar } from "@/lib/admin/types";
import { useAdminCars } from "@/lib/react-query/hooks";

// No more manual cache! React Query handles it automatically

export type CarFiltersState = {
  search: string;
  type: string;
  auction: string;
  carPaid: "all" | "paid" | "not-paid";
  shippingPaid: "all" | "paid" | "not-paid";
  insurance: "all" | "exists" | "not-exists";
  purchaseDateFrom: string; // Format: YYYY-MM-DD
  purchaseDateTo: string; // Format: YYYY-MM-DD
};

const filterCars = ({ cars, filters }: { cars: AdminCar[]; filters: CarFiltersState }) => {
  return cars.filter((car) => {
    // Search filter (search in model, client, VIN, lot, city)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        car.model.toLowerCase().includes(searchLower) ||
        car.client?.toLowerCase().includes(searchLower) ||
        car.details?.vin?.toLowerCase().includes(searchLower) ||
        car.details?.lot?.toLowerCase().includes(searchLower) ||
        car.details?.city?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;
    }

    // Type filter
    if (filters.type !== "all" && car.details?.type !== filters.type) {
      return false;
    }

    // Auction filter
    if (filters.auction !== "all" && car.details?.auction !== filters.auction) {
      return false;
    }

    // Car Paid filter
    if (filters.carPaid === "paid" && !car.carPaid) return false;
    if (filters.carPaid === "not-paid" && car.carPaid) return false;

    // Shipping Paid filter
    if (filters.shippingPaid === "paid" && !car.shippingPaid) return false;
    if (filters.shippingPaid === "not-paid" && car.shippingPaid) return false;

    // Insurance filter
    if (filters.insurance === "exists" && !car.insurance) return false;
    if (filters.insurance === "not-exists" && car.insurance) return false;

    // Purchase Date Range filter
    if (filters.purchaseDateFrom || filters.purchaseDateTo) {
      const carDate = car.details?.purchaseDate;
      if (!carDate) return false;

      if (filters.purchaseDateFrom && carDate < filters.purchaseDateFrom) {
        return false;
      }
      if (filters.purchaseDateTo && carDate > filters.purchaseDateTo) {
        return false;
      }
    }

    return true;
  });
};

export const useAdminCarsStateRefactored = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isAddCarOpen, setIsAddCarOpen] = useState(false);

  // Get filters from URL
  const filters: CarFiltersState = useMemo(
    () => ({
      search: searchParams.get("search") || "",
      type: searchParams.get("type") || "all",
      auction: searchParams.get("auction") || "all",
      carPaid: (searchParams.get("carPaid") as CarFiltersState["carPaid"]) || "all",
      shippingPaid: (searchParams.get("shippingPaid") as CarFiltersState["shippingPaid"]) || "all",
      insurance: (searchParams.get("insurance") as CarFiltersState["insurance"]) || "all",
      purchaseDateFrom: searchParams.get("dateFrom") || "",
      purchaseDateTo: searchParams.get("dateTo") || "",
    }),
    [searchParams]
  );

  // Use React Query - automatic caching!
  const { data, isLoading, error, refetch } = useAdminCars({
    search: filters.search,
    // You can add more server-side filters here if your API supports them
  });

  const allCars = data?.cars || [];

  // Client-side filtering (or move to server-side if API supports it)
  const filteredCars = useMemo(
    () => filterCars({ cars: allCars, filters }),
    [allCars, filters]
  );

  const updateFilters = useCallback(
    ({ nextFilters }: { nextFilters: Partial<CarFiltersState> }) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(nextFilters).forEach(([key, value]) => {
        if (value && value !== "all" && value !== "") {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      });

      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const resetFilters = useCallback(() => {
    router.push("?");
  }, [router]);

  const openAddCar = () => setIsAddCarOpen(true);
  const closeAddCar = () => setIsAddCarOpen(false);

  return {
    filters,
    updateFilters,
    resetFilters,

    allCars,
    filteredCars,
    isLoading,
    error,
    refetch, // React Query's refetch function

    isAddCarOpen,
    openAddCar,
    closeAddCar,

    // No more manual cache validation needed!
    // React Query handles it automatically based on staleTime
  };
};
