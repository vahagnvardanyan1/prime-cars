type SafeFetchOptions = {
  url: string;
  init?: RequestInit;
  // If set, a 404 returns { success: false, error: notFoundMessage }
  // instead of being thrown as a generic HTTP error.
  notFoundMessage?: string;
  // Prefix for the console.error on caught errors. Pass undefined to skip logging.
  logPrefix?: string;
};

export type SafeFetchResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export const safeFetchJson = async <T = unknown>(
  opts: SafeFetchOptions,
): Promise<SafeFetchResult<T>> => {
  try {
    const response = await fetch(opts.url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      ...opts.init,
    });

    if (!response.ok) {
      if (response.status === 404 && opts.notFoundMessage !== undefined) {
        return { success: false, error: opts.notFoundMessage };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as T;
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    if (opts.logPrefix) {
      console.error(`${opts.logPrefix}:`, error);
    }
    return { success: false, error: message };
  }
};
