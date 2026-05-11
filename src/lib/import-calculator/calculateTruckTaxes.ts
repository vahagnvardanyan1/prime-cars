import {
  type TruckWeightClass as TruckWeightClassType,
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
  VAT_RATE,
} from "./truckTaxConstants";
import { calculateVehicleAge } from "./calculateAge";
import { calculateEnvironmentalTax } from "./calculateEnvironmentalTax";

export type TruckWeightClass = TruckWeightClassType;
export type { TruckEngineType };

export type TruckTaxParams = {
  vehiclePriceEur: number;
  auctionFeeEur: number;
  shippingPriceEur: number;
  engineVolumeCm3: number;
  weightClass: TruckWeightClass;
  vehicleYear: number;
  vehicleMonth: number;
  vehicleDay: number;
  engineType: TruckEngineType;
  importer: string; // "legal" | "individual"
};

export type TruckTaxResult = {
  customsDuty: number;
  vat: number;
  environmentalTax: number;
  total: number;
};

type CustomsDutyOutcome = {
  value: number;
  branch: string;
  details: Record<string, unknown>;
};

// ==================== PETROL CUSTOMS DUTY FUNCTIONS ====================

/**
 * Petrol, under 5 tons, <2800cc
 * 0-7 years → 15% (P1)
 * 7+ years  → engineCc × €1.0 (P2)
 */
function calculatePetrolUnder5SmallEngine(
  customsDutyBase: number,
  engineCc: number,
  age: number
): CustomsDutyOutcome {
  if (age > 7) {
    const value = engineCc * OLD_TRUCK_CUSTOMS_RATE_PER_CM3;
    return { value, branch: "P2", details: { formula: "engineCc × €1.0", engineCc, age } };
  }
  const value = customsDutyBase * PETROL_RATE_DEFAULT;
  return { value, branch: "P1", details: { formula: "base × 15%", customsDutyBase, age } };
}

/**
 * Petrol, under 5 tons, ≥2800cc
 * 0-3 years → 12.5% (P3)
 * 3-7 years → 15% (P4)
 * 7+ years  → engineCc × €1.0 (P5)
 */
function calculatePetrolUnder5LargeEngine(
  customsDutyBase: number,
  engineCc: number,
  age: number
): CustomsDutyOutcome {
  if (age > 7) {
    const value = engineCc * OLD_TRUCK_CUSTOMS_RATE_PER_CM3;
    return { value, branch: "P5", details: { formula: "engineCc × €1.0", engineCc, age } };
  }
  if (age <= 3) {
    const value = customsDutyBase * PETROL_UNDER5_LARGE_ENGINE_RATE_0_3;
    return { value, branch: "P3", details: { formula: "base × 12.5%", customsDutyBase, age } };
  }
  const value = customsDutyBase * PETROL_RATE_DEFAULT;
  return { value, branch: "P4", details: { formula: "base × 15%", customsDutyBase, age } };
}

/**
 * Petrol, 5-20 tons (P6/P7) AND 20+ tons (P8/P9) — same logic, any engine volume
 * 0-7 years → 15%
 * 7+ years  → engineCc × €1.0
 */
function calculatePetrolHeavy(
  customsDutyBase: number,
  engineCc: number,
  age: number,
  weightClass: TruckWeightClass
): CustomsDutyOutcome {
  const old = age > 7;
  const branch =
    weightClass === "5to20" ? (old ? "P7" : "P6") : old ? "P9" : "P8";
  if (old) {
    const value = engineCc * OLD_TRUCK_CUSTOMS_RATE_PER_CM3;
    return { value, branch, details: { formula: "engineCc × €1.0", engineCc, age } };
  }
  const value = customsDutyBase * PETROL_RATE_DEFAULT;
  return { value, branch, details: { formula: "base × 15%", customsDutyBase, age } };
}

// ==================== DIESEL CUSTOMS DUTY FUNCTIONS ====================

/**
 * Diesel, under 5 tons, <2500cc
 * 0-5 years → 10% (D1)
 * 5-7 years → MAX(base × 10%, engineCc × €0.13) (D2)
 * 7+ years  → engineCc × €1.0 (D3)
 */
