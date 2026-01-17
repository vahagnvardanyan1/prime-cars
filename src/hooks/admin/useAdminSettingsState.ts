"use client";

import { useMemo, useState } from "react";

import type { ShippingCity, AdminUser } from "@/lib/admin/types";
import { Auction } from "@/lib/admin/types";
import { fetchShippings } from "@/lib/admin/fetchShippings";
import { increaseShippingPrices } from "@/lib/admin/increaseShippingPrices";
import { deleteShipping } from "@/lib/admin/deleteShipping";
import { fetchUsers } from "@/lib/admin/fetchUsers";
import { updateUserCoefficient } from "@/lib/admin/updateUserCoefficient";
import { fetchGlobalAdjustment } from "@/lib/admin/fetchGlobalAdjustment";
import { adjustUserShippingPrice } from "@/lib/admin/adjustUserShippingPrice";
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

export const useAdminSettingsState = ({ isAdmin }: { isAdmin?: boolean } = {}) => {
  const [updateCityPriceModal, setUpdateCityPriceModal] =
    useState<UpdateCityPriceModalState>({ isOpen: false });

  const [cities, setCities] = useState<ShippingCity[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [currentAuction, setCurrentAuction] = useState<Auction | null>(null);
  
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  
  const [globalAdjustment, setGlobalAdjustment] = useState<{
    adjustmentAmount?: number;
    basePrice?: number;
    category?: string;
    lastAdjustmentAmount?: number;
    lastAdjustmentDate?: string;
  }>({});

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

  const applyGlobalAdjustment = async ({ delta, auction }: { delta: number; auction: Auction }) => {
    try {
      const result = await increaseShippingPrices({ amount: delta, auction, isAdmin });
      
      if (result.success) {
        const message = isAdmin
          ? `All ${auction.toUpperCase()} prices ${delta > 0 ? 'increased' : 'decreased'} by ${Math.abs(delta)} USD.`
          : `Your shipping prices ${delta > 0 ? 'increased' : 'decreased'} by ${Math.abs(delta)} USD.`;
        
        toast.success("Shipping prices updated", {
          description: message,
        });
        // Clear cache for the affected auction
        citiesCache.delete(auction);
        console.log(`🧹 Cleared ${auction} cities cache after price adjustment`);
        await loadCities({ forceRefresh: true, auction: currentAuction || undefined });
        // Reload global adjustment to get the updated value
        await loadGlobalAdjustment(auction);
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
        // Ensure cached data is also sorted (in case cache was created before sorting was added)
        const sortedCached = [...cached.data].sort((a, b) => {
          return a.city.localeCompare(b.city, undefined, { sensitivity: 'base' });
        });
        setCities(sortedCached);
        setCurrentAuction(auction);
        return;
      }
    }

    setIsLoadingCities(true);
    try {
      console.log(`🔄 Fetching cities from API for ${auction || 'all'}`);
      const result = await fetchShippings({ auction });
      
      if (result.success && result.cities) {
        // Sort cities alphabetically
        const sortedCities = [...result.cities].sort((a, b) => {
          return a.city.localeCompare(b.city, undefined, { sensitivity: 'base' });
        });
        
        setCities(sortedCities);
        setCurrentAuction(auction || null);
        
        // Cache the sorted result per auction
        if (auction) {
          citiesCache.set(auction, {
            data: sortedCities,
            timestamp: Date.now(),
          });
          console.log(`💾 Cached ${sortedCities.length} cities for ${auction}`);
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
    // Only load users if user is admin
    if (!isAdmin) {
      return;
    }

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

  const updateCoefficient = async ({ userId, coefficient, category, adjustmentAmount }: { userId: string; coefficient: number; category?: Auction; adjustmentAmount?: number }) => {
    try {
      const result = await updateUserCoefficient({ userId, coefficient, category: category as string | undefined });
      
      if (result.success) {
        // If adjustment amount is provided and category is selected, also adjust shipping prices
        if (adjustmentAmount !== undefined && category !== undefined) {
          const adjustResult = await adjustUserShippingPrice({
            userId,
            category,
            adjustmentAmount,
          });
          
          if (!adjustResult.success) {
            toast.error("Failed to adjust shipping prices", {
              description: adjustResult.error || "Could not adjust shipping prices for user.",
            });
            return;
          }
        }
        
        const messages = [];
        if (coefficient !== undefined) messages.push(`coefficient: ${coefficient}`);
        if (category !== undefined) messages.push(`auction: ${category.toUpperCase()}`);
        if (adjustmentAmount !== undefined) messages.push(`price adjustment: ${adjustmentAmount > 0 ? '+' : ''}${adjustmentAmount}`);
        
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

  const loadGlobalAdjustment = async (category?: Auction) => {
    try {
      const result = await fetchGlobalAdjustment(category);
      
      if (result.success && result.data) {
        setGlobalAdjustment(result.data);
      }
    } catch (error) {
      console.error("Error loading global adjustment:", error);
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
    globalAdjustment,
    loadGlobalAdjustment,
  };
};

