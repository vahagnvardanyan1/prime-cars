import { QueryClient } from "@tanstack/react-query";

// Cache duration constants — change these to adjust all query cache times in one place
export const CACHE_STALE_TIME = 1000 * 60 * 15; // 15 minutes
export const CACHE_GC_TIME = 1000 * 60 * 30; // 30 minutes

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_STALE_TIME,
      gcTime: CACHE_GC_TIME,
      retry: (failureCount, error) => {
        // Don't retry on 401, 403, 404
        if (error instanceof Error) {
          const status = (error as { status?: number }).status;
          if (status && [401, 403, 404].includes(status)) {
            return false;
          }
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});
