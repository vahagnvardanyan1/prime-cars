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
  engineVolume: number; // liters; caller passes 0 for electric
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
  const { vehiclePriceUsd, auctionFeeUsd, shippingPriceUsd, engineVolume, weightClass, year, day, month, engine, eurUsdRate, importer } = params;
  const result = calculateTruckTaxes({
    vehiclePriceEur: vehiclePriceUsd / eurUsdRate,
    auctionFeeEur: auctionFeeUsd / eurUsdRate,
    shippingPriceEur: shippingPriceUsd / eurUsdRate,
    engineVolumeLiters: engineVolume,
    weightClass: weightClass as TruckWeightClass,
    vehicleYear: year,
    vehicleMonth: parseInt(month),
    vehicleDay: parseInt(day),
    engineType: engine === "diesel" ? "diesel" : engine === "electric" ? "electric" : "petrol",
    importer,
  });
  return applyRateCompensation(result, eurUsdRate, "truck");
}

export function calculateQuadricycleResult(params: VehicleCalcParams): CalculatorResponse {
  const { vehiclePriceUsd, auctionFeeUsd, shippingPriceUsd, engineVolume, year, day, month, eurUsdRate, importer, hasReverse } = params;
  const result = calculateQuadricycleTaxes({
    vehiclePriceEur: vehiclePriceUsd / eurUsdRate,
    auctionFeeEur: auctionFeeUsd / eurUsdRate,
    shippingPriceEur: shippingPriceUsd / eurUsdRate,
    engineVolumeLiters: engineVolume,
    vehicleYear: year,
    vehicleMonth: parseInt(month),
    vehicleDay: parseInt(day),
    importer,
    hasReverse,
  });
  return applyRateCompensation(result, eurUsdRate, "quadricycle");
}

export function calculateSnowmobileResult(params: VehicleCalcParams): CalculatorResponse {
  const { vehiclePriceUsd, auctionFeeUsd, shippingPriceUsd, year, day, month, eurUsdRate, importer } = params;
  const result = calculateSnowmobileTaxes({
    vehiclePriceEur: vehiclePriceUsd / eurUsdRate,
    auctionFeeEur: auctionFeeUsd / eurUsdRate,
    shippingPriceEur: shippingPriceUsd / eurUsdRate,
    vehicleYear: year,
    vehicleMonth: parseInt(month),
    vehicleDay: parseInt(day),
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
    vehiclePriceUsd, auctionFeeUsd, shippingPriceUsd, engine, engineVolume,
    day, month, year, importer, highGroundClearance, eurUsdRate,
  } = params;
  const shippingForTax = importer === "individual" ? 0 : shippingPriceUsd;
  const totalPriceEur = Math.round((vehiclePriceUsd + shippingForTax + auctionFeeUsd) / eurUsdRate);
  console.log('[Passenger] vehiclePriceUsd:', vehiclePriceUsd, 'auctionFeeUsd:', auctionFeeUsd, 'shippingPriceUsd (cityTax):', shippingPriceUsd, 'shippingForTax:', shippingForTax, 'totalPriceEur:', totalPriceEur, 'eurUsdRate:', eurUsdRate);
  const result = await calculateVehicleTaxes({
    price: totalPriceEur,
    volume: engineVolume,
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
  const { vehiclePriceUsd, auctionFeeUsd, shippingPriceUsd, engineVolume, engine, eurUsdRate, importer } = params;
  const result = calculateMotorcycleTaxes({
    vehiclePriceEur: vehiclePriceUsd / eurUsdRate,
    auctionFeeEur: auctionFeeUsd / eurUsdRate,
    shippingPriceEur: shippingPriceUsd / eurUsdRate,
    engineVolumeLiters: engineVolume,
    importer,
    isElectric: engine === "electric",
  });
  return applyRateCompensation(result, eurUsdRate, "motorcycle");
}
