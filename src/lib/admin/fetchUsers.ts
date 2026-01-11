import type { AdminUser } from "@/lib/admin/types";

import { API_BASE_URL } from "@/i18n/config";

import { authenticatedFetch } from "@/lib/auth/token";

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
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  error?: string;
};

type FetchUsersParams = {
  page?: number;
  limit?: number;
};

export const fetchUsers = async ({ 
  page = 1, 
  limit = 25 
}: FetchUsersParams = {}): Promise<FetchUsersResponse> => {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const response = await authenticatedFetch(
      `${API_BASE_URL}/users/paginated?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to fetch users" }));
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    const responseData = await response.json();
    
    // Response structure: { status, data: { data: [...], meta: {...} } }
    const dataWrapper = responseData?.data;
    const usersArray = dataWrapper?.data || [];
    const meta = dataWrapper?.meta || {};

    // Extract pagination info from meta
    const paginationInfo = {
      total: meta.totalItems || 0,
      page: meta.currentPage || page,
      limit: meta.itemsPerPage || limit,
      totalPages: meta.totalPages || 0,
    };

    const users: AdminUser[] = usersArray.map((client: BackendUser) => ({
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
    }));

    return {
      success: true,
      users,
      ...paginationInfo,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};
