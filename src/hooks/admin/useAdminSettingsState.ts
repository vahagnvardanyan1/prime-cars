"use client";

import { useMemo, useState } from "react";

import type { ShippingCity, AdminUser } from "@/lib/admin/types";
import { Auction } from "@/lib/admin/types";
import { fetchShippings } from "@/lib/admin/fetchShippings";
import { increaseShippingPrices } from "@/lib/admin/increaseShippingPrices";
import { deleteShipping } from "@/lib/admin/deleteShipping";
import { fetchUsers } from "@/lib/admin/fetchUsers";
import { updateUserCoefficient } from "@/lib/admin/updateUserCoefficient";
import { toast } from "sonner";

type UpdateCityPriceModalState =
  | { isOpen: false }
  | { isOpen: true; cityId: string };

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Module-level cache that persists across component mounts/unmounts
// Cache per auction category
const citiesCache: Map<string, {
  data: ShippingCity[];
  timestamp: number;
}> = new Map();

export const useAdminSettingsState = () => {
  const [updateCityPriceModal, setUpdateCityPriceModal] =
    useState<UpdateCityPriceModalState>({ isOpen: false });

  const [cities, setCities] = useState<ShippingCity[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [currentAuction, setCurrentAuction] = useState<Auction | null>(null);
  
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

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
        // Clear cache for current auction and reload
        if (currentAuction) {
          citiesCache.delete(currentAuction);
        }
        await loadCities({ forceRefresh: true, auction: currentAuction || undefined });
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
        // Clear all cache entries since prices changed globally
        citiesCache.clear();
        console.log("🧹 Cleared all cities cache after global price adjustment");
        await loadCities({ forceRefresh: true, auction: currentAuction || undefined });
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

  const isCitiesCacheValid = ({ auction }: { auction?: Auction }) => {
    if (!auction) return false;
    const cached = citiesCache.get(auction);
    if (!cached) return false;
    const now = Date.now();
    return (now - cached.timestamp) < CACHE_DURATION;
  };

  const loadCities = async ({ forceRefresh = false, auction }: { forceRefresh?: boolean; auction?: Auction } = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      return;
    }

    // Use cache if available and valid (unless forceRefresh is true)
    if (!forceRefresh && auction && isCitiesCacheValid({ auction })) {
      const cached = citiesCache.get(auction);
      if (cached) {
        console.log(`✅ Using cached cities for ${auction}`);
        setCities(cached.data);
        setCurrentAuction(auction);
        return;
      }
    }

    setIsLoadingCities(true);
    try {
      console.log(`🔄 Fetching cities from API for ${auction || 'all'}`);
      const result = await fetchShippings({ auction });
      
      if (result.success && result.cities) {
        setCities(result.cities);
        setCurrentAuction(auction || null);
        
        // Cache the result per auction
        if (auction) {
          citiesCache.set(auction, {
            data: result.cities,
            timestamp: Date.now(),
          });
          console.log(`💾 Cached ${result.cities.length} cities for ${auction}`);
        }
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
    const updatedCities = cities.map((c) =>
      c.id === cityId ? { ...c, shippingUsd: nextShippingUsd } : c,
    );
    setCities(updatedCities);
    
    // Update the cache for the current auction
    if (currentAuction) {
      const cached = citiesCache.get(currentAuction);
      if (cached) {
        citiesCache.set(currentAuction, {
          data: updatedCities,
          timestamp: cached.timestamp,
        });
        console.log(`💾 Updated cache for ${currentAuction} after price change`);
      }
    }
  };

  const loadUsers = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      return;
    }

    setIsLoadingUsers(true);
    try {
      const result = await fetchUsers();
      
      if (result.success && result.users) {
        setUsers(result.users);
      } else {
        if (!result.error?.includes('401') && !result.error?.includes('403') && !result.error?.includes('Unauthorized')) {
          toast.error("Failed to load users", {
            description: result.error || "Could not fetch users from server.",
          });
        }
      }
    } catch (error) {
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

  const updateCoefficient = async ({ userId, coefficient, category }: { userId: string; coefficient: number; category?: Auction }) => {
    try {
      const result = await updateUserCoefficient({ userId, coefficient, category: category as string | undefined });
      
      if (result.success) {
        const messages = [];
        if (coefficient !== undefined) messages.push(`coefficient: ${coefficient}`);
        if (category !== undefined) messages.push(`auction: ${category.toUpperCase()}`);
        
        toast.success("User settings updated", {
          description: `Updated ${messages.join(', ')}.`,
        });
        
        // Update local state
        setUsers(users.map(u => u.id === userId ? { ...u, coefficient, ...(category !== undefined && { category: category as Auction }) } : u));
      } else {
        toast.error("Failed to update user settings", {
          description: result.error || "Could not update user settings.",
        });
      }
    } catch (error) {
      toast.error("Failed to update user settings", {
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    }
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
    currentAuction,
    users,
    isLoadingUsers,
    loadUsers,
    updateCoefficient,
  };
};

