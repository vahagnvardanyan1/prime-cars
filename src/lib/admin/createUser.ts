import type { CreateUserData, CreateUserResponse } from "@/lib/admin/types";
import { authenticatedFetch } from "../auth/token";
import { API_BASE_URL } from "@/i18n/config";

export const createUser = async ({
  data,
}: {
  data: CreateUserData;
}): Promise<CreateUserResponse> => {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/auth/register-client`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.login,
        email: data.email || "",
        password: data.password,
        phone: data.phone || "",
        country: data.country || "",
        passport: data.passportNumber || "",
        companyName: data.companyName || "",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to create user" }));
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`,
      };
    }

    const result = await response.json();
    
    return {
      success: true,
      user: result.user,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};

