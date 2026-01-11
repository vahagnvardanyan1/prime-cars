import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/auth/token";
import type { ShippingCity } from "@/lib/admin/types";
import { queryKeys } from "../keys";

type FetchShippingParams = {
  auction?: string;
  search?: string;
};

type CreateShippingData = {
  city: string;
  shippingUsd: number;
  auction?: string;
};

// Fetch shipping cities
const fetchShipping = async (params?: FetchShippingParams): Promise<ShippingCity[]> => {
  const searchParams = new URLSearchParams();
  
  if (params?.auction) searchParams.append("auction", params.auction);
  if (params?.search) searchParams.append("search", params.search);

  const url = `${API_BASE_URL}/shipping${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  
  const response = await authenticatedFetch(url, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch shipping data");
  }

  const result = await response.json();
  const shipping = Array.isArray(result) ? result : result.data || [];

  return shipping.map((item: any) => ({
    id: item._id || item.id,
    city: item.city,
    shippingUsd: item.shippingUsd || item.price,
    auction: item.auction,
  }));
};

// Create shipping city
const createShipping = async (data: CreateShippingData): Promise<ShippingCity> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/shipping`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to create shipping" }));
    throw new Error(error.error || error.message || "Failed to create shipping");
  }

  const result = await response.json();
  const item = result.data || result;

  return {
    id: item._id || item.id,
    city: item.city,
    shippingUsd: item.shippingUsd || item.price,
    auction: item.auction,
  };
};

// Update shipping city
const updateShipping = async ({ id, data }: { id: string; data: Partial<CreateShippingData> }): Promise<ShippingCity> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/shipping/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to update shipping" }));
    throw new Error(error.error || error.message || "Failed to update shipping");
  }

  const result = await response.json();
  const item = result.data || result;

  return {
    id: item._id || item.id,
    city: item.city,
    shippingUsd: item.shippingUsd || item.price,
    auction: item.auction,
  };
};

// Delete shipping city
const deleteShipping = async (id: string): Promise<void> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/shipping/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to delete shipping" }));
    throw new Error(error.error || error.message || "Failed to delete shipping");
  }
};

// Increase shipping prices
const increaseShippingPrices = async (percentage: number): Promise<void> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/shipping/increase`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ percentage }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to increase prices" }));
    throw new Error(error.error || error.message || "Failed to increase prices");
  }
};

// Hooks

export const useShipping = (params?: FetchShippingParams) => {
  return useQuery({
    queryKey: queryKeys.shipping.list(params),
    queryFn: () => fetchShipping(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateShipping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createShipping,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipping.all });
      toast.success("Shipping city created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create shipping city", {
        description: error.message,
      });
    },
  });
};

export const useUpdateShipping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateShipping,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipping.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.shipping.detail(data.id) });
      toast.success("Shipping city updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update shipping city", {
        description: error.message,
      });
    },
  });
};

export const useDeleteShipping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteShipping,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipping.all });
      toast.success("Shipping city deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete shipping city", {
        description: error.message,
      });
    },
  });
};

export const useIncreaseShippingPrices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: increaseShippingPrices,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipping.all });
      toast.success("Shipping prices updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update shipping prices", {
        description: error.message,
      });
    },
  });
};
