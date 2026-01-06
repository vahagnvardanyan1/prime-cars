"use client";

import { useMemo, useState } from "react";

import type { ShippingCity } from "@/lib/admin/types";
import { fetchShippings } from "@/lib/admin/fetchShippings";
import { increaseShippingPrices } from "@/lib/admin/increaseShippingPrices";
import { deleteShipping } from "@/lib/admin/deleteShipping";
import { toast } from "sonner";

type UpdateCityPriceModalState =
  | { isOpen: false }
  | { isOpen: true; cityId: string };

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useAdminSettingsState = () => {
  const [citiesCache, setCitiesCache] = useState<{
    data: ShippingCity[];
    timestamp: number;
  } | null>(null);

  const [updateCityPriceModal, setUpdateCityPriceModal] =
    useState<UpdateCityPriceModalState>({ isOpen: false });

  const [cities, setCities] = useState<ShippingCity[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const openUpdateCityPrice = ({ cityId }: { cityId: string }) => {
    setUpdateCityPriceModal({ isOpen: true, cityId });
  };

  const closeUpdateCityPrice = () => {
    setUpdateCityPriceModal({ isOpen: false });
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

  const isCitiesCacheValid = useMemo(() => {
    if (!citiesCache) return false;
    const now = Date.now();
    return (now - citiesCache.timestamp) < CACHE_DURATION;
  }, [citiesCache]);

  const loadCities = async ({ forceRefresh = false }: { forceRefresh?: boolean } = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      return;
    }

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
        if (!result.error?.includes('401') && !result.error?.includes('403') && !result.error?.includes('Unauthorized')) {
          toast.error("Failed to load shipping cities", {
            description: result.error || "Could not fetch shipping cities from server.",
          });
        }
      }
    } catch (error) {
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

  const selectedCity = useMemo(() => {
    if (!updateCityPriceModal.isOpen) return null;
    return cities.find((c) => c.id === updateCityPriceModal.cityId) ?? null;
  }, [cities, updateCityPriceModal]);

  return {
    cities,
    isLoadingCities,
    updateCityPriceModal,
    openUpdateCityPrice,
    closeUpdateCityPrice,
    selectedCity,
    updateCityPrice,
    deleteCity,
    applyGlobalAdjustment,
    loadCities,
    isCitiesCacheValid,
  };
};

