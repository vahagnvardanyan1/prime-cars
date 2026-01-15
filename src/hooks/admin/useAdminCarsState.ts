import { useMemo, useState, useEffect, useCallback } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { toast } from "sonner";

import type { AdminCar } from "@/lib/admin/types";

import { fetchCars } from "@/lib/admin/fetchCars";
import { isCacheValid, createCacheEntry } from "@/lib/utils/cache";
import { isAuthenticated, isAuthError } from "@/lib/utils/error-handling";
import { buildUrlParams, updateUrlWithParams } from "@/lib/utils/url-params";
import { filterCars, defaultCarFilters } from "@/lib/utils/car-filters";
import type { CarFiltersState } from "@/lib/utils/car-filters";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Module-level cache that persists across component mounts/unmounts
let carsCache: {
  data: AdminCar[];
  timestamp: number;
} | null = null;

export type { CarFiltersState };

export const useAdminCarsState = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isAddCarOpen, setIsAddCarOpen] = useState(false);
  const [allCars, setAllCars] = useState<AdminCar[]>(() => carsCache?.data || []);
  const [isLoadingCars, setIsLoadingCars] = useState(false);
  
  // Pagination state - initialize from URL
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const saved = searchParams.get("page");
    return saved ? parseInt(saved, 10) : 1;
  });
  const [pageSize, setPageSize] = useState<number>(() => {
    const saved = searchParams.get("pageSize");
    return saved ? parseInt(saved, 10) : 25;
  });
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Initialize filters from URL
  const [filters, setFilters] = useState<CarFiltersState>(() => ({
    search: searchParams.get("search") || "",
    type: searchParams.get("type") || "all",
    auction: searchParams.get("auction") || "all",
    carPaid: (searchParams.get("carPaid") as "all" | "paid" | "not-paid") || "all",
    shippingPaid: (searchParams.get("shippingPaid") as "all" | "paid" | "not-paid") || "all",
    insurance: (searchParams.get("insurance") as "all" | "exists" | "not-exists") || "all",
    purchaseDateFrom: searchParams.get("purchaseDateFrom") || "",
    purchaseDateTo: searchParams.get("purchaseDateTo") || "",
  }));

  const openAddCar = () => setIsAddCarOpen(true);
  const closeAddCar = () => setIsAddCarOpen(false);

  const addCar = ({ car }: { car: AdminCar }) => {
    setAllCars((prev) => [car, ...prev]);
  };

  const isCarsCacheValid = useMemo(() => {
    return isCacheValid({ cache: carsCache, duration: CACHE_DURATION });
  }, []);

  // Apply filters to get filtered cars
  const filteredCars = useMemo(() => {
    return filterCars({ cars: allCars, filters });
  }, [allCars, filters]);

  // Update URL when filters change
  const updateFilters = useCallback((newFilters: CarFiltersState) => {
    setFilters(newFilters);

    // Build URL params
    const params = buildUrlParams({ 
      params: {
        search: newFilters.search,
        type: newFilters.type !== "all" ? newFilters.type : "",
        auction: newFilters.auction !== "all" ? newFilters.auction : "",
        carPaid: newFilters.carPaid !== "all" ? newFilters.carPaid : "",
        shippingPaid: newFilters.shippingPaid !== "all" ? newFilters.shippingPaid : "",
        insurance: newFilters.insurance !== "all" ? newFilters.insurance : "",
        purchaseDateFrom: newFilters.purchaseDateFrom,
        purchaseDateTo: newFilters.purchaseDateTo,
      }
    });

    updateUrlWithParams({ params, router });
  }, [router]);

  const clearFilters = useCallback(() => {
    updateFilters(defaultCarFilters);
  }, [updateFilters]);

  const loadCars = useCallback(async ({ 
    forceRefresh = false,
    page,
    limit,
  }: { 
    forceRefresh?: boolean;
    page?: number;
    limit?: number;
  } = {}) => {
    if (!isAuthenticated()) {
      return;
    }

    const pageToFetch = page !== undefined ? page : currentPage;
    const limitToFetch = limit !== undefined ? limit : pageSize;

    const useCache = !forceRefresh && carsCache && isCarsCacheValid;
    
    if (useCache && carsCache) {
      setAllCars(carsCache.data);
    }

    if (!useCache) {
      setIsLoadingCars(true);
    }
    
    try {
      const result = await fetchCars({ page: pageToFetch, limit: limitToFetch });
      
      if (result.success && result.cars) {
        setAllCars(result.cars);
        setTotalItems(result.total || 0);
        setTotalPages(result.totalPages || 0);
        setCurrentPage(result.page || pageToFetch);
        
        carsCache = createCacheEntry({ data: result.cars });
      } else {
        if (!isAuthError({ errorMessage: result.error })) {
          toast.error("Failed to load cars", {
            description: result.error || "Could not fetch cars from server.",
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "";
      if (!isAuthError({ errorMessage })) {
        toast.error("Failed to load cars", {
          description: errorMessage || "An unexpected error occurred.",
        });
      }
    } finally {
      setIsLoadingCars(false);
    }
  }, [currentPage, pageSize, isCarsCacheValid]);

  const changePage = useCallback((page: number) => {
    setCurrentPage(page);
    
    // Update URL with new page
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    params.set("pageSize", pageSize.toString());
    updateUrlWithParams({ params, router });
    
    loadCars({ page, limit: pageSize });
  }, [pageSize, router, loadCars]);

  const changePageSize = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    
    // Update URL
    const params = new URLSearchParams(window.location.search);
    params.set("page", "1");
    params.set("pageSize", size.toString());
    updateUrlWithParams({ params, router });
    
    loadCars({ page: 1, limit: size });
  }, [router, loadCars]);

  // Sync filters and pagination with URL on mount and when searchParams change
  useEffect(() => {
    const urlFilters: CarFiltersState = {
      search: searchParams.get("search") || "",
      type: searchParams.get("type") || "all",
      auction: searchParams.get("auction") || "all",
      carPaid: (searchParams.get("carPaid") as "all" | "paid" | "not-paid") || "all",
      shippingPaid: (searchParams.get("shippingPaid") as "all" | "paid" | "not-paid") || "all",
      insurance: (searchParams.get("insurance") as "all" | "exists" | "not-exists") || "all",
      purchaseDateFrom: searchParams.get("purchaseDateFrom") || "",
      purchaseDateTo: searchParams.get("purchaseDateTo") || "",
    };
    setFilters(urlFilters);
    
    // Sync pagination from URL
    const urlPage = searchParams.get("page");
    const urlPageSize = searchParams.get("pageSize");
    
    if (urlPage) {
      const parsedPage = parseInt(urlPage, 10);
      if (parsedPage !== currentPage) {
        setCurrentPage(parsedPage);
      }
    }
    
    if (urlPageSize) {
      const parsedSize = parseInt(urlPageSize, 10);
      if (parsedSize !== pageSize) {
        setPageSize(parsedSize);
      }
    }
  }, [searchParams, currentPage, pageSize]);

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
    // Pagination
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    changePage,
    changePageSize,
  };
};
