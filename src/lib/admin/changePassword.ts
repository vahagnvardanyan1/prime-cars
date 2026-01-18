import { API_BASE_URL } from "@/i18n/config";

import { authenticatedFetch } from "@/lib/auth/token";

type ChangePasswordData = {
  username: string;
  newPassword: string;
};

type ChangePasswordResponse = {
  success: boolean;
  error?: string;
};

export const changePassword = async ({
  username,
  newPassword,
}: ChangePasswordData): Promise<ChangePasswordResponse> => {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/auth/forgot-password-change`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        newPassword,
      }),
    });

    if (!response.ok) {
      // Try to extract error message from response
      const errorData = await response.json().catch(() => ({}));
      
      // Try to get a meaningful message
      let errorMessage = "Unable to change password. Please try again later.";
      
      if (errorData.message && typeof errorData.message === "string") {
        errorMessage = errorData.message;
      } else if (errorData.error && typeof errorData.error === "string") {
        errorMessage = errorData.error;
      } else if (errorData.msg && typeof errorData.msg === "string") {
        errorMessage = errorData.msg;
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error changing password:", error);
    return {
      success: false,
      error: "Unable to change password. Please try again later.",
    };
  }
};
