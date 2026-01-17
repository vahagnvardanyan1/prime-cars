import { API_BASE_URL } from "@/i18n/config";

import { authenticatedFetch } from "@/lib/auth/token";

type ChangePasswordData = {
  currentPassword: string;
  newPassword: string;
};

type ChangePasswordResponse = {
  success: boolean;
  error?: string;
};

export const changePassword = async ({
  currentPassword,
  newPassword,
}: ChangePasswordData): Promise<ChangePasswordResponse> => {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || "Failed to change password",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error changing password:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};
