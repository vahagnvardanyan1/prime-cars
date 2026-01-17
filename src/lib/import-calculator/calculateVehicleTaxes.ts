import { API_BASE_URL } from "@/i18n/config";

export type CalculatorParams = {
  price: number;
  volume: number;
  engineType: number;
  date: string;
  isLegal?: number;
  offRoad?: number;
  ICEpower?: number;
};

export type CalculatorResponse = {
  globTax: number;
  envTaxPay: number;
  nds: number;
  sumPay: number;
  type: string;
};

export type CalculatorResult =
  | { success: true; data: CalculatorResponse }
  | { success: false; error: string };

/**
 * Map engine type string to API engine type ID
 */
export const mapEngineType = (engine: string): number => {
  const engineMap: Record<string, number> = {
    gasoline: 1,
    diesel: 2,
    electric: 3,
    hybrid: 4, // Generic hybrid
  };
  return engineMap[engine] || 1;
};

/**
 * Format date to DD-MM-YYYY format
 */
export const formatDate = ({ day, month, year }: { day: string; month: string; year: string }): string => {
  const paddedDay = day.padStart(2, "0");
  const paddedMonth = month.padStart(2, "0");
  return `${paddedDay}-${paddedMonth}-${year}`;
};

/**
 * Calculate vehicle import taxes using the API
 */
export const calculateVehicleTaxes = async (params: CalculatorParams): Promise<CalculatorResult> => {
  try {
    const queryParams = new URLSearchParams({
      price: params.price.toString(),
      volume: params.volume.toString(),
      engineType: params.engineType.toString(),
      date: params.date,
      ...(params.isLegal !== undefined && { isLegal: params.isLegal.toString() }),
      ...(params.offRoad !== undefined && { offRoad: params.offRoad.toString() }),
      ...(params.ICEpower !== undefined && { ICEpower: params.ICEpower.toString() }),
    });

    const response = await fetch(`${API_BASE_URL}/calculator/vehicle-taxes?${queryParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Calculation failed" }));
      return {
        success: false,
        error: errorData.error || `HTTP error! status: ${response.status}`,
      };
    }

    const result = await response.json();
    
    // Handle the API response structure: { status: "success", data: { ... } }
    const calculatorData = result.data || result;
    
    return {
      success: true,
      data: {
        globTax: calculatorData.globTax,
        envTaxPay: calculatorData.envTaxPay,
        nds: calculatorData.nds,
        sumPay: calculatorData.sumPay,
        type: calculatorData.type,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
