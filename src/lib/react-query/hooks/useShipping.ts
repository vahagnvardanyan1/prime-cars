import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { CACHE_STALE_TIME, CACHE_GC_TIME } from "@/lib/react-query/client";
import type { ShippingCity, Auction } from "@/lib/admin/types";
import { fetchShippings } from "@/lib/admin/fetchShippings";
import { queryKeys } from "../keys";

// Hook for fetching shipping prices by auction category (for modals)
export const useShippingPrices = (
  auction?: Auction,
  options?: Omit<UseQueryOptions<ShippingCity[], Error>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: queryKeys.shipping.prices(auction),
    queryFn: async () => {
      const result = await fetchShippings({ auction });
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch shipping cities");
      }
      return result.cities || [];
    },
    staleTime: CACHE_STALE_TIME,
    gcTime: CACHE_GC_TIME,
    enabled: !!auction,
    ...options,
  });
};
