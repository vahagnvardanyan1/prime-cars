import { calculateVehicleAge } from "./calculateAge";

// ==================== CONSTANTS ====================

const SNOWMOBILE_CUSTOMS_RATE = 0.05; // 5%
const SNOWMOBILE_VAT_RATE = 0.20; // 20%

type SnowmobileAgeCategory = "0-2" | "3-4" | "5-9" | "10-14" | "15+";

// Environmental tax rates by age bracket
// Note: age brackets shift +1 year every January 1st (handled automatically by currentYear - vehicleYear)
const SNOWMOBILE_ENV_TAX_RATES: Record<SnowmobileAgeCategory, number> = {
  "0-2": 0.02, // 2%
  "3-4": 0.04, // 4%
  "5-9": 0.06, // 6%
  "10-14": 0.12, // 12%
  "15+": 0.24, // 24%
};

// ==================== TYPES ====================

export type SnowmobileTaxParams = {
  vehiclePriceEur: number;
  auctionFeeEur: number;
  shippingPriceEur: number;
  vehicleYear: number;
  vehicleMonth: number;
  vehicleDay: number;
  importer: string; // "legal" | "individual"
};

export type SnowmobileTaxResult = {
  customsDuty: number;
  vat: number;
  environmentalTax: number;
  total: number;
};

// ==================== HELPERS ====================

function getAgeCategory(vehicleYear: number, vehicleMonth: number, vehicleDay: number): SnowmobileAgeCategory {
  const age = calculateVehicleAge(vehicleYear, vehicleMonth, vehicleDay);

  if (age <= 2) return "0-2";
  if (age <= 4) return "3-4";
  if (age <= 9) return "5-9";
  if (age <= 14) return "10-14";
  return "15+";
}

// ==================== MAIN CALCULATION ====================

/**
 * Snowmobile import taxes.
 * No engine type or volume needed — flat 5% customs duty for all cases.
 *
 * Customs Duty:
 *   Individual: (vehiclePrice + auctionFee) × 5%
 *   Legal:      (vehiclePrice + auctionFee + shipping) × 5%
 *
 * VAT:
 *   Individual: (vehiclePrice + auctionFee + customsDuty) × 20%
 *   Legal:      (vehiclePrice + auctionFee + customsDuty + shipping) × 20%
 *
 * Env Tax (same for both importers):
 *   (vehiclePrice + auctionFee) × age rate%
 */
export function calculateSnowmobileTaxes(
  params: SnowmobileTaxParams
): SnowmobileTaxResult {
  const {
    vehiclePriceEur,
    auctionFeeEur,
    shippingPriceEur,
    vehicleYear,
    vehicleMonth,
    vehicleDay,
    importer,
  } = params;

  const baseValue = vehiclePriceEur + auctionFeeEur;

  // Customs Duty: base differs by importer
  const customsDutyBase =
    importer === "legal"
      ? baseValue + shippingPriceEur
      : baseValue;
  const customsDuty = customsDutyBase * SNOWMOBILE_CUSTOMS_RATE;

  // VAT: base differs by importer
  const vatBase =
    importer === "legal"
      ? baseValue + customsDuty + shippingPriceEur
      : baseValue + customsDuty;
  const vat = vatBase * SNOWMOBILE_VAT_RATE;

  // Environmental Tax: same for both importers (no customsDuty, no shipping)
  const ageCategory = getAgeCategory(vehicleYear, vehicleMonth, vehicleDay);
  const envTaxRate = SNOWMOBILE_ENV_TAX_RATES[ageCategory];
  const environmentalTax = baseValue * envTaxRate;

  const total = customsDuty + vat + environmentalTax;

  return {
    customsDuty: Math.round(customsDuty),
    vat: Math.round(vat),
    environmentalTax: Math.round(environmentalTax),
    total: Math.round(total),
  };
}
