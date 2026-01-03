export type ImportCostInput = {
  vehiclePriceUsd: number;
  originCountry: string;
  vehicleType: string;
};

export type ImportCostBreakdown = {
  basePrice: number;
  shippingCost: number;
  customsDuty: number;
  inspectionFees: number;
  documentationFees: number;
  serviceFee: number;
  totalCost: number;
};

export const calculateImportCosts = ({
  vehiclePriceUsd,
  originCountry,
}: ImportCostInput): ImportCostBreakdown => {
  const basePrice = Number.isFinite(vehiclePriceUsd) ? vehiclePriceUsd : 0;

  // Mock calculation logic (migrated from Vite app)
  const shippingCost =
    originCountry === "japan" ? basePrice * 0.08 : basePrice * 0.12;
  const customsDuty = basePrice * 0.15;
  const inspectionFees = 850;
  const documentationFees = 450;
  const serviceFee = basePrice * 0.025;

  return {
    basePrice,
    shippingCost,
    customsDuty,
    inspectionFees,
    documentationFees,
    serviceFee,
    totalCost:
      basePrice +
      shippingCost +
      customsDuty +
      inspectionFees +
      documentationFees +
      serviceFee,
  };
};
