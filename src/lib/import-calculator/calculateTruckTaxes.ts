import {
  type TruckWeightClass as TruckWeightClassType,
  type TruckAgeCategory,
  type TruckEngineType,
  PETROL_RATE_DEFAULT,
  PETROL_UNDER5_LARGE_ENGINE_RATE_0_3,
  PETROL_ENGINE_CC_THRESHOLD,
  DIESEL_RATE_UNDER5,
  DIESEL_RATE_5TO20_0_3,
  DIESEL_RATE_5TO20_3_5,
  DIESEL_RATE_5TO20_5_7,
  DIESEL_RATE_ABOVE20_0_3,
  DIESEL_RATE_ABOVE20_3_7,
  DIESEL_UNDER5_SMALL_CM3_RATE,
  DIESEL_5TO20_CM3_RATE,
  DIESEL_ENGINE_CC_THRESHOLD,
  ELECTRIC_CUSTOMS_DUTY_RATE,
  OLD_TRUCK_CUSTOMS_RATE_PER_CM3,
  ENVIRONMENTAL_TAX_RATES,
  VAT_RATE,
} from "./truckTaxConstants";

export type TruckWeightClass = TruckWeightClassType;
export type { TruckEngineType };

export type TruckTaxParams = {
  vehiclePriceEur: number;
  auctionFeeEur: number;
  shippingPriceEur: number;
  engineVolumeLiters: number;
  weightClass: TruckWeightClass;
  vehicleYear: number;
  engineType: TruckEngineType;
  importer: string; // "legal" | "individual"
};

export type TruckTaxResult = {
  customsDuty: number;
  vat: number;
  environmentalTax: number;
  total: number;
};

function calculateVehicleAge(vehicleYear: number): number {
  const currentYear = new Date().getFullYear();
  return currentYear - vehicleYear;
}

function getAgeCategory(vehicleYear: number): TruckAgeCategory {
  const age = calculateVehicleAge(vehicleYear);

  if (age <= 2) return "0-2";
  if (age <= 4) return "3-4";
  if (age <= 9) return "5-9";
  if (age <= 14) return "10-14";
  return "15+";
}

// ==================== PETROL CUSTOMS DUTY FUNCTIONS ====================

/**
 * Petrol, under 5 tons, <2800cc
 * 0-7 years → 15%
 * 7+ years  → engineCc × €1.0
 */
function calculatePetrolUnder5SmallEngine(
  customsDutyBase: number,
  engineCc: number,
  age: number
): number {
  if (age > 7) return engineCc * OLD_TRUCK_CUSTOMS_RATE_PER_CM3;
  return customsDutyBase * PETROL_RATE_DEFAULT;
}

/**
 * Petrol, under 5 tons, ≥2800cc
 * 0-3 years → 12.5%
 * 3-7 years → 15%
 * 7+ years  → engineCc × €1.0
 */
function calculatePetrolUnder5LargeEngine(
  customsDutyBase: number,
  engineCc: number,
  age: number
): number {
  if (age > 7) return engineCc * OLD_TRUCK_CUSTOMS_RATE_PER_CM3;
  if (age <= 3) return customsDutyBase * PETROL_UNDER5_LARGE_ENGINE_RATE_0_3;
  return customsDutyBase * PETROL_RATE_DEFAULT;
}

/**
 * Petrol, 5-20 tons AND 20+ tons (same logic, any engine volume)
 * 0-7 years → 15%
 * 7+ years  → engineCc × €1.0
 */
function calculatePetrolHeavy(
  customsDutyBase: number,
  engineCc: number,
  age: number
): number {
  if (age > 7) return engineCc * OLD_TRUCK_CUSTOMS_RATE_PER_CM3;
  return customsDutyBase * PETROL_RATE_DEFAULT;
}

// ==================== DIESEL CUSTOMS DUTY FUNCTIONS ====================

/**
 * Diesel, under 5 tons, <2500cc
 * 0-5 years → 10%
 * 5-7 years → MAX(base × 10%, engineCc × €0.13)
 * 7+ years  → engineCc × €1.0
 */
function calculateDieselUnder5SmallEngine(
  customsDutyBase: number,
  engineCc: number,
  age: number
): number {
  if (age > 7) return engineCc * OLD_TRUCK_CUSTOMS_RATE_PER_CM3;
  if (age > 5) {
    const percentageBased = customsDutyBase * DIESEL_RATE_UNDER5;
    const volumeBased = engineCc * DIESEL_UNDER5_SMALL_CM3_RATE;
    return Math.max(percentageBased, volumeBased);
  }
  return customsDutyBase * DIESEL_RATE_UNDER5;
}

/**
 * Diesel, under 5 tons, ≥2500cc
 * 0-7 years → 10%
 * 7+ years  → engineCc × €1.0
 */
function calculateDieselUnder5LargeEngine(
  customsDutyBase: number,
  engineCc: number,
  age: number
): number {
  if (age > 7) return engineCc * OLD_TRUCK_CUSTOMS_RATE_PER_CM3;
  return customsDutyBase * DIESEL_RATE_UNDER5;
}

