/**
 * Shared type definitions for the application
 * Using const assertions for type-safe string literals
 */

// Sort options for car listings
export const SORT_OPTIONS = ["price-asc", "price-desc", "year-newest", "year-oldest"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

// View modes for car listings
export const VIEW_MODES = ["grid", "list"] as const;
export type ViewMode = (typeof VIEW_MODES)[number];

// Car categories
export const CAR_CATEGORIES = ["AVAILABLE", "ONROAD", "TRANSIT"] as const;
export type CarCategory = (typeof CAR_CATEGORIES)[number];

// Helper to check if a value is a valid sort option
export const isValidSortOption = (value: string): value is SortOption =>
  SORT_OPTIONS.includes(value as SortOption);

// Helper to check if a value is a valid view mode
export const isValidViewMode = (value: string): value is ViewMode =>
  VIEW_MODES.includes(value as ViewMode);

// Helper to check if a value is a valid car category
export const isValidCarCategory = (value: string): value is CarCategory =>
  CAR_CATEGORIES.includes(value as CarCategory);
