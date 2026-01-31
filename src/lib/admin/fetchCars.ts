import type { AdminCar } from "@/lib/admin/types";

import { API_BASE_URL } from "@/i18n/config";

import { authenticatedFetch } from "@/lib/auth/token";

type BackendCar = {
  _id?: string;
  id?: string;
  model?: string;
  vehicleModel?: string;
  year?: number;
  price?: number;
  priceUsd?: number;
  autoPrice?: number;
  status?: string;
  imageUrl?: string;
  vehiclePhotos?: string[];
  client?: { username: string; firstName: string; lastName: string } | string;
  type?: string;
  auction?: string;
  city?: string;
  lot?: string;
  vin?: string;
  purchaseDate?: string;
  customerNotes?: string;
  containerNumberBooking?: string;
  promisedPickUpDate?: string;
  deliveredWarehouse?: string;
  invoiceId?: string;
  paid?: boolean;
  shippingPaid?: boolean;
  insurance?: boolean;
  vehiclePdf?: string;
  insurancePdf?: string;
  shippingPdf?: string;
  createdAt?: string;
  updatedAt?: string;
};

type FetchCarsResponse = {
  success: boolean;
  cars?: AdminCar[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  error?: string;
};

type FetchCarsParams = {
  page?: number;
  limit?: number;
};

export const fetchCars = async ({ 
  page = 1, 
  limit = 25 
}: FetchCarsParams = {}): Promise<FetchCarsResponse> => {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const response = await authenticatedFetch(
      `${API_BASE_URL}/vehicles/paginated?${params.toString()}`, 
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to fetch cars" }));
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    const responseData = await response.json();
    
    // Response structure: { status, data: { data: [...], meta: {...} } }
    const dataWrapper = responseData?.data;
    const carsArray = dataWrapper?.data || [];
    const meta = dataWrapper?.meta || {};

    // Extract pagination info from meta
    const paginationInfo = {
      total: meta.totalItems || 0,
      page: meta.currentPage || page,
      limit: meta.itemsPerPage || limit,
      totalPages: meta.totalPages || 0,
    };

    // Transform backend data to AdminCar format
    const cars: AdminCar[] = carsArray.map((car: BackendCar) => {
      // Extract client name - handle both populated object and string ID
      let clientDisplay = "-";
      if (car.client && typeof car.client === "object") {
        const firstName = car.client.firstName || "";
        const lastName = car.client.lastName || "";
        clientDisplay = `${firstName} ${lastName}`.trim() || car.client.username || "-";
      }

      return {
        id: car._id || car.id || "",
        imageUrl: car.vehiclePhotos?.[0] || car.imageUrl || "",
        photos: car.vehiclePhotos && car.vehiclePhotos.length > 0 ? car.vehiclePhotos : undefined,
        model: car.vehicleModel || car.model || "",
        year: car.year || new Date().getFullYear(),
        priceUsd: car.autoPrice || car.priceUsd || car.price || 0,
        carPaid: car.paid || false,
        shippingPaid: car.shippingPaid || false,
        insurance: car.insurance || false,
        status: (car.status as AdminCar["status"]) || "Active",
        client: clientDisplay,
        invoiceId: car.invoiceId,
        createdAt: car.createdAt,
        updatedAt: car.updatedAt,
        details: {
          purchaseDate: car.purchaseDate,
          type: car.type,
          auction: car.auction,
          city: car.city,
          lot: car.lot,
          vin: car.vin,
          customerNotes: car.customerNotes,
          containerNumberBooking: car.containerNumberBooking,
          promisedPickUpDate: car.promisedPickUpDate,
          deliveredWarehouse: car.deliveredWarehouse,
          vehiclePdf: car.vehiclePdf || "",
          insurancePdf: car.insurancePdf || "",
          shippingPdf: car.shippingPdf || "",
        },
      };
    }) || [];

    return {
      success: true,
      cars,
      ...paginationInfo,
    };
  } catch (error) {
    console.error("Error fetching cars:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};

