import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import type { AdminCar, AdminCarStatus } from "@/lib/admin/types";
import { fetchCars } from "@/lib/admin/fetchCars";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Module-level cache that persists across component mounts/unmounts
let carsCache: {
  data: AdminCar[];
  timestamp: number;
} | null = null;

export type CarFiltersState = {
  search: string;
  type: string;
  auction: string;
  status: AdminCarStatus | "all";
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

    // Status filter
    if (filters.status !== "all" && car.status !== filters.status) {
      return false;
    }

    return true;
  });
};

export const useAdminCarsState = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isAddCarOpen, setIsAddCarOpen] = useState(false);
  const [allCars, setAllCars] = useState<AdminCar[]>(() => carsCache?.data || []);
  const [isLoadingCars, setIsLoadingCars] = useState(false);

  // Initialize filters from URL
  const [filters, setFilters] = useState<CarFiltersState>(() => ({
    search: searchParams.get("search") || "",
    type: searchParams.get("type") || "all",
    auction: searchParams.get("auction") || "all",
    status: (searchParams.get("status") as AdminCarStatus | "all") || "all",
  }));

  const openAddCar = () => setIsAddCarOpen(true);
  const closeAddCar = () => setIsAddCarOpen(false);

  const addCar = ({ car }: { car: AdminCar }) => {
    setAllCars((prev) => [car, ...prev]);
  };

  const isCarsCacheValid = useMemo(() => {
    if (!carsCache) return false;
    const now = Date.now();
    return (now - carsCache.timestamp) < CACHE_DURATION;
  }, []);

  // Apply filters to get filtered cars
  const filteredCars = useMemo(() => {
    return filterCars({ cars: allCars, filters });
  }, [allCars, filters]);

  // Update URL when filters change
  const updateFilters = useCallback((newFilters: CarFiltersState) => {
    setFilters(newFilters);

    // Build URL params
    const params = new URLSearchParams();
    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.type !== "all") params.set("type", newFilters.type);
    if (newFilters.auction !== "all") params.set("auction", newFilters.auction);
    if (newFilters.status !== "all") params.set("status", newFilters.status);

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;

    router.replace(newUrl, { scroll: false });
  }, [router]);

  const clearFilters = useCallback(() => {
    const defaultFilters: CarFiltersState = {
      search: "",
      type: "all",
      auction: "all",
      status: "all",
    };
    updateFilters(defaultFilters);
  }, [updateFilters]);

  const loadCars = async ({ forceRefresh = false }: { forceRefresh?: boolean } = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      return;
    }

    if (!forceRefresh && carsCache && isCarsCacheValid) {
      setAllCars(carsCache.data);
      return;
    }

    setIsLoadingCars(true);
    try {
      const result = await fetchCars();
      
      if (result.success && result.cars) {
        setAllCars(result.cars);
        carsCache = {
          data: result.cars,
          timestamp: Date.now(),
        };
      } else {
        if (!result.error?.includes('401') && !result.error?.includes('403') && !result.error?.includes('Unauthorized')) {
          toast.error("Failed to load cars", {
            description: result.error || "Could not fetch cars from server.",
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "";
      if (!errorMessage.includes('401') && !errorMessage.includes('403') && !errorMessage.includes('Unauthorized')) {
        toast.error("Failed to load cars", {
          description: errorMessage || "An unexpected error occurred.",
        });
      }
    } finally {
      setIsLoadingCars(false);
    }
  };

  // Sync filters with URL on mount and when searchParams change
  useEffect(() => {
    const urlFilters: CarFiltersState = {
      search: searchParams.get("search") || "",
      type: searchParams.get("type") || "all",
      auction: searchParams.get("auction") || "all",
      status: (searchParams.get("status") as AdminCarStatus | "all") || "all",
    };
    setFilters(urlFilters);
  }, [searchParams]);

  return {
    cars: filteredCars,
    isLoadingCars,
    isAddCarOpen,
    openAddCar,
    closeAddCar,
    addCar,
    loadCars,
    isCarsCacheValid,
    filters,
    updateFilters,
    clearFilters,
  };
};

