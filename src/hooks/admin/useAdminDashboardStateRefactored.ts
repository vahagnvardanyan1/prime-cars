"use client";

import { useState, useMemo } from "react";

import type { AdminCar, ShippingCity } from "@/lib/admin/types";
import { useUsers, useAdminCars, useShipping, useDeleteShipping, useIncreaseShippingPrices } from "@/lib/react-query/hooks";
import { toast } from "sonner";

export type AdminNavKey = "cars" | "users" | "settings" | "calculator" | "notifications";

type UpdateCityPriceModalState =
  | { isOpen: false }
  | { isOpen: true; cityId: string };

export const useAdminDashboardStateRefactored = () => {
  const [activeNav, setActiveNav] = useState<AdminNavKey>("cars");
  const [isAddCarOpen, setIsAddCarOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [updateCityPriceModal, setUpdateCityPriceModal] =
    useState<UpdateCityPriceModalState>({ isOpen: false });

  // Use React Query hooks - they handle caching automatically!
  const { data: usersData, isLoading: isLoadingUsers, refetch: refetchUsers } = useUsers({}, {
    enabled: activeNav === "users",
  });

  const { data: carsData, isLoading: isLoadingCars, refetch: refetchCars } = useAdminCars({}, {
    enabled: activeNav === "cars",
  });

  const { data: citiesData, isLoading: isLoadingCities, refetch: refetchCities } = useShipping({}, {
    enabled: activeNav === "settings",
  });

  // Mutations
  const deleteShippingMutation = useDeleteShipping();
  const increaseShippingPricesMutation = useIncreaseShippingPrices();

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
    // This would be handled by a mutation in the actual implementation
    // For now, just refetch
    refetchCities();
  };

  const deleteCity = async ({ cityId }: { cityId: string }) => {
    deleteShippingMutation.mutate(cityId, {
      onSuccess: () => {
        refetchCities();
      },
    });
  };

  const applyGlobalAdjustment = async ({ delta }: { delta: number }) => {
    increaseShippingPricesMutation.mutate(delta, {
      onSuccess: () => {
        toast.success("Shipping prices updated", {
          description: `All prices increased by ${delta > 0 ? '+' : ''}${delta} USD.`,
        });
        refetchCities();
      },
    });
  };

  const selectedCity = useMemo(() => {
    if (!updateCityPriceModal.isOpen || !citiesData) return null;
    return citiesData.find((c: ShippingCity) => c.id === updateCityPriceModal.cityId) ?? null;
  }, [citiesData, updateCityPriceModal]);

  return {
    activeNav,
    setActiveNav,

    // React Query automatically handles caching, no manual cache needed!
    cars: carsData?.cars || [],
    users: usersData?.users || [],
    cities: citiesData || [],
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

    // Refetch functions
    loadUsers: refetchUsers,
    loadCars: refetchCars,
    loadCities: refetchCities,

    // React Query cache is always valid based on staleTime config
    isUsersCacheValid: !isLoadingUsers,
    isCarsCacheValid: !isLoadingCars,
    isCitiesCacheValid: !isLoadingCities,
  };
};
