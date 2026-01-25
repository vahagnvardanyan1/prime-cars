import {
  type QuadricycleAgeCategory,
  QUADRICYCLE_CUSTOMS_DUTY_RATE_UNDER_3,
  QUADRICYCLE_ENV_TAX_RATE_UNDER_3,
  QUADRICYCLE_CUSTOMS_DUTY_RATE_ABOVE_3,
  QUADRICYCLE_CUSTOMS_DUTY_PER_CM3,
  QUADRICYCLE_ENV_TAX_RATES,
  QUADRICYCLE_VAT_RATE,
} from "./quadricycleTaxConstants";

export type QuadricycleTaxParams = {
  vehiclePriceEur: number; // Vehicle price in EUR
  auctionFeeEur: number; // Auction fee in EUR
  engineVolumeLiters: number; // Engine volume in liters
  vehicleYear: number; // e.g., 2020
};

export type QuadricycleTaxResult = {
  customsDuty: number; // In EUR
  vat: number; // In EUR
  environmentalTax: number; // In EUR
  total: number; // Total taxes in EUR
};

/**
 * Calculate the age of the vehicle based on the current year
 */
function calculateVehicleAge(vehicleYear: number): number {
  const currentYear = new Date().getFullYear();
  return currentYear - vehicleYear;
}

/**
 * Check if the vehicle is under 3 years old
 */
function isUnder3Years(vehicleYear: number): boolean {
  return calculateVehicleAge(vehicleYear) < 3;
}

/**
 * Determine the age category for environmental tax calculation (above 3 years)
 */
function getAgeCategory(vehicleYear: number): QuadricycleAgeCategory {
  const age = calculateVehicleAge(vehicleYear);

  if (age < 3) return "0-3";
  if (age < 5) return "3-5";
  if (age < 9) return "5-9";
  if (age < 14) return "10-14";
  return "15+";
}

/**
 * Calculate customs duty for vehicles UNDER 3 years old
 * Formula: (Price + Fee) × 5%
 */
function calculateCustomsDutyUnder3(baseValue: number): number {
  return baseValue * QUADRICYCLE_CUSTOMS_DUTY_RATE_UNDER_3;
}

/**
 * Calculate customs duty for vehicles ABOVE 3 years old
 * Formula: MAX((Price + Fee) × 20%, engineVolume_cm³ × €0.36)
 */
function calculateCustomsDutyAbove3(
  baseValue: number,
  engineVolumeLiters: number
): number {
  const engineVolumeCm3 = engineVolumeLiters * 1000;

  const percentageBased = baseValue * QUADRICYCLE_CUSTOMS_DUTY_RATE_ABOVE_3;
  const volumeBased = engineVolumeCm3 * QUADRICYCLE_CUSTOMS_DUTY_PER_CM3;

  return Math.max(percentageBased, volumeBased);
}

/**
 * Calculate quadricycle/snowmobile import taxes based on Armenian customs regulations
 *
 * Formula documentation:
 * UNDER 3 YEARS (2024-2026):
 * - Customs Duty = (Price + Fee) × 5%
 * - Environmental Tax = (Customs + Price + Fee) × 2%
 * - VAT = (Customs + Price + Fee) × 20%
 *
 * ABOVE 3 YEARS (2023 & older):
 * - Customs Duty = MAX((Price + Fee) × 20%, engineVolume_cm³ × €0.36)
 * - VAT = (Customs + Price + Fee) × 20%
 * - Environmental Tax = age-based rate (4%, 6%, 12%, 24%)
 */
export function calculateQuadricycleTaxes(
  params: QuadricycleTaxParams
): QuadricycleTaxResult {
  const { vehiclePriceEur, auctionFeeEur, engineVolumeLiters, vehicleYear } =
    params;

  // Base value for calculations (price + auction fee)
  const baseValue = vehiclePriceEur + auctionFeeEur;

  let customsDuty: number;
  let environmentalTax: number;

  if (isUnder3Years(vehicleYear)) {
    // Under 3 years old
    customsDuty = calculateCustomsDutyUnder3(baseValue);

    // Environmental Tax = (Customs + Price + Fee) × 2%
    const taxBase = customsDuty + baseValue;
    environmentalTax = taxBase * QUADRICYCLE_ENV_TAX_RATE_UNDER_3;
  } else {
    // Above 3 years old
    customsDuty = calculateCustomsDutyAbove3(baseValue, engineVolumeLiters);

    // Environmental Tax = age-based rate
    const ageCategory = getAgeCategory(vehicleYear);
    const envTaxRate = QUADRICYCLE_ENV_TAX_RATES[ageCategory];
    const taxBase = customsDuty + baseValue;
    environmentalTax = taxBase * envTaxRate;
  }

  // VAT = (Customs + Price + Fee) × 20%
  const vatBase = customsDuty + baseValue;
  const vat = vatBase * QUADRICYCLE_VAT_RATE;

  // Calculate total taxes
  const total = customsDuty + vat + environmentalTax;

  return {
    customsDuty: Math.round(customsDuty),
    vat: Math.round(vat),
    environmentalTax: Math.round(environmentalTax),
    total: Math.round(total),
  };
}
