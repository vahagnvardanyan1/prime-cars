// Query key factory for consistent and type-safe query keys
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  shipping: {
    prices: (auction?: string) => ["shipping", "prices", auction] as const,
  },
} as const;
