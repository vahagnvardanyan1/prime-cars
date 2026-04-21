export type QuadricycleAgeCategory = "0-2" | "3-4" | "5-9" | "10-14" | "15+";

// ==================== HAS REVERSE CONSTANTS ====================

// Customs duty rate for "Has Reverse" quadricycles (flat, all ages)
export const HAS_REVERSE_CUSTOMS_DUTY_RATE = 0.05; // 5%

// Customs duty rate for "Not Reverse" quadricycles (flat, all ages)
export const NOT_REVERSE_CUSTOMS_DUTY_RATE = 0.15; // 15%

// ==================== ENVIRONMENTAL TAX ====================

// Environmental tax rates by age bracket
// Note: age brackets shift +1 year every January 1st (handled automatically by currentYear - vehicleYear)
export const QUADRICYCLE_ENV_TAX_RATES: Record<QuadricycleAgeCategory, number> = {
  "0-2": 0.02, // 2% (e.g. 2024-2026 vehicles in 2026)
  "3-4": 0.04, // 4% (e.g. 2022-2023 vehicles in 2026)
  "5-9": 0.06, // 6% (e.g. 2017-2021 vehicles in 2026)
  "10-14": 0.12, // 12% (e.g. 2012-2016 vehicles in 2026)
  "15+": 0.24, // 24% (e.g. up to 2011 vehicles in 2026)
};

// ==================== SHARED CONSTANTS ====================

// VAT rate (constant for all quadricycles/snowmobiles)
export const QUADRICYCLE_VAT_RATE = 0.2; // 20%
