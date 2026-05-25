import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/auth/token";

type AdminApiRequestOpts = {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  json?: unknown;
  formData?: FormData;
  errorFallback: string;
  errorContext: string;
};

export type AdminApiResult<T> =
  | { success: true; data: T | null }
  | { success: false; error: string };

export const adminApiRequest = async <T = unknown>(
  opts: AdminApiRequestOpts,
): Promise<AdminApiResult<T>> => {
  try {
    const init: RequestInit = { method: opts.method ?? "GET" };
    if (opts.formData) {
      init.body = opts.formData;
    } else if (opts.json !== undefined) {
      init.body = JSON.stringify(opts.json);
      init.headers = { "Content-Type": "application/json" };
    }

    const response = await authenticatedFetch(`${API_BASE_URL}${opts.path}`, init);

    if (!response.ok) {
      const errorData = (await response
        .json()
        .catch(() => ({ error: opts.errorFallback }))) as { error?: string; message?: string };
      return {
        success: false,
        error: errorData.error || errorData.message || `Server error: ${response.status}`,
      };
    }

    const text = await response.text();
    const data = text ? (JSON.parse(text) as T) : null;
    return { success: true, data };
  } catch (error) {
    console.error(`Error ${opts.errorContext}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
};
