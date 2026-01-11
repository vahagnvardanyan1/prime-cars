// Query key factory for consistent and type-safe query keys
export const queryKeys = {
  // Auth
  auth: {
    me: ["auth", "me"] as const,
  },
  
  // Users
  users: {
    all: ["users"] as const,
    list: (filters?: Record<string, unknown>) => ["users", "list", filters] as const,
    detail: (id: string) => ["users", "detail", id] as const,
  },
  
  // Cars
  cars: {
    all: ["cars"] as const,
    list: (filters?: Record<string, unknown>) => ["cars", "list", filters] as const,
    detail: (id: string) => ["cars", "detail", id] as const,
    admin: {
      all: ["cars", "admin"] as const,
      list: (filters?: Record<string, unknown>) => ["cars", "admin", "list", filters] as const,
      detail: (id: string) => ["cars", "admin", "detail", id] as const,
    },
  },
  
  // Notifications
  notifications: {
    all: ["notifications"] as const,
    list: (filters?: Record<string, unknown>) => ["notifications", "list", filters] as const,
    detail: (id: string) => ["notifications", "detail", id] as const,
    unread: ["notifications", "unread"] as const,
  },
  
  // Shipping
  shipping: {
    all: ["shipping"] as const,
    list: (filters?: Record<string, unknown>) => ["shipping", "list", filters] as const,
    detail: (id: string) => ["shipping", "detail", id] as const,
  },
  
  // Calculator
  calculator: {
    results: (params: Record<string, unknown>) => ["calculator", "results", params] as const,
  },
} as const;
