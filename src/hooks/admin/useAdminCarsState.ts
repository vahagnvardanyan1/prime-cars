import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import type { AdminCar } from "@/lib/admin/types";
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
    if (filters.carPaid !== "all") {
      const isPaid = car.carPaid === true;
      if (filters.carPaid === "paid" && !isPaid) return false;
      if (filters.carPaid === "not-paid" && isPaid) return false;
    }

    // Shipping Paid filter
    if (filters.shippingPaid !== "all") {
      const isPaid = car.shippingPaid === true;
      if (filters.shippingPaid === "paid" && !isPaid) return false;
      if (filters.shippingPaid === "not-paid" && isPaid) return false;
    }

    // Insurance filter
    if (filters.insurance !== "all") {
      const hasInsurance = car.insurance === true;
      if (filters.insurance === "exists" && !hasInsurance) return false;
      if (filters.insurance === "not-exists" && hasInsurance) return false;
    }

    // Purchase Date Range filter
    if (filters.purchaseDateFrom || filters.purchaseDateTo) {
      const purchaseDate = car.details?.purchaseDate;
      if (!purchaseDate) return false;
      
      const carDate = new Date(purchaseDate);
      const carDateString = carDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // If "from" is set or default to now
      const fromDate = filters.purchaseDateFrom || new Date().toISOString().split('T')[0];
      if (carDateString < fromDate) return false;
      
      // If "to" is set
      if (filters.purchaseDateTo && carDateString > filters.purchaseDateTo) return false;
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
    if (newFilters.carPaid !== "all") params.set("carPaid", newFilters.carPaid);
    if (newFilters.shippingPaid !== "all") params.set("shippingPaid", newFilters.shippingPaid);
    if (newFilters.insurance !== "all") params.set("insurance", newFilters.insurance);
    if (newFilters.purchaseDateFrom) params.set("purchaseDateFrom", newFilters.purchaseDateFrom);
    if (newFilters.purchaseDateTo) params.set("purchaseDateTo", newFilters.purchaseDateTo);

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;

    router.replace(newUrl, { scroll: false });
  }, [router]);

  const clearFilters = useCallback(() => {
    const defaultFilters: CarFiltersState = {
      search: "",
      type: "all",
      auction: "all",
      carPaid: "all",
      shippingPaid: "all",
      insurance: "all",
      purchaseDateFrom: "",
      purchaseDateTo: "",
    };
    updateFilters(defaultFilters);
  }, [updateFilters]);

  const loadCars = async ({ 
    forceRefresh = false,
    page,
    limit,
  }: { 
    forceRefresh?: boolean;
    page?: number;
    limit?: number;
  } = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      return;
    }

    const pageToFetch = page !== undefined ? page : currentPage;
    const limitToFetch = limit !== undefined ? limit : pageSize;

    // Skip cache check - always fetch fresh data for pagination to work correctly
    // Cache causes issues with pagination state
    const useCache = !forceRefresh && carsCache && isCarsCacheValid;
    
    if (useCache) {
      setAllCars(carsCache.data);
      // Don't return here - still need to set pagination info
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

  const changePage = useCallback((page: number) => {
    setCurrentPage(page);
    
    // Update URL with new page
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    params.set("pageSize", pageSize.toString());
    router.replace(`?${params.toString()}`, { scroll: false });
    
    loadCars({ page, limit: pageSize });
  }, [pageSize, router]);

  const changePageSize = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
    
    // Update URL
    const params = new URLSearchParams(window.location.search);
    params.set("page", "1");
    params.set("pageSize", size.toString());
    router.replace(`?${params.toString()}`, { scroll: false });
    
    loadCars({ page: 1, limit: size });
  }, [router]);

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
    // Pagination
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    changePage,
    changePageSize,
  };
};

