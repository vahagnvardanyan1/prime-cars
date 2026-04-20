import { z } from "zod";

// Constants to avoid hydration issues
const CURRENT_YEAR = 2026;
const MAX_YEAR = CURRENT_YEAR + 1;

// ============================================
// Authentication Schemas
// ============================================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ============================================
// User Management Schemas
// ============================================

export const createUserSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  login: z
    .string()
    .min(1, "Login is required")
    .min(3, "Login must be at least 3 characters")
    .max(30, "Login must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Login can only contain letters, numbers, underscores, and hyphens"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
  phone: z
    .string()
    .optional()
    .or(z.literal("")),
  country: z
    .string()
    .optional()
    .or(z.literal("")),
  companyName: z
    .string()
    .optional()
    .or(z.literal("")),
  passportNumber: z
    .string()
    .optional()
    .or(z.literal("")),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .optional(),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .optional(),
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .optional()
    .or(z.literal("")),
  country: z
    .string()
    .optional()
    .or(z.literal("")),
  companyName: z
    .string()
    .optional()
    .or(z.literal("")),
  passportNumber: z
    .string()
    .optional()
    .or(z.literal("")),
  coefficient: z
    .number()
    .min(0, "Coefficient must be positive")
    .optional(),
});

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

// ============================================
// Car Management Schemas
// ============================================

export const carDetailsSchema = z.object({
  purchaseDate: z
    .string()
    .min(1, "Purchase date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  type: z
    .string()
    .min(1, "Vehicle type is required"),
  auction: z
    .string()
    .min(1, "Auction is required"),
  city: z
    .string()
    .optional()
    .or(z.literal("")),
  lot: z
    .string()
    .optional()
    .or(z.literal("")),
  vin: z
    .string()
    .min(1, "VIN is required")
    .min(17, "VIN must be at least 17 characters")
    .max(17, "VIN must be exactly 17 characters")
    .regex(/^[A-HJ-NPR-Z0-9]{17}$/, "Invalid VIN format"),
  customerNotes: z
    .string()
    .optional()
    .or(z.literal("")),
});

export const createCarSchema = z.object({
  userId: z
    .string()
    .min(1, "User selection is required"),
  model: z
    .string()
    .min(1, "Model is required"),
  year: z
    .number()
    .min(1900, "Year must be after 1900")
    .max(MAX_YEAR, `Year cannot be after ${MAX_YEAR}`),
  priceUsd: z
    .number()
    .positive("Price must be greater than 0")
    .min(1, "Price is required"),
  carPaid: z.boolean().default(false),
  shippingPaid: z.boolean().default(false),
  insurance: z.boolean().default(false),
  purchaseDate: z
    .string()
    .min(1, "Purchase date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  type: z
    .string()
    .min(1, "Vehicle type is required"),
  auction: z
    .string()
    .min(1, "Auction is required"),
  city: z
    .string()
    .optional()
    .or(z.literal("")),
  lot: z
    .string()
    .optional()
    .or(z.literal("")),
  vin: z
    .string()
    .min(1, "VIN is required")
    .min(17, "VIN must be at least 17 characters")
    .max(17, "VIN must be exactly 17 characters"),
  customerNotes: z
    .string()
    .optional()
    .or(z.literal("")),
  containerNumberBooking: z
    .string()
    .optional()
    .or(z.literal("")),
  promisedPickUpDate: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), "Invalid date format (YYYY-MM-DD)"),
  deliveredWarehouse: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), "Invalid date format (YYYY-MM-DD)"),
});

export type CreateCarFormValues = z.infer<typeof createCarSchema>;

export const updateCarSchema = createCarSchema.partial().omit({ userId: true });

export type UpdateCarFormValues = z.infer<typeof updateCarSchema>;

// ============================================
// Notification Schemas
// ============================================

export const createNotificationSchema = z.object({
  message: z
    .string()
    .min(1, "Message is required")
    .min(5, "Message must be at least 5 characters")
    .max(200, "Message must be less than 200 characters"),
  description: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform(val => val || undefined),
  reason: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform(val => val || undefined),
  userId: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform(val => val || undefined),
});

export type CreateNotificationFormValues = z.infer<typeof createNotificationSchema>;

// ============================================
// Shipping Management Schemas
// ============================================

export const createShippingSchema = z.object({
  city: z
    .string()
    .min(1, "City is required")
    .min(2, "City must be at least 2 characters")
    .max(100, "City must be less than 100 characters"),
  shippingUsd: z
    .number()
    .positive("Shipping price must be greater than 0")
    .min(1, "Shipping price is required"),
  auction: z
    .string()
    .optional()
    .or(z.literal("")),
});

export type CreateShippingFormValues = z.infer<typeof createShippingSchema>;

export const updateShippingSchema = createShippingSchema.partial();

export type UpdateShippingFormValues = z.infer<typeof updateShippingSchema>;

export const increaseShippingPricesSchema = z.object({
  percentage: z
    .number()
    .min(-100, "Percentage cannot be less than -100%")
    .max(1000, "Percentage cannot be more than 1000%"),
});

export type IncreaseShippingPricesFormValues = z.infer<typeof increaseShippingPricesSchema>;

// ============================================
// Calculator Schema
// ============================================

export const calculatorSchema = z.object({
  vehicleType: z.string().min(1, "Vehicle type is required"),
  vehiclePrice: z
    .number()
    .positive("Vehicle price must be greater than 0")
    .min(1, "Vehicle price is required"),
  auction: z.string().min(1, "Auction is required"),
  city: z.string().min(1, "City is required"),
  year: z
    .number()
    .min(1900, "Year must be after 1900")
    .max(MAX_YEAR, `Year cannot be after ${MAX_YEAR}`),
  engineVolume: z
    .number()
    .positive("Engine volume must be greater than 0")
    .optional(),
});

export type CalculatorFormValues = z.infer<typeof calculatorSchema>;
