import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/auth/token";
import type { IncomeTaxBracket } from "./types";

type UpdateUserIncomeTaxResponse =
  | { success: true; incomeTaxBrackets: IncomeTaxBracket[] }
  | { success: false; error: string };

export const updateUserIncomeTax = async ({
  userId,
  incomeTaxBrackets,
}: {
  userId: string;
  incomeTaxBrackets: IncomeTaxBracket[];
}): Promise<UpdateUserIncomeTaxResponse> => {
  try {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/users/${userId}/income-tax`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incomeTaxBrackets }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `HTTP error! status: ${response.status}`,
      };
    }

    const result = await response.json();
    const brackets = result.incomeTaxBrackets ?? result.data?.incomeTaxBrackets ?? [];

    return { success: true, incomeTaxBrackets: brackets };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
