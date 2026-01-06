import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/auth/token";

type UpdateUserData = {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  phone?: string;
  passport?: string;
  country?: string;
  companyName?: string;
  password?: string;
};

type UpdateUserResponse = {
  success: boolean;
  error?: string;
};

export const updateUser = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateUserData;
}): Promise<UpdateUserResponse> => {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to update user" }));
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};

