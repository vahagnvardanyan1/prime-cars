import { calculateEnvironmentalTax } from "./calculateEnvironmentalTax";

// ==================== CONSTANTS ====================

const SNOWMOBILE_CUSTOMS_RATE = 0.05; // 5%
const SNOWMOBILE_VAT_RATE = 0.20; // 20%

// ==================== TYPES ====================

export type SnowmobileTaxParams = {
  vehiclePriceEur: number;
  auctionFeeEur: number;
  shippingPriceEur: number;
  vehicleYear: number;
  importer: string; // "legal" | "individual"
};

export type SnowmobileTaxResult = {
  customsDuty: number;
  vat: number;
  environmentalTax: number;
  total: number;
};

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
 * Env Tax:
 *   Individual: (vehiclePrice + auctionFee) × age rate%
 *   Legal:      (vehiclePrice + auctionFee + shipping) × age rate%
 */
export function calculateSnowmobileTaxes(
  params: SnowmobileTaxParams
): SnowmobileTaxResult {
  const {
    vehiclePriceEur,
    auctionFeeEur,
    shippingPriceEur,
    vehicleYear,
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

  // Environmental Tax: shipping is included in the base for legal importer
  // (matches truck behavior).
  const envTaxBase = importer === "legal" ? baseValue + shippingPriceEur : baseValue;
  const environmentalTax = calculateEnvironmentalTax(envTaxBase, vehicleYear).amount;

  const total = customsDuty + vat + environmentalTax;

  return {
    customsDuty,
    vat,
    environmentalTax,
    total,
  };
}
