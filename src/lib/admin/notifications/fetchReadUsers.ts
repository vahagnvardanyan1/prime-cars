import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/auth/token";

export type ReadUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName?: string;
  readAt: string;
};

type FetchReadUsersParams = {
  notificationId: number | string;
};

type FetchReadUsersResponse = {
  success: boolean;
  data?: ReadUser[];
  error?: string;
};

type ApiReadUser = {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    customerId?: string;
    username?: string;
    companyName?: string;
  };
  readedTime: string;
};

type ApiResponse = {
  data: {
  notification: unknown;
  users: ApiReadUser[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}
};

export const fetchReadUsers = async ({
  notificationId,
}: FetchReadUsersParams): Promise<FetchReadUsersResponse> => {
  try {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/notifications/admin/${notificationId}/read-users`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP error! status: ${response.status}`,
      };
    }

    const apiData: ApiResponse = await response.json();
    
    // Transform API response to match ReadUser type
    const transformedUsers: ReadUser[] = apiData.data.users.map((item) => ({
      id: item.user.id,
      firstName: item.user.firstName,
      lastName: item.user.lastName,
      email: item.user.email,
      companyName: item.user.companyName,
      readAt: item.readedTime, // Map readedTime to readAt
    }));

    return {
      success: true,
      data: transformedUsers,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch read users",
    };
  }
};
