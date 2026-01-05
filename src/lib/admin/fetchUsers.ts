import { API_BASE_URL } from "@/i18n/config";
import { getAccessToken } from "@/lib/auth/token";
import type { AdminUser } from "@/lib/admin/types";

type FetchUsersResponse = {
  success: boolean;
  users?: AdminUser[];
  error?: string;
};

export const fetchUsers = async (): Promise<FetchUsersResponse> => {
  try {
    const token = getAccessToken();

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
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

    const users: AdminUser[] = result?.map((client: any) => ({
      id: client.id || client._id,
      customerId: client.customerId || "",
      firstName: client.firstName || "",
      lastName: client.lastName || "",
      userName: client.userName || "",
      email: client.email || "",
      passport: client.passport || "",
      phone: client.phone || "",
      location: client.location || "",
      country: client.country || "",
      companyName: client.companyName || "",
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

