const ENV_TAX_RATES = {
  "0-2": 0.02,
  "3-4": 0.04,
  "5-9": 0.06,
  "10-14": 0.12,
  "15+": 0.24,
} as const;

export type EnvAgeCategory = keyof typeof ENV_TAX_RATES;

function getEnvAgeCategory(envAge: number): EnvAgeCategory {
  if (envAge <= 2) return "0-2";
  if (envAge <= 4) return "3-4";
  if (envAge <= 9) return "5-9";
  if (envAge <= 14) return "10-14";
  return "15+";
}

export type EnvironmentalTaxResult = {
  envAge: number;
  ageCategory: EnvAgeCategory;
  rate: number;
  amount: number;
};

/**
 * Environmental tax for trucks, quadricycles, and snowmobiles.
 *
 * Age is the calendar-year difference (no month/day, no +1).
 * Today 2026:
 *   2026 → 0 → "0-2" → 2%
 *   2024 → 2 → "0-2" → 2%
 *   2023 → 3 → "3-4" → 4%
 *   2017 → 9 → "5-9" → 6%
 *
 * baseValue is the EUR sum (vehiclePrice + auctionFee). Caller decides
 * whether to round the returned amount.
 */
export function calculateEnvironmentalTax(
  baseValue: number,
  vehicleYear: number
): EnvironmentalTaxResult {
  const envAge = new Date().getFullYear() - vehicleYear;
  const ageCategory = getEnvAgeCategory(envAge);
  const rate = ENV_TAX_RATES[ageCategory];
  const amount = baseValue * rate;
  return { envAge, ageCategory, rate, amount };
}
