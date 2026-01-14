import { API_BASE_URL } from "@/i18n/config";

export type ExchangeRates = {
  USD: string;
  EUR: string;
  [key: string]: string | null;
};

export type FetchExchangeRatesResult =
  | { success: true; data: ExchangeRates }
  | { success: false; error: string };

/**
 * Fetch exchange rates from the public API
 */
export const fetchExchangeRates = async (): Promise<FetchExchangeRatesResult> => {
  try {
    const url = `${API_BASE_URL}/exchange-rate/all-rates`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP error! status: ${response.status}`,
      };
    }

    const result = await response.json();
    
    // Handle the API response structure: { status: "success", data: { USD: "...", EUR: "...", ... } }
    const rates = result.data || result;
    
    return {
      success: true,
      data: rates,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Calculate EUR/USD rate from the exchange rates
 */
export const calculateEurUsdRate = (rates: ExchangeRates): string => {
  const eur = parseFloat(rates.EUR);
  const usd = parseFloat(rates.USD);
  
  if (isNaN(eur) || isNaN(usd) || usd === 0) {
    return "0";
  }
  
  return (eur / usd).toFixed(4);
};
