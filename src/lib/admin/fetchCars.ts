import { API_BASE_URL } from "@/i18n/config";
import { getAccessToken } from "@/lib/auth/token";
import type { AdminCar } from "@/lib/admin/types";

type FetchCarsResponse = {
  success: boolean;
  cars?: AdminCar[];
  error?: string;
};

export const fetchCars = async (): Promise<FetchCarsResponse> => {
  try {
    const token = getAccessToken();

    const response = await fetch(`${API_BASE_URL}/vehicles`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to fetch cars" }));
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    const result = await response.json();

    // Transform backend data to AdminCar format
    const cars: AdminCar[] = result?.map((car: any) => {
      // Extract client name - handle both populated object and string ID
      let clientDisplay = "-";
      if (car.client) {
        const firstName = car.client.firstName || "";
        const lastName = car.client.lastName || "";
        clientDisplay = `${firstName} ${lastName}`.trim() || car.client.email || "-";
      }

      return {
        id: car._id || car.id,
        imageUrl: car.images?.[0] || car.imageUrl || "",
        model: car.vehicleModel || car.model || "",
        year: car.year || new Date().getFullYear(),
        priceUsd: car.autoPrice || car.priceUsd || car.price || 0,
        status: car.status || "Active",
        client: clientDisplay,
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
        },
      };
    }) || [];

    return {
      success: true,
      cars,
    };
  } catch (error) {
    console.error("Error fetching cars:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};

