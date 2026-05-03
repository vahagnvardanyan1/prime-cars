import type { CalculatorResponse } from "./calculateVehicleTaxes";
import { calculateVehicleTaxes, mapEngineType, formatDate } from "./calculateVehicleTaxes";
import { calculateTruckTaxes, type TruckWeightClass } from "./calculateTruckTaxes";
import { calculateQuadricycleTaxes } from "./calculateQuadricycleTaxes";
import { calculateMotorcycleTaxes } from "./calculateMotorcycleTaxes";
import { calculateSnowmobileTaxes } from "./calculateSnowmobileTaxes";
import { calculateJetSkiTaxes } from "./calculateJetSkiTaxes";
import { truckLog, truckWarn } from "./truckDebug";

export type VehicleCalcParams = {
  vehiclePriceUsd: number;
  auctionFeeUsd: number;
  shippingPriceUsd: number;
  engineVolumeCm3: number; // canonical cm³; caller passes 0 for electric
  engine: string; // "gasoline" | "diesel" | "electric" | "hybrid"
  year: number;
  day: string;
  month: string;
  importer: string; // "legal" | "individual"
  highGroundClearance: boolean;
  weightClass: TruckWeightClass | "";
  hasReverse: boolean;
  eurUsdRate: number;
};

/**
 * Calculators produce EUR values. This function converts EUR → USD
 * by multiplying by eurUsdRate (single multiplication).
 *
 * PREVIOUS VERSION (kept for reference):
 * Used eurUsdRate² here, combined with CalculatorResults' × eurUsdRate = rate³ total.
 * const r2 = eurUsdRate * eurUsdRate;
 * globTax: Math.round(result.customsDuty * r2),
 */
function applyRateCompensation(
  result: { customsDuty: number; vat: number; environmentalTax: number; total: number },
  eurUsdRate: number,
  type: string
): CalculatorResponse {
  return {
    globTax: Math.round(result.customsDuty * eurUsdRate),
    nds: Math.round(result.vat * eurUsdRate),
    envTaxPay: Math.round(result.environmentalTax * eurUsdRate),
    sumPay: Math.round(result.total * eurUsdRate),
    type,
  };
}

export function calculateTruckResult(params: VehicleCalcParams): CalculatorResponse {
  const { vehiclePriceUsd, auctionFeeUsd, shippingPriceUsd, engineVolumeCm3, weightClass, year, day, month, engine, eurUsdRate, importer } = params;

  truckLog("entry/usd", {
    vehiclePriceUsd,
    auctionFeeUsd,
    shippingPriceUsd,
    engineVolumeCm3,
    weightClass,
    year,
    month,
    day,
    rawEngine: engine,
    importer,
    eurUsdRate,
  });

  const engineType: "diesel" | "electric" | "petrol" =
    engine === "diesel" ? "diesel" : engine === "electric" ? "electric" : "petrol";
  const hybridFallback = engine === "hybrid";
  const unknownEngineFallback =
    engine !== "diesel" && engine !== "electric" && engine !== "gasoline" && engine !== "hybrid";

  truckLog("entry/engine-resolved", { rawEngine: engine, engineType, hybridFallback, unknownEngineFallback });
  if (hybridFallback) {
    truckWarn("entry/engine-resolved", {
      message: "Hybrid engine for truck silently mapped to petrol — verify expected behavior.",
      rawEngine: engine,
    });
  }
  if (unknownEngineFallback) {
    truckWarn("entry/engine-resolved", {
      message: "Unknown engine value for truck silently mapped to petrol.",
      rawEngine: engine,
    });
  }

  const vehiclePriceEur = vehiclePriceUsd / eurUsdRate;
  const auctionFeeEur = auctionFeeUsd / eurUsdRate;
  const shippingPriceEur = shippingPriceUsd / eurUsdRate;
  truckLog("entry/eur", { vehiclePriceEur, auctionFeeEur, shippingPriceEur, eurUsdRate });

  debugger
  const result = calculateTruckTaxes({
    vehiclePriceEur,
    auctionFeeEur,
    shippingPriceEur,
    engineVolumeCm3,
    weightClass: weightClass as TruckWeightClass,
    vehicleYear: year,
    vehicleMonth: parseInt(month),
    vehicleDay: parseInt(day),
    engineType,
    importer,
  });
  const usd = applyRateCompensation(result, eurUsdRate, "truck");
  truckLog("result/usd", { ...usd, eurUsdRate });
  return usd;
}

