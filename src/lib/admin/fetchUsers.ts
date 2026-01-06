import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/auth/token";
import type { AdminUser } from "@/lib/admin/types";

type BackendUser = {
  id?: string;
  _id?: string;
  customerId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  phone?: string;
  passport?: string;
  location?: string;
  country?: string;
  companyName?: string;
  companyCountry?: string;
  role?: string;
};

type FetchUsersResponse = {
  success: boolean;
  users?: AdminUser[];
  error?: string;
};

export const fetchUsers = async (): Promise<FetchUsersResponse> => {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to fetch users" }));
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    const result = await response.json();

    const users: AdminUser[] = result?.map((client: BackendUser) => ({
      id: client.id || client._id || "",
      customerId: client.customerId || "",
      firstName: client.firstName || "",
      lastName: client.lastName || "",
      username: client.username || "",
      email: client.email || "",
      passport: client.passport || "",
      phone: client.phone || "",
      location: client.location || "",
      country: client.country || client.companyCountry || "",
      companyName: client.companyName || "",
      role: (client.role as AdminUser["role"]) || "Viewer",
    })) || [];

    return {
      success: true,
      users,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};

