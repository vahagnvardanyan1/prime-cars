import type { CalculatorResponse } from "./calculateVehicleTaxes";
import { calculateVehicleTaxes, mapEngineType, formatDate } from "./calculateVehicleTaxes";
import { calculateTruckTaxes, type TruckWeightClass } from "./calculateTruckTaxes";
import { calculateQuadricycleTaxes } from "./calculateQuadricycleTaxes";
import { calculateMotorcycleTaxes } from "./calculateMotorcycleTaxes";
import { calculateSnowmobileTaxes } from "./calculateSnowmobileTaxes";
import { calculateJetSkiTaxes } from "./calculateJetSkiTaxes";

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
  icePowerExceedsElectric: boolean;
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

  const engineType: "diesel" | "electric" | "petrol" =
    engine === "diesel" ? "diesel" : engine === "electric" ? "electric" : "petrol";

  const vehiclePriceEur = vehiclePriceUsd / eurUsdRate;
  const auctionFeeEur = auctionFeeUsd / eurUsdRate;
  const shippingPriceEur = shippingPriceUsd / eurUsdRate;

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
  return usd;
}

export function calculateQuadricycleResult(params: VehicleCalcParams): CalculatorResponse {
  const { vehiclePriceUsd, auctionFeeUsd, shippingPriceUsd, engineVolumeCm3, year, eurUsdRate, importer, hasReverse } = params;
  const eurInputs = {
    vehiclePriceEur: vehiclePriceUsd / eurUsdRate,
    auctionFeeEur: auctionFeeUsd / eurUsdRate,
    shippingPriceEur: shippingPriceUsd / eurUsdRate,
  };
  const result = calculateQuadricycleTaxes({
    ...eurInputs,
    engineVolumeCm3,
    vehicleYear: year,
    importer,
    hasReverse,
  });
  const usd = applyRateCompensation(result, eurUsdRate, "quadricycle");
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
    day, month, year, importer, highGroundClearance, icePowerExceedsElectric, eurUsdRate,
  } = params;
  const shippingForTax = importer === "individual" ? 0 : shippingPriceUsd;
  const totalPriceEur = Math.round((vehiclePriceUsd + shippingForTax + auctionFeeUsd) / eurUsdRate);
  // Backend expects engine volume as an integer cm³ (canonical unit).
  // engineVolumeCm3 should already be normalized via normalizeEngineVolumeToCm3,
  // but Math.round here defends against any non-integer reaching the API.
  const result = await calculateVehicleTaxes({
    price: totalPriceEur,
    volume: engineVolumeCm3,
    engineType: mapEngineType(engine),
    date: formatDate({ day, month, year: String(year) }),
    isLegal: importer === "legal" ? 1 : 0,
    offRoad: highGroundClearance ? 1 : 0,
    ICEpower: icePowerExceedsElectric ? 1 : 0,
  });
  if (!result.success) throw new Error(result.error);
  return result.data;
}

export function calculateMotorcycleResult(params: VehicleCalcParams): CalculatorResponse {
  const { vehiclePriceUsd, auctionFeeUsd, shippingPriceUsd, engineVolumeCm3, engine, eurUsdRate, importer } = params;
  const eurInputs = {
    vehiclePriceEur: vehiclePriceUsd / eurUsdRate,
    auctionFeeEur: auctionFeeUsd / eurUsdRate,
    shippingPriceEur: shippingPriceUsd / eurUsdRate,
  };
  const result = calculateMotorcycleTaxes({
    ...eurInputs,
    engineVolumeCm3,
    importer,
    isElectric: engine === "electric",
  });
  const usd = applyRateCompensation(result, eurUsdRate, "motorcycle");
  return usd;
}
