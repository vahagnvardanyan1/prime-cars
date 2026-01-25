import {
  type TruckWeightClass as TruckWeightClassType,
  type TruckAgeCategory,
  type TruckEngineType,
  PETROL_CUSTOMS_DUTY_RATES,
  DIESEL_CUSTOMS_DUTY_RATES_0_3,
  DIESEL_CUSTOMS_DUTY_RATE_3_5,
  DIESEL_CUSTOMS_DUTY_RATE_5_7,
  DIESEL_5_7_YEAR_CM3_RATES,
  ENVIRONMENTAL_TAX_RATES,
  VAT_RATE,
  OLD_TRUCK_CUSTOMS_RATE_PER_LITER,
} from "./truckTaxConstants";

export type TruckWeightClass = TruckWeightClassType;
export type { TruckEngineType };

export type TruckTaxParams = {
  vehiclePriceEur: number; // Vehicle price in EUR (already converted from USD)
  auctionFeeEur: number; // Auction fee in EUR
  engineVolumeLiters: number; // Engine volume in liters
  weightClass: TruckWeightClass;
  vehicleYear: number; // e.g., 2020
  engineType: TruckEngineType; // "petrol" or "diesel"
};

export type TruckTaxResult = {
  customsDuty: number; // In EUR
  vat: number; // In EUR
  environmentalTax: number; // In EUR
  total: number; // Total taxes in EUR
};

/**
 * Calculate the age of the truck based on the current year
 */
function calculateVehicleAge(vehicleYear: number): number {
  const currentYear = new Date().getFullYear();
  return currentYear - vehicleYear;
}

/**
 * Determine the age category for tax calculation
 */
function getAgeCategory(vehicleYear: number): TruckAgeCategory {
  const age = calculateVehicleAge(vehicleYear);

  if (age <= 3) return "0-3";
  if (age <= 5) return "3-5";
  if (age <= 7) return "5-7";
  if (age <= 9) return "7-9";
  if (age <= 14) return "10-14";
  return "15+";
}

/**
 * Get age bracket for customs duty calculation
 */
function getAgeBracket(vehicleYear: number): "0-3" | "3-5" | "5-7" | "7+" {
  const age = calculateVehicleAge(vehicleYear);

  if (age <= 3) return "0-3";
  if (age <= 5) return "3-5";
  if (age <= 7) return "5-7";
  return "7+";
}

/**
 * Calculate customs duty for PETROL trucks
 */
function calculatePetrolCustomsDuty(
  baseValue: number,
  engineVolumeLiters: number,
  weightClass: TruckWeightClass,
  vehicleYear: number
): number {
  const ageBracket = getAgeBracket(vehicleYear);

  if (ageBracket === "7+") {
    // For trucks 7+ years old: Customs = engineVolumeLiters × €1.00
    return engineVolumeLiters * OLD_TRUCK_CUSTOMS_RATE_PER_LITER;
  }

  // For 0-3, 3-5, 5-7 years: Customs = baseValue × rate%
  const customsRate = PETROL_CUSTOMS_DUTY_RATES[weightClass];
  return baseValue * customsRate;
}

/**
 * Calculate customs duty for DIESEL trucks
 */
function calculateDieselCustomsDuty(
  baseValue: number,
  engineVolumeLiters: number,
  weightClass: TruckWeightClass,
  vehicleYear: number
): number {
  const ageBracket = getAgeBracket(vehicleYear);
  const engineVolumeCm3 = engineVolumeLiters * 1000;

  switch (ageBracket) {
    case "0-3": {
      // Different rates per weight class
      const customsRate = DIESEL_CUSTOMS_DUTY_RATES_0_3[weightClass];
      return baseValue * customsRate;
    }

    case "3-5": {
      // Flat 10% for all weight classes
      return baseValue * DIESEL_CUSTOMS_DUTY_RATE_3_5;
    }

    case "5-7": {
      // Special MAX logic for under5 and 5to20
      if (weightClass === "above20") {
        // Flat 10% for above 20 ton
        return baseValue * DIESEL_CUSTOMS_DUTY_RATE_5_7;
      }

      // MAX(baseValue × 10%, engineVolume_cm³ × rate_per_cm³)
      const percentageBased = baseValue * DIESEL_CUSTOMS_DUTY_RATE_5_7;
      const volumeBased = engineVolumeCm3 * DIESEL_5_7_YEAR_CM3_RATES[weightClass];
      return Math.max(percentageBased, volumeBased);
    }

    case "7+": {
      // Same as petrol: engineVolumeLiters × €1.00
      return engineVolumeLiters * OLD_TRUCK_CUSTOMS_RATE_PER_LITER;
    }
  }
}

/**
 * Calculate truck import taxes based on Armenian customs regulations
 *
 * Formula documentation:
 * PETROL:
 * - For trucks under 7 years: Customs = (price + auctionFee) × rate%
 * - For trucks 7+ years: Customs = engineVolumeLiters × €1.00
 *
 * DIESEL:
 * - 0-3 years: Different rates by weight class (10%, 15%, 5%)
 * - 3-5 years: Flat 10% for all classes
 * - 5-7 years: MAX(10% of base, engineVolume × €/cm³) for under5 and 5to20
 * - 7+ years: Same as petrol
 *
 * VAT = (customsDuty + price + auctionFee) × 20%
 * Environmental Tax = (customsDuty + price + auctionFee) × age-based rate%
 */
export function calculateTruckTaxes(params: TruckTaxParams): TruckTaxResult {
  const {
    vehiclePriceEur,
    auctionFeeEur,
    engineVolumeLiters,
    weightClass,
    vehicleYear,
    engineType,
  } = params;

  // Base value for percentage calculations (price + auction fee)
  const baseValue = vehiclePriceEur + auctionFeeEur;
  debugger

  // Calculate customs duty based on engine type
  const customsDuty =
    engineType === "diesel"
      ? calculateDieselCustomsDuty(baseValue, engineVolumeLiters, weightClass, vehicleYear)
      : calculatePetrolCustomsDuty(baseValue, engineVolumeLiters, weightClass, vehicleYear);

  // Calculate VAT: (customsDuty + baseValue) × 20%
  const vatBase = customsDuty + baseValue;
  const vat = vatBase * VAT_RATE;

  // Calculate environmental tax: (customsDuty + baseValue) × age-based rate%
  const ageCategory = getAgeCategory(vehicleYear);
  const envTaxRate = ENVIRONMENTAL_TAX_RATES[ageCategory];
  const environmentalTax = vatBase * envTaxRate;

  // Calculate total taxes
  const total = customsDuty + vat + environmentalTax;

  return {
    customsDuty: Math.round(customsDuty),
    vat: Math.round(vat),
    environmentalTax: Math.round(environmentalTax),
    total: Math.round(total),
  };
}
