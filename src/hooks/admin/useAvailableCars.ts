import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { CACHE_STALE_TIME, CACHE_GC_TIME } from "@/lib/react-query/client";
import type { Car, CarCategory } from "@/lib/cars/types";
import { fetchCarsByCategory, fetchAllAvailableCars, fetchAvailableCarsPaginated } from "@/lib/cars/fetchCars";
import { createAvailableCar } from "@/lib/admin/createAvailableCar";
import { updateAvailableCar } from "@/lib/admin/updateAvailableCar";
import { deleteAvailableCar } from "@/lib/admin/deleteAvailableCar";
import type { AvailableCarFormData, UpdateAvailableCarFormData } from "@/lib/admin/schemas/availableCar.schema";

// Query keys
export const availableCarsKeys = {
  all: ["availableCars"] as const,
  lists: () => [...availableCarsKeys.all, "list"] as const,
  list: (category?: CarCategory, page?: number, limit?: number, search?: string) => {
    // Normalize search: treat "" and undefined the same to avoid cache misses
    const normalizedSearch = search?.trim() || undefined;
    return category
      ? [...availableCarsKeys.lists(), category, page, limit, normalizedSearch] as const
      : [...availableCarsKeys.lists(), "all", page, limit, normalizedSearch] as const;
  },
  details: () => [...availableCarsKeys.all, "detail"] as const,
  detail: (id: string) => [...availableCarsKeys.details(), id] as const,
};

// Fetch paginated available cars
export const useAvailableCars = ({
  page = 1,
  limit = 25,
  search,
  carCategory,
}: {
  page?: number;
  limit?: number;
  search?: string;
  carCategory?: CarCategory;
} = {}) => {
  // Normalize empty search to undefined so query keys stay consistent across mounts
  const normalizedSearch = search?.trim() || undefined;

  return useQuery({
    queryKey: availableCarsKeys.list(carCategory, page, limit, normalizedSearch),
    queryFn: async () => {
      const response = await fetchAvailableCarsPaginated({ page, limit, search: normalizedSearch, carCategory });
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch available cars");
      }
      return {
        cars: response.cars || [],
        total: response.total || 0,
        totalPages: response.totalPages || 0,
        currentPage: response.page || page,
        pageSize: response.limit || limit,
      };
    },
    staleTime: CACHE_STALE_TIME,
    gcTime: CACHE_GC_TIME,
  });
};

// Fetch all available cars (non-paginated, for backward compatibility)
export const useAllAvailableCars = () => {
  return useQuery({
    queryKey: ["availableCars", "all"],
    queryFn: async () => {
      const response = await fetchAllAvailableCars();
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch available cars");
      }
      return response.cars;
    },
    staleTime: CACHE_STALE_TIME,
    gcTime: CACHE_GC_TIME,
  });
};

// Fetch cars by category
export const useAvailableCarsByCategory = (category: CarCategory) => {
  return useQuery({
    queryKey: availableCarsKeys.list(category),
    queryFn: async () => {
      const response = await fetchCarsByCategory({ category });
      if (!response.success) {
        throw new Error(response.error || `Failed to fetch ${category} cars`);
      }
      return response.cars;
    },
    staleTime: CACHE_STALE_TIME,
    gcTime: CACHE_GC_TIME,
  });
};

// Create available car mutation
export const useCreateAvailableCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      photos,
    }: {
      data: AvailableCarFormData;
      photos?: File[];
    }) => {
      const response = await createAvailableCar({ data, photos });
      if (!response.success) {
        throw new Error(response.error || "Failed to create car");
      }
      return response.car;
    },
    onSuccess: (data) => {
      // Invalidate all car queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: availableCarsKeys.lists() });
      
      // Optionally, add the new car to the cache optimistically
      if (data) {
        queryClient.setQueryData<Car[]>(
          availableCarsKeys.list(data.category),
          (old) => (old ? [...old, data as unknown as Car] : [data as unknown as Car])
        );
      }
    },
    onError: (error: Error) => {
      console.error("Error creating car:", error);
    },
  });
};

// Update available car mutation
export const useUpdateAvailableCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
      existingPhotos,
      newPhotos,
      photosToDelete,
    }: {
      id: string;
      data: UpdateAvailableCarFormData;
      existingPhotos?: string[];
      newPhotos?: File[];
      photosToDelete?: string[];
    }) => {
      const response = await updateAvailableCar({
        id,
        data,
        existingPhotos,
        newPhotos,
        photosToDelete,
      });
      if (!response.success) {
        throw new Error(response.error || "Failed to update car");
      }
      return { id, data };
    },
    onSuccess: (variables) => {
      // Invalidate all car queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: availableCarsKeys.lists() });
      
      // Invalidate specific car detail if we had one
      queryClient.invalidateQueries({ 
        queryKey: availableCarsKeys.detail(variables.id) 
      });
    },
    onError: (error: Error) => {
      console.error("Error updating car:", error);
    },
  });
};

// Delete available car mutation
export const useDeleteAvailableCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await deleteAvailableCar({ id });
      if (!response.success) {
        throw new Error(response.error || "Failed to delete car");
      }
      return id;
    },
    onSuccess: (deletedId) => {
      // Invalidate all car queries
      queryClient.invalidateQueries({ queryKey: availableCarsKeys.lists() });
      
      // Remove from cache optimistically for all categories
      const categories: CarCategory[] = ["AVAILABLE", "ONROAD", "TRANSIT"];
      categories.forEach((category) => {
        queryClient.setQueryData<Car[]>(
          availableCarsKeys.list(category),
          (old) => old?.filter((car) => car.id !== deletedId)
        );
      });
      
      // Also remove from "all" list
      queryClient.setQueryData<Car[]>(
        availableCarsKeys.list(),
        (old) => old?.filter((car) => car.id !== deletedId)
      );
    },
    onError: (error: Error) => {
      console.error("Error deleting car:", error);
    },
  });
};
