import { z } from "zod";
import type { CarCategory } from "@/lib/cars/types";
import { EngineType } from "@/lib/admin/types";

// Constants to avoid hydration issues
const CURRENT_YEAR = 2026;
const MAX_YEAR = CURRENT_YEAR + 2;

// Base schema for available car form
export const availableCarSchema = z.object({
  carModel: z
    .string({ message: "Car model is required" })
    .min(1, "Car model is required")
    .min(2, "Car model must be at least 2 characters")
    .max(100, "Car model must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s-]+$/, "Car model can only contain letters, numbers, spaces, and hyphens"),
  
  carYear: z
    .number({ message: "Year must be a number" })
    .int("Year must be a whole number")
    .min(1900, "Year must be 1900 or later")
    .max(MAX_YEAR, `Year cannot be more than ${MAX_YEAR}`),
  
  carVin: z
    .string({ message: "VIN is required" })
    .min(1, "VIN is required")
    .length(17, "VIN must be exactly 17 characters")
    .regex(/^[A-HJ-NPR-Z0-9]+$/i, "VIN contains invalid characters (I, O, Q not allowed)")
    .transform((val) => val.toUpperCase()),
  
  carPrice: z
    .number({ message: "Price must be a number" })
    .positive("Price must be greater than 0")
    .max(10000000, "Price seems unrealistic"),
  
  carCategory: z.enum(["AVAILABLE", "ONROAD", "TRANSIT"], {
    message: "Invalid category",
  }),
  
  carDescription: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
  
  engineType: z.enum(
    [EngineType.GASOLINE, EngineType.DIESEL, EngineType.ELECTRIC, EngineType.HYBRID],
    {
      message: "Engine type is required",
    }
  ),
  
  engineHp: z
    .number()
    .int("Horsepower must be a whole number")
    .min(0, "Horsepower cannot be negative")
    .max(2000, "Horsepower seems unrealistic")
    .catch(0),
  
  engineSize: z
    .number()
    .min(0, "Engine size cannot be negative")
    .max(20, "Engine size seems unrealistic")
    .catch(0),
  
  boughtPlace: z
    .string()
    .max(200, "Location must be less than 200 characters")
    .optional()
    .or(z.literal("")),
  
  transmission: z
    .string()
    .max(50, "Transmission must be less than 50 characters")
    .optional()
    .or(z.literal("")),
});

// Schema for updating available car (all fields optional except ID)
export const updateAvailableCarSchema = z.object({
  carModel: z
    .string()
    .min(2, "Car model must be at least 2 characters")
    .max(100, "Car model must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s-]+$/, "Car model can only contain letters, numbers, spaces, and hyphens")
    .optional(),
  
  carYear: z
    .number({ message: "Year must be a number" })
    .int("Year must be a whole number")
    .min(1900, "Year must be 1900 or later")
    .max(MAX_YEAR, `Year cannot be more than ${MAX_YEAR}`)
    .optional(),
  
  carVin: z
    .string()
    .length(17, "VIN must be exactly 17 characters")
    .regex(/^[A-HJ-NPR-Z0-9]+$/i, "VIN contains invalid characters (I, O, Q not allowed)")
    .transform((val) => val.toUpperCase())
    .optional(),
  
  carPrice: z
    .number({ message: "Price must be a number" })
    .positive("Price must be greater than 0")
    .max(10000000, "Price seems unrealistic")
    .optional(),
  
  carCategory: z.enum(["AVAILABLE", "ONROAD", "TRANSIT"])
    .optional(),
  
  carDescription: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
  
  engineType: z
    .enum([EngineType.GASOLINE, EngineType.DIESEL, EngineType.ELECTRIC, EngineType.HYBRID])
    .optional()
    .or(z.literal("")),
  
  engineHp: z
    .union([
      z.number().int("Horsepower must be a whole number").min(0, "Horsepower cannot be negative").max(2000, "Horsepower seems unrealistic"),
      z.literal(0),
      z.nan().transform(() => 0),
    ])
    .optional()
    .default(0),
  
  engineSize: z
    .union([
      z.number().min(0, "Engine size cannot be negative").max(20, "Engine size seems unrealistic"),
      z.literal(0),
      z.nan().transform(() => 0),
    ])
    .optional()
    .default(0),
  
  boughtPlace: z
    .string()
    .max(200, "Location must be less than 200 characters")
    .optional()
    .or(z.literal("")),
  
  transmission: z
    .string()
    .max(50, "Transmission must be less than 50 characters")
    .optional()
    .or(z.literal("")),
});

// Photo validation schema
export const photoValidationSchema = z.object({
  photos: z
    .array(z.instanceof(File))
    .max(25, "Maximum 25 photos allowed")
    .optional(),
  photosToDelete: z
    .array(z.string().url("Invalid photo URL"))
    .optional(),
});

// Type exports
export type AvailableCarFormData = z.infer<typeof availableCarSchema>;
export type UpdateAvailableCarFormData = z.infer<typeof updateAvailableCarSchema>;
export type PhotoValidationData = z.infer<typeof photoValidationSchema>;