/**
 * Diesel, 5-20 tons, any engine volume
 * 0-3 years → 15%
 * 3-5 years → 10%
 * 5-7 years → MAX(base × 10%, engineCc × €0.18)
 * 7+ years  → engineCc × €1.0
 */
function calculateDiesel5to20(
  customsDutyBase: number,
  engineCc: number,
  age: number
): number {
  if (age > 7) return engineCc * OLD_TRUCK_CUSTOMS_RATE_PER_CM3;
  if (age > 5) {
    const percentageBased = customsDutyBase * DIESEL_RATE_5TO20_5_7;
    const volumeBased = engineCc * DIESEL_5TO20_CM3_RATE;
    return Math.max(percentageBased, volumeBased);
  }
  if (age > 3) return customsDutyBase * DIESEL_RATE_5TO20_3_5;
  return customsDutyBase * DIESEL_RATE_5TO20_0_3;
}

/**
 * Diesel, 20+ tons, any engine volume
 * 0-3 years → 5%
 * 3-7 years → 10%
 * 7+ years  → engineCc × €1.0
 */
function calculateDieselAbove20(
  customsDutyBase: number,
  engineCc: number,
  age: number
): number {
  if (age > 7) return engineCc * OLD_TRUCK_CUSTOMS_RATE_PER_CM3;
  if (age > 3) return customsDutyBase * DIESEL_RATE_ABOVE20_3_7;
  return customsDutyBase * DIESEL_RATE_ABOVE20_0_3;
}

// ==================== ELECTRIC CUSTOMS DUTY FUNCTION ====================

/**
 * Electric trucks — flat 15% for all cases, no exceptions
 * No weight class, age, or engine volume distinction
 */
function calculateElectricCustomsDuty(customsDutyBase: number): number {
  return customsDutyBase * ELECTRIC_CUSTOMS_DUTY_RATE;
}

// ==================== ROUTER ====================

function calculateCustomsDuty(
  engineType: TruckEngineType,
  weightClass: TruckWeightClass,
  engineVolumeLiters: number,
  customsDutyBase: number,
  vehicleYear: number
): number {
  const age = calculateVehicleAge(vehicleYear);
  const engineCc = engineVolumeLiters * 1000;

  if (engineType === "electric") {
    return calculateElectricCustomsDuty(customsDutyBase);
  }

  if (engineType === "petrol") {
    if (weightClass === "under5") {
      if (engineCc < PETROL_ENGINE_CC_THRESHOLD) {
        return calculatePetrolUnder5SmallEngine(customsDutyBase, engineCc, age);
      }
      return calculatePetrolUnder5LargeEngine(customsDutyBase, engineCc, age);
    }
    return calculatePetrolHeavy(customsDutyBase, engineCc, age);
  }

  // diesel
  if (weightClass === "under5") {
    if (engineCc < DIESEL_ENGINE_CC_THRESHOLD) {
      return calculateDieselUnder5SmallEngine(customsDutyBase, engineCc, age);
    }
    return calculateDieselUnder5LargeEngine(customsDutyBase, engineCc, age);
  }
  if (weightClass === "5to20") {
    return calculateDiesel5to20(customsDutyBase, engineCc, age);
  }
  return calculateDieselAbove20(customsDutyBase, engineCc, age);
}

// ==================== MAIN CALCULATION ====================

export function calculateTruckTaxes(params: TruckTaxParams): TruckTaxResult {
  const {
    vehiclePriceEur,
    auctionFeeEur,
    shippingPriceEur,
    engineVolumeLiters,
    weightClass,
    vehicleYear,
    engineType,
    importer,
  } = params;

  // Customs duty base differs by importer type
  const customsDutyBase =
    importer === "legal"
      ? vehiclePriceEur + auctionFeeEur + shippingPriceEur
      : vehiclePriceEur + auctionFeeEur;

  const baseValue = vehiclePriceEur + auctionFeeEur;

  const customsDuty = calculateCustomsDuty(
    engineType,
    weightClass,
    engineVolumeLiters,
    customsDutyBase,
    vehicleYear
  );

  // VAT: differs by importer type
  // Individual: (vehiclePrice + auctionFee + customsDuty) × 20%
  // Legal: (vehiclePrice + auctionFee + customsDuty + shipping) × 20%
  const vatBase =
    importer === "legal"
      ? customsDuty + baseValue + shippingPriceEur
      : customsDuty + baseValue;
  const vat = vatBase * VAT_RATE;

  // Environmental tax: same base for both importers (no customsDuty, no shipping)
  // (vehiclePrice + auctionFee) × age-based rate%
  const envTaxBase = baseValue;
  const ageCategory = getAgeCategory(vehicleYear);
  const envTaxRate = ENVIRONMENTAL_TAX_RATES[ageCategory];
  const environmentalTax = envTaxBase * envTaxRate;

  const total = customsDuty + vat + environmentalTax;

  return {
    customsDuty: Math.round(customsDuty),
    vat: Math.round(vat),
    environmentalTax: Math.round(environmentalTax),
    total: Math.round(total),
  };
}
