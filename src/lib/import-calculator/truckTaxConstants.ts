export type TruckWeightClass = "under5" | "5to20" | "above20";

export type TruckAgeCategory = "0-3" | "3-5" | "5-7" | "7-9" | "10-14" | "15+";

export type TruckEngineType = "petrol" | "diesel";

// ==================== PETROL TRUCK CONSTANTS ====================

// Petrol customs duty rates by weight class (for trucks under 7 years old)
export const PETROL_CUSTOMS_DUTY_RATES: Record<TruckWeightClass, number> = {
  under5: 0.15, // 15% for up to 5 ton && up to 2.8L engine
  "5to20": 0.125, // 12.5% for 5-20 ton && above 2.8L engine
  above20: 0.15, // 15% for above 20 ton (engine volume doesn't matter)
};

// Petrol engine volume threshold
export const PETROL_ENGINE_VOLUME_THRESHOLD = 2.8; // 2.8 liters

// ==================== DIESEL TRUCK CONSTANTS ====================

// Diesel customs duty rates by weight class (0-3 years)
export const DIESEL_CUSTOMS_DUTY_RATES_0_3: Record<TruckWeightClass, number> = {
  under5: 0.10, // 10% for up to 5 ton
  "5to20": 0.15, // 15% for 5-20 ton
  above20: 0.05, // 5% for above 20 ton
};

// Diesel customs duty rate for 3-5 years (flat rate for all classes)
export const DIESEL_CUSTOMS_DUTY_RATE_3_5 = 0.10; // 10%

// Diesel customs duty rate for 5-7 years (percentage part of MAX formula)
export const DIESEL_CUSTOMS_DUTY_RATE_5_7 = 0.10; // 10%

// Diesel 5-7 years: per cm³ rates for MAX calculation
export const DIESEL_5_7_YEAR_CM3_RATES: Record<TruckWeightClass, number> = {
  under5: 0.13, // €0.13 per cm³
  "5to20": 0.18, // €0.18 per cm³
  above20: 0, // Not used (flat 10%)
};

// Diesel engine volume threshold
export const DIESEL_ENGINE_VOLUME_THRESHOLD = 2.5; // 2.5 liters

// ==================== SHARED CONSTANTS ====================

// Environmental tax rates by age bracket (same for petrol and diesel)
export const ENVIRONMENTAL_TAX_RATES: Record<TruckAgeCategory, number> = {
  "0-3": 0.02, // 2% for 0-3 years old
  "3-5": 0.04, // 4% for 3-5 years old
  "5-7": 0.06, // 6% for 5-7 years old
  "7-9": 0.06, // 6% for 7-9 years old
  "10-14": 0.12, // 12% for 10-14 years old
  "15+": 0.24, // 24% for 15+ years old
};

// VAT rate (constant for all trucks)
export const VAT_RATE = 0.2; // 20%

// Specific customs duty rate for trucks 7+ years old (same for petrol and diesel)
export const OLD_TRUCK_CUSTOMS_RATE_PER_CM3 = 1.0; // €1.00 per cm³ of engine volume

// Legacy export for backwards compatibility
export const CUSTOMS_DUTY_RATES = PETROL_CUSTOMS_DUTY_RATES;
export const ENGINE_VOLUME_THRESHOLD = PETROL_ENGINE_VOLUME_THRESHOLD;
export const OLD_TRUCK_CUSTOMS_RATE_PER_LITER = OLD_TRUCK_CUSTOMS_RATE_PER_CM3;
