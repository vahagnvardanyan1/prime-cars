import { API_BASE_URL } from "@/i18n/config";

import { authenticatedFetch, removeTokens } from "@/lib/auth/token";

type LogoutResponse = {
  success: boolean;
  error?: string;
};

export const logout = async (): Promise<LogoutResponse> => {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: "Logout failed",
      }));
      
      removeTokens();
      
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    removeTokens();

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error during logout:", error);
    
    removeTokens();
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};
