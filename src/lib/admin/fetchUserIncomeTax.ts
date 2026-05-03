import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/auth/token";
import type { IncomeTaxBracket } from "./types";

type FetchUserIncomeTaxResponse =
  | { success: true; incomeTaxBrackets: IncomeTaxBracket[] }
  | { success: false; error: string };

export const fetchUserIncomeTax = async ({
  userId,
}: {
  userId: string;
}): Promise<FetchUserIncomeTaxResponse> => {
  try {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/users/${userId}/income-tax`,
      { method: "GET" }
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
