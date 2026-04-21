export type TruckWeightClass = "under5" | "5to20" | "above20";

export type TruckAgeCategory = "0-2" | "3-4" | "5-9" | "10-14" | "15+";

export type TruckEngineType = "petrol" | "diesel" | "electric";

// ==================== PETROL TRUCK CONSTANTS ====================

// Default petrol customs duty rate (applies to most cases: 0-7 years)
export const PETROL_RATE_DEFAULT = 0.15; // 15%

// Special rate for under 5 ton + large engine (≥2800cc) + 0-3 years
export const PETROL_UNDER5_LARGE_ENGINE_RATE_0_3 = 0.125; // 12.5%

// Petrol engine volume threshold in cc (under5 weight class split)
export const PETROL_ENGINE_CC_THRESHOLD = 2800; // 2800cc

// ==================== DIESEL TRUCK CONSTANTS ====================

// Diesel customs duty rates
export const DIESEL_RATE_UNDER5 = 0.10; // 10% (for both small and large engine)
export const DIESEL_RATE_5TO20_0_3 = 0.15; // 15% for 5-20 ton, 0-3 years
export const DIESEL_RATE_5TO20_3_5 = 0.10; // 10% for 5-20 ton, 3-5 years
export const DIESEL_RATE_5TO20_5_7 = 0.10; // 10% for 5-20 ton, 5-7 years (percentage part of MAX)
export const DIESEL_RATE_ABOVE20_0_3 = 0.05; // 5% for 20+ ton, 0-3 years
export const DIESEL_RATE_ABOVE20_3_7 = 0.10; // 10% for 20+ ton, 3-7 years

// Diesel per cm³ rates for MAX calculation
export const DIESEL_UNDER5_SMALL_CM3_RATE = 0.13; // €0.13 per cm³ (under5, <2500cc, 5-7 years)
export const DIESEL_5TO20_CM3_RATE = 0.18; // €0.18 per cm³ (5-20 ton, 5-7 years)

// Diesel engine volume threshold in cc (under5 weight class split)
export const DIESEL_ENGINE_CC_THRESHOLD = 2500; // 2500cc

// ==================== ELECTRIC TRUCK CONSTANTS ====================

// Flat customs duty rate for electric trucks (all cases, no exceptions)
export const ELECTRIC_CUSTOMS_DUTY_RATE = 0.15; // 15%

// ==================== SHARED CONSTANTS ====================

// Customs duty rate for ALL trucks 7+ years old: €1.00 per cm³ of engine volume
export const OLD_TRUCK_CUSTOMS_RATE_PER_CM3 = 1.0; // €1.00 per cm³

// Environmental tax rates by age bracket (same for petrol and diesel)
// Note: age brackets shift +1 year every January 1st (handled automatically by currentYear - vehicleYear)
export const ENVIRONMENTAL_TAX_RATES: Record<TruckAgeCategory, number> = {
  "0-2": 0.02, // 2% (e.g. 2024-2026 vehicles in 2026)
  "3-4": 0.04, // 4% (e.g. 2022-2023 vehicles in 2026)
  "5-9": 0.06, // 6% (e.g. 2017-2021 vehicles in 2026)
  "10-14": 0.12, // 12% (e.g. 2012-2016 vehicles in 2026)
  "15+": 0.24, // 24% (e.g. up to 2011 vehicles in 2026)
};

// VAT rate (constant for all trucks)
export const VAT_RATE = 0.2; // 20%
