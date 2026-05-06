import {
  HAS_REVERSE_CUSTOMS_DUTY_RATE,
  NOT_REVERSE_CUSTOMS_DUTY_RATE,
  QUADRICYCLE_VAT_RATE,
} from "./quadricycleTaxConstants";

import { calculateEnvironmentalTax } from "./calculateEnvironmentalTax";

export type QuadricycleTaxParams = {
  vehiclePriceEur: number;
  auctionFeeEur: number;
  shippingPriceEur: number;
  engineVolumeCm3: number;
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
 * Env Tax:
 *   Individual: (vehiclePrice + auctionFee) × age rate%
 *   Legal:      (vehiclePrice + auctionFee + shipping) × age rate%
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

  // Environmental Tax: shipping is included in the base for legal importer
  // (matches truck behavior).
  const envTaxBase = importer === "legal" ? baseValue + shippingPriceEur : baseValue;
  const environmentalTax = calculateEnvironmentalTax(envTaxBase, vehicleYear).amount;

  const total = customsDuty + vat + environmentalTax;

  return {
    customsDuty: customsDuty,
    vat: vat,
    environmentalTax: environmentalTax,
    total: total,
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
 * Env Tax:
 *   Individual: (vehiclePrice + auctionFee) × age rate%
 *   Legal:      (vehiclePrice + auctionFee + shipping) × age rate%
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
