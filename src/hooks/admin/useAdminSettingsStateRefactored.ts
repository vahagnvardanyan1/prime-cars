"use client";

import { useMemo, useState } from "react";

import type { ShippingCity } from "@/lib/admin/types";
import { Auction } from "@/lib/admin/types";
import { useShipping, useUsers, useDeleteShipping, useUpdateUserCoefficient, useIncreaseShippingPrices } from "@/lib/react-query/hooks";
import { toast } from "sonner";

type UpdateCityPriceModalState =
  | { isOpen: false }
  | { isOpen: true; cityId: string };

// No more manual cache! React Query handles it automatically per auction category

export const useAdminSettingsStateRefactored = () => {
  const [updateCityPriceModal, setUpdateCityPriceModal] =
    useState<UpdateCityPriceModalState>({ isOpen: false });
  const [currentAuction, setCurrentAuction] = useState<Auction | null>(null);

  // Use React Query hooks - automatic caching per auction!
  const { data: citiesData, isLoading: isLoadingCities, refetch: refetchCities } = useShipping({
    auction: currentAuction || undefined,
  });

  const { data: usersData, isLoading: isLoadingUsers, refetch: refetchUsers } = useUsers();

  // Mutations
  const deleteShippingMutation = useDeleteShipping();
  const updateCoefficientMutation = useUpdateUserCoefficient();
  const increaseShippingPricesMutation = useIncreaseShippingPrices();

  const cities = citiesData || [];
  const users = usersData?.users || [];

  const openUpdateCityPrice = ({ cityId }: { cityId: string }) => {
    setUpdateCityPriceModal({ isOpen: true, cityId });
  };

  const closeUpdateCityPrice = () => {
    setUpdateCityPriceModal({ isOpen: false });
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

  const updateUserCoefficientAction = async ({
    userId,
    coefficient,
  }: {
    userId: string;
    coefficient: number;
  }) => {
    updateCoefficientMutation.mutate(
      { id: userId, coefficient },
      {
        onSuccess: () => {
          refetchUsers();
        },
      }
    );
  };

  const changeAuctionCategory = ({ auction }: { auction: Auction | null }) => {
    setCurrentAuction(auction);
    // React Query will automatically fetch new data for this auction
    // No need to manually invalidate cache!
  };

  const selectedCity = useMemo(() => {
    if (!updateCityPriceModal.isOpen) return null;
    return cities.find((c) => c.id === updateCityPriceModal.cityId) ?? null;
  }, [cities, updateCityPriceModal]);

  return {
    updateCityPriceModal,
    openUpdateCityPrice,
    closeUpdateCityPrice,
    selectedCity: selectedCity as ShippingCity | null,

    cities,
    users,
    isLoadingCities,
    isLoadingUsers,

    currentAuction,
    changeAuctionCategory,

    deleteCity,
    applyGlobalAdjustment,
    updateUserCoefficient: updateUserCoefficientAction,

    // Refetch functions
    refetchCities,
    refetchUsers,

    // No more manual cache validation needed!
    // React Query handles it automatically based on staleTime
  };
};
