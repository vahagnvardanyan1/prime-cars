"use client";

import { useMemo, useState, useEffect } from "react";

import type { AdminCar, AdminUser, ShippingCity } from "@/lib/admin/types";
import { fetchUsers } from "@/lib/admin/fetchUsers";
import { fetchCars } from "@/lib/admin/fetchCars";
import { fetchShippings } from "@/lib/admin/fetchShippings";
import { increaseShippingPrices } from "@/lib/admin/increaseShippingPrices";
import { deleteShipping } from "@/lib/admin/deleteShipping";
import { toast } from "sonner";

export type AdminNavKey = "cars" | "availableCars" | "users" | "settings" | "calculator" | "notifications";

type UpdateCityPriceModalState =
  | { isOpen: false }
  | { isOpen: true; cityId: string };

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useAdminDashboardState = () => {
  const [activeNav, setActiveNav] = useState<AdminNavKey>("cars");
  const [usersCache, setUsersCache] = useState<{
    data: AdminUser[];
    timestamp: number;
  } | null>(null);
  const [carsCache, setCarsCache] = useState<{
    data: AdminCar[];
    timestamp: number;
  } | null>(null);
  const [citiesCache, setCitiesCache] = useState<{
    data: ShippingCity[];
    timestamp: number;
  } | null>(null);

  const [isAddCarOpen, setIsAddCarOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [updateCityPriceModal, setUpdateCityPriceModal] =
    useState<UpdateCityPriceModalState>({ isOpen: false });

  const [cars, setCars] = useState<AdminCar[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [cities, setCities] = useState<ShippingCity[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingCars, setIsLoadingCars] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const openAddCar = () => setIsAddCarOpen(true);
  const closeAddCar = () => setIsAddCarOpen(false);

  const openCreateUser = () => setIsCreateUserOpen(true);
  const closeCreateUser = () => setIsCreateUserOpen(false);

  const openUpdateCityPrice = ({ cityId }: { cityId: string }) => {
    setUpdateCityPriceModal({ isOpen: true, cityId });
  };

  const closeUpdateCityPrice = () => {
    setUpdateCityPriceModal({ isOpen: false });
  };

  const updateCityPrice = ({
    cityId,
    nextShippingUsd,
  }: {
    cityId: string;
    nextShippingUsd: number;
  }) => {
    setCities((prev) =>
      prev.map((c) =>
        c.id === cityId ? { ...c, shippingUsd: nextShippingUsd } : c,
      ),
    );
  };

  const deleteCity = async ({ cityId }: { cityId: string }) => {
    try {
      const result = await deleteShipping({ id: cityId });
      
      if (result.success) {
        toast.success("Shipping city deleted", {
          description: "The shipping city has been removed successfully.",
        });
        // Reload cities from backend to get updated data
        await loadCities({ forceRefresh: true });
      } else {
        toast.error("Failed to delete shipping city", {
          description: result.error || "Could not delete the city.",
        });
      }
    } catch (error) {
      toast.error("Failed to delete shipping city", {
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    }
  };

  const applyGlobalAdjustment = async ({ delta }: { delta: number }) => {
    try {
      const result = await increaseShippingPrices({ amount: delta });
      
      if (result.success) {
        toast.success("Shipping prices updated", {
          description: `All prices increased by ${delta > 0 ? '+' : ''}${delta} USD.`,
        });
        // Reload cities from backend to get updated data
        await loadCities({ forceRefresh: true });
      } else {
        toast.error("Failed to update shipping prices", {
          description: result.error || "Could not update prices.",
        });
      }
    } catch (error) {
      toast.error("Failed to update shipping prices", {
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    }
  };

  const addCar = ({ car }: { car: AdminCar }) => {
    setCars((prev) => [car, ...prev]);
  };

  const isUsersCacheValid = useMemo(() => {
    if (!usersCache) return false;
    const now = Date.now();
    return (now - usersCache.timestamp) < CACHE_DURATION;
  }, [usersCache]);

  const isCarsCacheValid = useMemo(() => {
    if (!carsCache) return false;
    const now = Date.now();
    return (now - carsCache.timestamp) < CACHE_DURATION;
  }, [carsCache]);

  const isCitiesCacheValid = useMemo(() => {
    if (!citiesCache) return false;
    const now = Date.now();
    return (now - citiesCache.timestamp) < CACHE_DURATION;
  }, [citiesCache]);

  const loadUsers = async ({ forceRefresh = false }: { forceRefresh?: boolean } = {}) => {
    // Check if user is authenticated
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      return; // Don't show error if not authenticated
    }

    // Check cache first
    if (!forceRefresh && usersCache && isUsersCacheValid) {
      setUsers(usersCache.data);
      return;
    }

    setIsLoadingUsers(true);
    try {
      const result = await fetchUsers();
      
      if (result.success && result.users) {
        setUsers(result.users);
        setUsersCache({
          data: result.users,
          timestamp: Date.now(),
        });
      } else {
        // Only show error if authenticated (not 401/403 errors)
        if (!result.error?.includes('401') && !result.error?.includes('403') && !result.error?.includes('Unauthorized')) {
          toast.error("Failed to load users", {
            description: result.error || "Could not fetch users from server.",
          });
        }
      }
    } catch (error) {
      // Only show error if it's not an auth error
      const errorMessage = error instanceof Error ? error.message : "";
      if (!errorMessage.includes('401') && !errorMessage.includes('403') && !errorMessage.includes('Unauthorized')) {
        toast.error("Failed to load users", {
          description: errorMessage || "An unexpected error occurred.",
        });
      }
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadCars = async ({ forceRefresh = false }: { forceRefresh?: boolean } = {}) => {
    // Check if user is authenticated
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      return; // Don't show error if not authenticated
    }

    // Check cache first
    if (!forceRefresh && carsCache && isCarsCacheValid) {
      setCars(carsCache.data);
      return;
    }

    setIsLoadingCars(true);
    try {
      const result = await fetchCars();
      
      if (result.success && result.cars) {
        setCars(result.cars);
        setCarsCache({
          data: result.cars,
          timestamp: Date.now(),
        });
      } else {
        // Only show error if authenticated (not 401/403 errors)
        if (!result.error?.includes('401') && !result.error?.includes('403') && !result.error?.includes('Unauthorized')) {
          toast.error("Failed to load cars", {
            description: result.error || "Could not fetch cars from server.",
          });
        }
      }
    } catch (error) {
      // Only show error if it's not an auth error
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

  const loadCities = async ({ forceRefresh = false }: { forceRefresh?: boolean } = {}) => {
    // Check if user is authenticated
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      return; // Don't show error if not authenticated
    }

    // Check cache first
    if (!forceRefresh && citiesCache && isCitiesCacheValid) {
      setCities(citiesCache.data);
      return;
    }

    setIsLoadingCities(true);
    try {
      const result = await fetchShippings();
      
      if (result.success && result.cities) {
        setCities(result.cities);
        setCitiesCache({
          data: result.cities,
          timestamp: Date.now(),
        });
      } else {
        // Only show error if authenticated (not 401/403 errors)
        if (!result.error?.includes('401') && !result.error?.includes('403') && !result.error?.includes('Unauthorized')) {
          toast.error("Failed to load shipping cities", {
            description: result.error || "Could not fetch shipping cities from server.",
          });
        }
      }
    } catch (error) {
      // Only show error if it's not an auth error
      const errorMessage = error instanceof Error ? error.message : "";
      if (!errorMessage.includes('401') && !errorMessage.includes('403') && !errorMessage.includes('Unauthorized')) {
        toast.error("Failed to load shipping cities", {
          description: errorMessage || "An unexpected error occurred.",
        });
      }
    } finally {
      setIsLoadingCities(false);
    }
  };

  useEffect(() => {
    if (activeNav === "users" && !isLoadingUsers) {
      // Load from cache if valid, otherwise fetch
      if (usersCache && isUsersCacheValid) {
        setUsers(usersCache.data);
      } else if (!usersCache || !isUsersCacheValid) {
        loadUsers();
      }
    }
    
    if (activeNav === "cars" && !isLoadingCars) {
      // Load from cache if valid, otherwise fetch
      if (carsCache && isCarsCacheValid) {
        setCars(carsCache.data);
      } else if (!carsCache || !isCarsCacheValid) {
        loadCars();
      }
    }

    if (activeNav === "settings" && !isLoadingCities) {
      // Load from cache if valid, otherwise fetch
      if (citiesCache && isCitiesCacheValid) {
        setCities(citiesCache.data);
      } else if (!citiesCache || !isCitiesCacheValid) {
        loadCities();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNav]);

  const selectedCity = useMemo(() => {
    if (!updateCityPriceModal.isOpen) return null;
    return cities.find((c) => c.id === updateCityPriceModal.cityId) ?? null;
  }, [cities, updateCityPriceModal]);

  return {
    activeNav,
    setActiveNav,

    cars,
    users,
    cities,
    isLoadingUsers,
    isLoadingCars,
    isLoadingCities,

    isAddCarOpen,
    openAddCar,
    closeAddCar,

    isCreateUserOpen,
    openCreateUser,
    closeCreateUser,

    updateCityPriceModal,
    openUpdateCityPrice,
    closeUpdateCityPrice,
    selectedCity,

    updateCityPrice,
    deleteCity,
    applyGlobalAdjustment,

    addCar,
    loadUsers,
    loadCars,
    loadCities,
    isUsersCacheValid,
    isCarsCacheValid,
    isCitiesCacheValid,
  };
};





