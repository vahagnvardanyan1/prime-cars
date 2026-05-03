// ==================== CONSTANTS ====================

const MOTO_RATE_SMALL = 0.14; // 14% for 1-249cc
const MOTO_RATE_MEDIUM = 0.15; // 15% for 250-799cc
const MOTO_RATE_LARGE = 0.10; // 10% for 800+cc
const MOTO_RATE_ELECTRIC = 0.14; // 14% for electric
const MOTO_VAT_RATE = 0.20; // 20%

// ==================== TYPES ====================

export type MotorcycleTaxParams = {
  vehiclePriceEur: number;
  auctionFeeEur: number;
  shippingPriceEur: number;
  engineVolumeCm3: number;
  importer: string; // "legal" | "individual"
  isElectric: boolean;
};

export type MotorcycleTaxResult = {
  customsDuty: number;
  vat: number;
  environmentalTax: number; // always 0
  total: number;
};

// ==================== CUSTOMS DUTY FUNCTIONS ====================

/**
 * Motorcycle, 1-249cc → 14%
 */
function calculateMotoSmallEngine(customsDutyBase: number): number {
  return customsDutyBase * MOTO_RATE_SMALL;
}

/**
 * Motorcycle, 250-799cc → 15%
 */
function calculateMotoMediumEngine(customsDutyBase: number): number {
  return customsDutyBase * MOTO_RATE_MEDIUM;
}

/**
 * Motorcycle, 800+cc → 10%
 */
function calculateMotoLargeEngine(customsDutyBase: number): number {
  return customsDutyBase * MOTO_RATE_LARGE;
}

/**
 * Electric motorcycle → 14%
 */
function calculateMotoElectric(customsDutyBase: number): number {
  return customsDutyBase * MOTO_RATE_ELECTRIC;
}

// ==================== ROUTER ====================

function calculateCustomsDuty(
  customsDutyBase: number,
  engineVolumeCm3: number,
  isElectric: boolean
): number {
  if (isElectric) {
    return calculateMotoElectric(customsDutyBase);
  }

  if (engineVolumeCm3 < 250) return calculateMotoSmallEngine(customsDutyBase);
  if (engineVolumeCm3 < 800) return calculateMotoMediumEngine(customsDutyBase);
  return calculateMotoLargeEngine(customsDutyBase);
}

// ==================== MAIN CALCULATION ====================

/**
 * Motorcycle import taxes.
 *
 * Customs Duty: volume-based rate applied to importer-specific base
 * VAT: 20% on (price + auction + customsDuty [+ shipping for legal])
 * Environmental Tax: NONE
 */
export function calculateMotorcycleTaxes(
  params: MotorcycleTaxParams
): MotorcycleTaxResult {
  const {
    vehiclePriceEur,
    auctionFeeEur,
    shippingPriceEur,
    engineVolumeCm3,
    importer,
    isElectric,
  } = params;

  
  const baseValue = vehiclePriceEur + auctionFeeEur;

  // Customs Duty: base differs by importer
  const customsDutyBase =
    importer === "legal"
      ? baseValue + shippingPriceEur
      : baseValue;
  const customsDuty = calculateCustomsDuty(customsDutyBase, engineVolumeCm3, isElectric);

  // VAT: base differs by importer
  const vatBase =
    importer === "legal"
      ? baseValue + customsDuty + shippingPriceEur
      : baseValue + customsDuty;
  const vat = vatBase * MOTO_VAT_RATE;

  // No environmental tax for motorcycles
  const environmentalTax = 0;

  const total = customsDuty + vat + environmentalTax;

  return {
    customsDuty: Math.round(customsDuty),
    vat: Math.round(vat),
    environmentalTax: 0,
    total: Math.round(total),
  };
}