function calculateDieselUnder5SmallEngine(
  customsDutyBase: number,
  engineCc: number,
  age: number
): CustomsDutyOutcome {
  if (age > 7) {
    const value = engineCc * OLD_TRUCK_CUSTOMS_RATE_PER_CM3;
    return { value, branch: "D3", details: { formula: "engineCc × €1.0", engineCc, age } };
  }
  if (age > 5) {
    const percentageBased = customsDutyBase * DIESEL_RATE_UNDER5;
    const volumeBased = engineCc * DIESEL_UNDER5_SMALL_CM3_RATE;
    const value = Math.max(percentageBased, volumeBased);
    return {
      value,
      branch: "D2",
      details: {
        formula: "MAX(base × 10%, engineCc × €0.13)",
        percentageBased,
        volumeBased,
        chosen: percentageBased >= volumeBased ? "percentage" : "volume",
        age,
      },
    };
  }
  const value = customsDutyBase * DIESEL_RATE_UNDER5;
  return { value, branch: "D1", details: { formula: "base × 10%", customsDutyBase, age } };
}

/**
 * Diesel, under 5 tons, ≥2500cc
 * 0-7 years → 10% (D4)
 * 7+ years  → engineCc × €1.0 (D5)
 */
function calculateDieselUnder5LargeEngine(
  customsDutyBase: number,
  engineCc: number,
  age: number
): CustomsDutyOutcome {
  if (age > 7) {
    const value = engineCc * OLD_TRUCK_CUSTOMS_RATE_PER_CM3;
    return { value, branch: "D5", details: { formula: "engineCc × €1.0", engineCc, age } };
  }
  const value = customsDutyBase * DIESEL_RATE_UNDER5;
  return { value, branch: "D4", details: { formula: "base × 10%", customsDutyBase, age } };
}

/**
 * Diesel, 5-20 tons, any engine volume
 * 0-3 years → 15% (D6)
 * 3-5 years → 10% (D7)
 * 5-7 years → MAX(base × 10%, engineCc × €0.18) (D8)
 * 7+ years  → engineCc × €1.0 (D9)
 */
function calculateDiesel5to20(
  customsDutyBase: number,
  engineCc: number,
  age: number
): CustomsDutyOutcome {
  if (age > 7) {
    const value = engineCc * OLD_TRUCK_CUSTOMS_RATE_PER_CM3;
    return { value, branch: "D9", details: { formula: "engineCc × €1.0", engineCc, age } };
  }
  if (age > 5) {
    const percentageBased = customsDutyBase * DIESEL_RATE_5TO20_5_7;
    const volumeBased = engineCc * DIESEL_5TO20_CM3_RATE;
    const value = Math.max(percentageBased, volumeBased);
    return {
      value,
      branch: "D8",
      details: {
        formula: "MAX(base × 10%, engineCc × €0.18)",
        percentageBased,
        volumeBased,
        chosen: percentageBased >= volumeBased ? "percentage" : "volume",
        age,
      },
    };
  }
  if (age > 3) {
    const value = customsDutyBase * DIESEL_RATE_5TO20_3_5;
    return { value, branch: "D7", details: { formula: "base × 10%", customsDutyBase, age } };
  }
  const value = customsDutyBase * DIESEL_RATE_5TO20_0_3;
  return { value, branch: "D6", details: { formula: "base × 15%", customsDutyBase, age } };
}

/**
 * Diesel, 20+ tons, any engine volume
 * 0-3 years → 5% (D10)
 * 3-7 years → 10% (D11)
 * 7+ years  → engineCc × €1.0 (D12)
 */
function calculateDieselAbove20(
  customsDutyBase: number,
  engineCc: number,
  age: number
): CustomsDutyOutcome {
  if (age > 7) {
    const value = engineCc * OLD_TRUCK_CUSTOMS_RATE_PER_CM3;
    return { value, branch: "D12", details: { formula: "engineCc × €1.0", engineCc, age } };
  }
  if (age > 3) {
    const value = customsDutyBase * DIESEL_RATE_ABOVE20_3_7;
    return { value, branch: "D11", details: { formula: "base × 10%", customsDutyBase, age } };
  }
  const value = customsDutyBase * DIESEL_RATE_ABOVE20_0_3;
  return { value, branch: "D10", details: { formula: "base × 5%", customsDutyBase, age } };
}