export function calculateQuadricycleResult(params: VehicleCalcParams): CalculatorResponse {
  const { vehiclePriceUsd, auctionFeeUsd, shippingPriceUsd, engineVolumeCm3, year, eurUsdRate, importer, hasReverse } = params;
  console.log("[Quadricycle/entry-usd]", {
    vehiclePriceUsd, auctionFeeUsd, shippingPriceUsd, importer, hasReverse, engineVolumeCm3, year, eurUsdRate,
  });
  const eurInputs = {
    vehiclePriceEur: vehiclePriceUsd / eurUsdRate,
    auctionFeeEur: auctionFeeUsd / eurUsdRate,
    shippingPriceEur: shippingPriceUsd / eurUsdRate,
  };
  console.log("[Quadricycle/entry-eur]", { ...eurInputs, eurUsdRate });
  const result = calculateQuadricycleTaxes({
    ...eurInputs,
    engineVolumeCm3,
    vehicleYear: year,
    importer,
    hasReverse,
  });
  console.log("[Quadricycle/result-eur]", result);
  const usd = applyRateCompensation(result, eurUsdRate, "quadricycle");
  console.log("[Quadricycle/result-usd]", { ...usd, eurUsdRate });
  return usd;
}

export function calculateSnowmobileResult(params: VehicleCalcParams): CalculatorResponse {
  const { vehiclePriceUsd, auctionFeeUsd, shippingPriceUsd, year, eurUsdRate, importer } = params;
  const result = calculateSnowmobileTaxes({
    vehiclePriceEur: vehiclePriceUsd / eurUsdRate,
    auctionFeeEur: auctionFeeUsd / eurUsdRate,
    shippingPriceEur: shippingPriceUsd / eurUsdRate,
    vehicleYear: year,
    importer,
  });
  return applyRateCompensation(result, eurUsdRate, "snowmobile");
}

export function calculateJetSkiResult(params: VehicleCalcParams): CalculatorResponse {
  const { vehiclePriceUsd, auctionFeeUsd, shippingPriceUsd, eurUsdRate, importer } = params;
  const result = calculateJetSkiTaxes({
    vehiclePriceEur: vehiclePriceUsd / eurUsdRate,
    auctionFeeEur: auctionFeeUsd / eurUsdRate,
    shippingPriceEur: shippingPriceUsd / eurUsdRate,
    importer,
  });
  return applyRateCompensation(result, eurUsdRate, "jetski");
}

export async function calculatePassengerResult(params: VehicleCalcParams): Promise<CalculatorResponse> {
  const {
    vehiclePriceUsd, auctionFeeUsd, shippingPriceUsd, engine, engineVolumeCm3,
    day, month, year, importer, highGroundClearance, eurUsdRate,
  } = params;
  const shippingForTax = importer === "individual" ? 0 : shippingPriceUsd;
  const totalPriceEur = Math.round((vehiclePriceUsd + shippingForTax + auctionFeeUsd) / eurUsdRate);
  // Backend currently expects engine volume in liters; convert from canonical cm³.
  const volumeLiters = engineVolumeCm3 > 0 ? engineVolumeCm3 / 1000 : 0;
  debugger
  const result = await calculateVehicleTaxes({
    price: totalPriceEur,
    volume: volumeLiters,
    engineType: mapEngineType(engine),
    date: formatDate({ day, month, year: String(year) }),
    isLegal: importer === "legal" ? 1 : 0,
    offRoad: highGroundClearance ? 1 : 0,
    ICEpower: 0,
  });
  if (!result.success) throw new Error(result.error);
  return result.data;
}

export function calculateMotorcycleResult(params: VehicleCalcParams): CalculatorResponse {
  const { vehiclePriceUsd, auctionFeeUsd, shippingPriceUsd, engineVolumeCm3, engine, eurUsdRate, importer } = params;
  console.log("[Motorcycle/entry-usd]", {
    vehiclePriceUsd, auctionFeeUsd, shippingPriceUsd, importer, engineVolumeCm3, engine, eurUsdRate,
  });
  const eurInputs = {
    vehiclePriceEur: vehiclePriceUsd / eurUsdRate,
    auctionFeeEur: auctionFeeUsd / eurUsdRate,
    shippingPriceEur: shippingPriceUsd / eurUsdRate,
  };
  console.log("[Motorcycle/entry-eur]", { ...eurInputs, eurUsdRate });
  const result = calculateMotorcycleTaxes({
    ...eurInputs,
    engineVolumeCm3,
    importer,
    isElectric: engine === "electric",
  });
  console.log("[Motorcycle/result-eur]", result);
  const usd = applyRateCompensation(result, eurUsdRate, "motorcycle");
  console.log("[Motorcycle/result-usd]", { ...usd, eurUsdRate });
  return usd;
}
