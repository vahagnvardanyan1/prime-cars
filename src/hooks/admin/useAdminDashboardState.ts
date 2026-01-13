"use client";

import { useMemo, useState, useEffect } from "react";

import { toast } from "sonner";

import type { AdminCar, AdminUser, ShippingCity } from "@/lib/admin/types";

import { fetchUsers } from "@/lib/admin/fetchUsers";
import { fetchCars } from "@/lib/admin/fetchCars";
import { fetchShippings } from "@/lib/admin/fetchShippings";
import { increaseShippingPrices } from "@/lib/admin/increaseShippingPrices";
import { deleteShipping } from "@/lib/admin/deleteShipping";
import { isCacheValid, createCacheEntry } from "@/lib/utils/cache";
import { isAuthenticated, isAuthError } from "@/lib/utils/error-handling";
import type { CacheEntry } from "@/lib/utils/cache";

export type AdminNavKey = "cars" | "availableCars" | "users" | "settings" | "calculator" | "notifications";

type UpdateCityPriceModalState =
  | { isOpen: false }
  | { isOpen: true; cityId: string };

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

type UseAdminDashboardStateProps = {
  isAdmin?: boolean;
};

export const useAdminDashboardState = ({ isAdmin = false }: UseAdminDashboardStateProps = {}) => {
  const [activeNav, setActiveNav] = useState<AdminNavKey>("cars");
  const [usersCache, setUsersCache] = useState<CacheEntry<AdminUser[]> | null>(null);
  const [carsCache, setCarsCache] = useState<CacheEntry<AdminCar[]> | null>(null);
  const [citiesCache, setCitiesCache] = useState<CacheEntry<ShippingCity[]> | null>(null);

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
        await loadCities({ forceRefresh: true });
      } else {
        toast.error("Failed to delete shipping city", {
          description: result.error || "Could not delete the city.",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast.error("Failed to delete shipping city", {
        description: errorMessage,
      });
    }
  };

  const applyGlobalAdjustment = async ({ delta, auction }: { delta: number; auction: string }) => {
    try {
      const result = await increaseShippingPrices({ amount: delta, auction: auction as any, isAdmin });
      
      if (result.success) {
        toast.success("Shipping prices updated", {
          description: `All prices increased by ${delta > 0 ? '+' : ''}${delta} USD.`,
        });
        await loadCities({ forceRefresh: true });
      } else {
        toast.error("Failed to update shipping prices", {
          description: result.error || "Could not update prices.",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast.error("Failed to update shipping prices", {
        description: errorMessage,
      });
    }
  };

  const addCar = ({ car }: { car: AdminCar }) => {
    setCars((prev) => [car, ...prev]);
  };

  const isUsersCacheValid = useMemo(() => {
    return isCacheValid({ cache: usersCache, duration: CACHE_DURATION });
  }, [usersCache]);

  const isCarsCacheValid = useMemo(() => {
    return isCacheValid({ cache: carsCache, duration: CACHE_DURATION });
  }, [carsCache]);

  const isCitiesCacheValid = useMemo(() => {
    return isCacheValid({ cache: citiesCache, duration: CACHE_DURATION });
  }, [citiesCache]);

  const loadUsers = async ({ forceRefresh = false }: { forceRefresh?: boolean } = {}) => {
    // Only load users if user is admin
    if (!isAdmin) {
      return;
    }

    if (!isAuthenticated()) {
      return;
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
        setUsersCache(createCacheEntry({ data: result.users }));
      } else {
        if (!isAuthError({ errorMessage: result.error })) {
          toast.error("Failed to load users", {
            description: result.error || "Could not fetch users from server.",
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "";
      if (!isAuthError({ errorMessage })) {
        toast.error("Failed to load users", {
          description: errorMessage || "An unexpected error occurred.",
        });
      }
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadCars = async ({ forceRefresh = false }: { forceRefresh?: boolean } = {}) => {
    if (!isAuthenticated()) {
      return;
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
        setCarsCache(createCacheEntry({ data: result.cars }));
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
  };

  const loadCities = async ({ forceRefresh = false }: { forceRefresh?: boolean } = {}) => {
    if (!isAuthenticated()) {
      return;
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
        setCitiesCache(createCacheEntry({ data: result.cities }));
      } else {
        if (!isAuthError({ errorMessage: result.error })) {
          toast.error("Failed to load shipping cities", {
            description: result.error || "Could not fetch shipping cities from server.",
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "";
      if (!isAuthError({ errorMessage })) {
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
      if (usersCache && isUsersCacheValid) {
        setUsers(usersCache.data);
      } else if (!usersCache || !isUsersCacheValid) {
        loadUsers();
      }
    }
    
    if (activeNav === "cars" && !isLoadingCars) {
      if (carsCache && isCarsCacheValid) {
        setCars(carsCache.data);
      } else if (!carsCache || !isCarsCacheValid) {
        loadCars();
      }
    }

    if (activeNav === "settings" && !isLoadingCities) {
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