// ==================== ELECTRIC CUSTOMS DUTY FUNCTION ====================

/**
 * Electric trucks — flat 15% for all cases (E1)
 */
function calculateElectricCustomsDuty(customsDutyBase: number): CustomsDutyOutcome {
  const value = customsDutyBase * ELECTRIC_CUSTOMS_DUTY_RATE;
  return { value, branch: "E1", details: { formula: "base × 15%", customsDutyBase } };
}

// ==================== ROUTER ====================

function calculateCustomsDuty(
  engineType: TruckEngineType,
  weightClass: TruckWeightClass,
  engineVolumeCm3: number,
  customsDutyBase: number,
  vehicleYear: number,
  vehicleMonth: number,
  vehicleDay: number
): CustomsDutyOutcome {
  const age = calculateVehicleAge(vehicleYear, vehicleMonth, vehicleDay);
  const engineCc = engineVolumeCm3;

  let outcome: CustomsDutyOutcome;
  let ccThreshold: number | null = null;

  if (engineType === "electric") {
    outcome = calculateElectricCustomsDuty(customsDutyBase);
  } else if (engineType === "petrol") {
    if (weightClass === "under5") {
      ccThreshold = PETROL_ENGINE_CC_THRESHOLD;
      outcome =
        engineCc < PETROL_ENGINE_CC_THRESHOLD
          ? calculatePetrolUnder5SmallEngine(customsDutyBase, engineCc, age)
          : calculatePetrolUnder5LargeEngine(customsDutyBase, engineCc, age);
    } else {
      outcome = calculatePetrolHeavy(customsDutyBase, engineCc, age, weightClass);
    }
  } else {
    // diesel
    if (weightClass === "under5") {
      ccThreshold = DIESEL_ENGINE_CC_THRESHOLD;
      outcome =
        engineCc < DIESEL_ENGINE_CC_THRESHOLD
          ? calculateDieselUnder5SmallEngine(customsDutyBase, engineCc, age)
          : calculateDieselUnder5LargeEngine(customsDutyBase, engineCc, age);
    } else if (weightClass === "5to20") {
      outcome = calculateDiesel5to20(customsDutyBase, engineCc, age);
    } else {
      outcome = calculateDieselAbove20(customsDutyBase, engineCc, age);
    }
  }


  return outcome;
}

// ==================== MAIN CALCULATION ====================

export function calculateTruckTaxes(params: TruckTaxParams): TruckTaxResult {
  const {
    vehiclePriceEur,
    auctionFeeEur,
    shippingPriceEur,
    engineVolumeCm3,
    weightClass,
    vehicleYear,
    vehicleMonth,
    vehicleDay,
    engineType,
    importer,
  } = params;

  
  // Customs duty base differs by importer type
  const includesShippingInCustoms = importer === "legal";
  const customsDutyBase = includesShippingInCustoms
    ? vehiclePriceEur + auctionFeeEur + shippingPriceEur
    : vehiclePriceEur + auctionFeeEur;

  const baseValue = vehiclePriceEur + auctionFeeEur;

  const customsOutcome = calculateCustomsDuty(
    engineType,
    weightClass,
    engineVolumeCm3,
    customsDutyBase,
    vehicleYear,
    vehicleMonth,
    vehicleDay
  );
  const customsDuty = customsOutcome.value;

  // VAT: differs by importer type
  // Individual: (vehiclePrice + auctionFee + customsDuty) × 20%
  // Legal: (vehiclePrice + auctionFee + customsDuty + shipping) × 20%
  const vatBase = includesShippingInCustoms
    ? customsDuty + baseValue + shippingPriceEur
    : customsDuty + baseValue;
  const vat = vatBase * VAT_RATE;

  // Environmental tax: calendar-year-based age (vehicleYear → "year 1"), same
  // base for both importers (no customsDuty, no shipping).
  const envTaxBase = includesShippingInCustoms ? baseValue + shippingPriceEur : baseValue;
  const envTax = calculateEnvironmentalTax(envTaxBase , vehicleYear);
  const environmentalTax = envTax.amount;

  const total = customsDuty + vat + environmentalTax;

  const result: TruckTaxResult = {
    customsDuty,
    vat,
    environmentalTax,
    total,
  };
  return result;
}
