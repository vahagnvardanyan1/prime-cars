export type QuadricycleAgeCategory = "0-3" | "3-5" | "5-9" | "10-14" | "15+";

// ==================== UNDER 3 YEARS CONSTANTS ====================

// Customs duty rate for vehicles under 3 years old
export const QUADRICYCLE_CUSTOMS_DUTY_RATE_UNDER_3 = 0.05; // 5%

// Environmental tax rate for vehicles under 3 years old
export const QUADRICYCLE_ENV_TAX_RATE_UNDER_3 = 0.02; // 2%

// ==================== ABOVE 3 YEARS CONSTANTS ====================

// Customs duty percentage rate for MAX formula (above 3 years)
export const QUADRICYCLE_CUSTOMS_DUTY_RATE_ABOVE_3 = 0.20; // 20%

// Customs duty per cm³ rate for MAX formula (above 3 years)
export const QUADRICYCLE_CUSTOMS_DUTY_PER_CM3 = 0.36; // €0.36 per cm³

// Environmental tax rates by age bracket (above 3 years)
export const QUADRICYCLE_ENV_TAX_RATES: Record<QuadricycleAgeCategory, number> = {
  "0-3": 0.02, // 2% (not used for above 3 years, but included for completeness)
  "3-5": 0.04, // 4% for 3-5 years (2022-2023)
  "5-9": 0.06, // 6% for 5-9 years (2017-2021)
  "10-14": 0.12, // 12% for 10-14 years (2012-2016)
  "15+": 0.24, // 24% for 15+ years (2011 & older)
};

// ==================== SHARED CONSTANTS ====================

// VAT rate (constant for all quadricycles/snowmobiles)
export const QUADRICYCLE_VAT_RATE = 0.2; // 20%
