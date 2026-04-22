// ==================== CONSTANTS ====================

const JETSKI_CUSTOMS_RATE = 0.15; // 15%
const JETSKI_VAT_RATE = 0.20; // 20%

// ==================== TYPES ====================

export type JetSkiTaxParams = {
  vehiclePriceEur: number;
  auctionFeeEur: number;
  shippingPriceEur: number;
  importer: string; // "legal" | "individual"
};

export type JetSkiTaxResult = {
  customsDuty: number;
  vat: number;
  environmentalTax: number; // always 0
  total: number;
};

// ==================== MAIN CALCULATION ====================

/**
 * Jet Ski import taxes.
 * No engine type, no engine volume, no environmental tax.
 *
 * Customs Duty:
 *   Individual: (vehiclePrice + auctionFee) × 15%
 *   Legal:      (vehiclePrice + auctionFee + shipping) × 15%
 *
 * VAT:
 *   Individual: (vehiclePrice + auctionFee + customsDuty) × 20%
 *   Legal:      (vehiclePrice + auctionFee + customsDuty + shipping) × 20%
 *
 * Environmental Tax: NONE
 */
export function calculateJetSkiTaxes(
  params: JetSkiTaxParams
): JetSkiTaxResult {
  const {
    vehiclePriceEur,
    auctionFeeEur,
    shippingPriceEur,
    importer,
  } = params;

  const baseValue = vehiclePriceEur + auctionFeeEur;

  // Customs Duty: base differs by importer
  const customsDutyBase =
    importer === "legal"
      ? baseValue + shippingPriceEur
      : baseValue;
  const customsDuty = customsDutyBase * JETSKI_CUSTOMS_RATE;

  // VAT: base differs by importer
  const vatBase =
    importer === "legal"
      ? baseValue + customsDuty + shippingPriceEur
      : baseValue + customsDuty;
  const vat = vatBase * JETSKI_VAT_RATE;

  const total = customsDuty + vat;

  return {
    customsDuty: Math.round(customsDuty),
    vat: Math.round(vat),
    environmentalTax: 0,
    total: Math.round(total),
  };
}
