import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { toast } from "sonner";

import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/auth/token";
import type { AdminCar } from "@/lib/admin/types";
import { queryKeys } from "../keys";

type FetchCarsParams = {
  search?: string;
  status?: string;
  userId?: string;
  page?: number;
  limit?: number;
};

type FetchCarsResponse = {
  cars: AdminCar[];
  total: number;
  page: number;
  totalPages: number;
};

type CreateCarData = {
  userId: string;
  model: string;
  year: number;
  priceUsd: number;
  carPaid: boolean;
  shippingPaid: boolean;
  insurance: boolean;
  type: string;
  auction: string;
  purchaseDate: string;
  city?: string;
  lot?: string;
  vin: string;
  customerNotes?: string;
};

type CreateCarParams = {
  data: CreateCarData;
  images?: File[];
  invoiceFile?: File | null;
};

// Fetch cars (admin)
const fetchAdminCars = async (params?: FetchCarsParams): Promise<FetchCarsResponse> => {
  const searchParams = new URLSearchParams();
  
  if (params?.search) searchParams.append("search", params.search);
  if (params?.status) searchParams.append("status", params.status);
  if (params?.userId) searchParams.append("userId", params.userId);
  if (params?.page) searchParams.append("page", String(params.page));
  if (params?.limit) searchParams.append("limit", String(params.limit));

  const url = `${API_BASE_URL}/admin/cars${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  
  const response = await authenticatedFetch(url, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch cars");
  }

  const result = await response.json();
  const cars = Array.isArray(result) ? result : result.data || [];

  return {
    cars: cars.map((car: Record<string, unknown>) => {
      const details = car.details as Record<string, unknown> | undefined;
      return {
        id: car._id || car.id,
        imageUrl: car.imageUrl || car.image || "",
        model: car.model,
        year: car.year,
        priceUsd: car.priceUsd || car.price,
        carPaid: car.carPaid || false,
        shippingPaid: car.shippingPaid || false,
        insurance: car.insurance || false,
        status: car.status,
        client: car.client || car.userId,
        invoiceId: car.invoiceId,
        createdAt: car.createdAt,
        updatedAt: car.updatedAt,
        details: {
          purchaseDate: details?.purchaseDate || car.purchaseDate,
          type: details?.type || car.type,
          auction: details?.auction || car.auction,
          city: details?.city || car.city,
          lot: details?.lot || car.lot,
          vin: details?.vin || car.vin,
          customerNotes: details?.customerNotes || car.customerNotes,
          invoice: details?.invoice || car.invoice,
        },
      };
    }),
    total: result.total || cars.length,
    page: result.page || 1,
    totalPages: result.totalPages || 1,
  };
};

// Create car
const createCar = async ({ data, images, invoiceFile }: CreateCarParams): Promise<AdminCar> => {
  const formData = new FormData();
  
  // Append car data
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  // Append images
  if (images && images.length > 0) {
    images.forEach((image) => {
      formData.append("images", image);
    });
  }

  // Append invoice
  if (invoiceFile) {
    formData.append("invoice", invoiceFile);
  }

  const response = await authenticatedFetch(`${API_BASE_URL}/cars`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to create car" }));
    throw new Error(error.error || error.message || "Failed to create car");
  }

  const result = await response.json();
  const car = result.data || result;
  const carDetails = car.details as Record<string, unknown> | undefined;

  return {
    id: car._id || car.id,
    imageUrl: car.imageUrl || car.image || "",
    model: car.model,
    year: car.year,
    priceUsd: car.priceUsd || car.price,
    carPaid: car.carPaid || false,
    shippingPaid: car.shippingPaid || false,
    insurance: car.insurance || false,
    status: car.status,
    client: car.client || car.userId,
    invoiceId: car.invoiceId,
    createdAt: car.createdAt,
    updatedAt: car.updatedAt,
    details: {
      purchaseDate: carDetails?.purchaseDate || car.purchaseDate,
      type: carDetails?.type || car.type,
      auction: carDetails?.auction || car.auction,
      city: carDetails?.city || car.city,
      lot: carDetails?.lot || car.lot,
      vin: carDetails?.vin || car.vin,
      customerNotes: carDetails?.customerNotes || car.customerNotes,
      invoice: carDetails?.invoice || car.invoice,
    },
  };
};

// Update car
const updateCar = async ({ id, data }: { id: string; data: Partial<CreateCarData> }): Promise<AdminCar> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/cars/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to update car" }));
    throw new Error(error.error || error.message || "Failed to update car");
  }

  const result = await response.json();
  const car = result.data || result;
  const carDetails = car.details as Record<string, unknown> | undefined;

  return {
    id: car._id || car.id,
    imageUrl: car.imageUrl || car.image || "",
    model: car.model,
    year: car.year,
    priceUsd: car.priceUsd || car.price,
    carPaid: car.carPaid || false,
    shippingPaid: car.shippingPaid || false,
    insurance: car.insurance || false,
    status: car.status,
    client: car.client || car.userId,
    invoiceId: car.invoiceId,
    createdAt: car.createdAt,
    updatedAt: car.updatedAt,
    details: {
      purchaseDate: carDetails?.purchaseDate || car.purchaseDate,
      type: carDetails?.type || car.type,
      auction: carDetails?.auction || car.auction,
      city: carDetails?.city || car.city,
      lot: carDetails?.lot || car.lot,
      vin: carDetails?.vin || car.vin,
      customerNotes: carDetails?.customerNotes || car.customerNotes,
      invoice: carDetails?.invoice || car.invoice,
    },
  };
};

// Delete car
const deleteCar = async (id: string): Promise<void> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/cars/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to delete car" }));
    throw new Error(error.error || error.message || "Failed to delete car");
  }
};

// Hooks

export const useAdminCars = (params?: FetchCarsParams, options?: Omit<UseQueryOptions<FetchCarsResponse>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: queryKeys.cars.admin.list(params),
    queryFn: () => fetchAdminCars(params),
    staleTime: 1000 * 60, // 1 minute
    ...options,
  });
};

export const useCreateCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.all });
      toast.success("Car created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create car", {
        description: error.message,
      });
    },
  });
};

export const useUpdateCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCar,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.detail(data.id) });
      toast.success("Car updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update car", {
        description: error.message,
      });
    },
  });
};

export const useDeleteCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.all });
      toast.success("Car deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete car", {
        description: error.message,
      });
    },
  });
};
