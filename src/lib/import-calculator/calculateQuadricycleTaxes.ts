import {
  type QuadricycleAgeCategory,
  HAS_REVERSE_CUSTOMS_DUTY_RATE,
  NOT_REVERSE_CUSTOMS_DUTY_RATE,
  QUADRICYCLE_ENV_TAX_RATES,
  QUADRICYCLE_VAT_RATE,
} from "./quadricycleTaxConstants";

export type QuadricycleTaxParams = {
  vehiclePriceEur: number;
  auctionFeeEur: number;
  shippingPriceEur: number;
  engineVolumeLiters: number;
  vehicleYear: number;
  importer: string; // "legal" | "individual"
  hasReverse: boolean;
};

export type QuadricycleTaxResult = {
  customsDuty: number;
  vat: number;
  environmentalTax: number;
  total: number;
};

function calculateVehicleAge(vehicleYear: number): number {
  const currentYear = new Date().getFullYear();
  return currentYear - vehicleYear;
}

function getAgeCategory(vehicleYear: number): QuadricycleAgeCategory {
  const age = calculateVehicleAge(vehicleYear);

  if (age <= 2) return "0-2";
  if (age <= 4) return "3-4";
  if (age <= 9) return "5-9";
  if (age <= 14) return "10-14";
  return "15+";
}

// ==================== HAS REVERSE ====================

/**
 * Quadricycle with reverse gear — flat 5% customs duty, no age/volume distinction.
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
function calculateHasReverseTaxes(
  vehiclePriceEur: number,
  auctionFeeEur: number,
  shippingPriceEur: number,
  vehicleYear: number,
  importer: string
): QuadricycleTaxResult {
  const baseValue = vehiclePriceEur + auctionFeeEur;

  // Customs Duty: base differs by importer
  const customsDutyBase =
    importer === "legal"
      ? baseValue + shippingPriceEur
      : baseValue;
  const customsDuty = customsDutyBase * HAS_REVERSE_CUSTOMS_DUTY_RATE;

  // VAT: base differs by importer
  const vatBase =
    importer === "legal"
      ? baseValue + customsDuty + shippingPriceEur
      : baseValue + customsDuty;
  const vat = vatBase * QUADRICYCLE_VAT_RATE;

  // Environmental Tax: same for both importers (no customsDuty, no shipping)
  const ageCategory = getAgeCategory(vehicleYear);
  const envTaxRate = QUADRICYCLE_ENV_TAX_RATES[ageCategory];
  const environmentalTax = baseValue * envTaxRate;

  const total = customsDuty + vat + environmentalTax;

  return {
    customsDuty: Math.round(customsDuty),
    vat: Math.round(vat),
    environmentalTax: Math.round(environmentalTax),
    total: Math.round(total),
  };
}

// ==================== NOT REVERSE ====================

/**
 * Quadricycle without reverse gear — flat 15% customs duty, no age/volume distinction.
 *
 * Customs Duty:
 *   Individual: (vehiclePrice + auctionFee) × 15%
 *   Legal:      (vehiclePrice + auctionFee + shipping) × 15%
 *
 * VAT:
 *   Individual: (vehiclePrice + auctionFee + customsDuty) × 20%
 *   Legal:      (vehiclePrice + auctionFee + customsDuty + shipping) × 20%
 *
 * Env Tax (same for both importers):
 *   (vehiclePrice + auctionFee) × age rate%
 */
function calculateNotReverseTaxes(
  vehiclePriceEur: number,
  auctionFeeEur: number,
  shippingPriceEur: number,
  vehicleYear: number,
  importer: string
): QuadricycleTaxResult {
  const baseValue = vehiclePriceEur + auctionFeeEur;

  // Customs Duty: base differs by importer
  const customsDutyBase =
    importer === "legal"
      ? baseValue + shippingPriceEur
      : baseValue;
  const customsDuty = customsDutyBase * NOT_REVERSE_CUSTOMS_DUTY_RATE;

  // VAT: base differs by importer
  const vatBase =
    importer === "legal"
      ? baseValue + customsDuty + shippingPriceEur
      : baseValue + customsDuty;
  const vat = vatBase * QUADRICYCLE_VAT_RATE;

  // Environmental Tax: same for both importers (no customsDuty, no shipping)
  const ageCategory = getAgeCategory(vehicleYear);
  const envTaxRate = QUADRICYCLE_ENV_TAX_RATES[ageCategory];
  const environmentalTax = baseValue * envTaxRate;

  const total = customsDuty + vat + environmentalTax;

  return {
    customsDuty: Math.round(customsDuty),
    vat: Math.round(vat),
    environmentalTax: Math.round(environmentalTax),
    total: Math.round(total),
  };
}

// ==================== MAIN ENTRY POINT ====================

export function calculateQuadricycleTaxes(
  params: QuadricycleTaxParams
): QuadricycleTaxResult {
  const {
    vehiclePriceEur,
    auctionFeeEur,
    shippingPriceEur,
    vehicleYear,
    importer,
    hasReverse,
  } = params;

  if (hasReverse) {
    return calculateHasReverseTaxes(
      vehiclePriceEur,
      auctionFeeEur,
      shippingPriceEur,
      vehicleYear,
      importer
    );
  }

  return calculateNotReverseTaxes(
    vehiclePriceEur,
    auctionFeeEur,
    shippingPriceEur,
    vehicleYear,
    importer
  );
}
