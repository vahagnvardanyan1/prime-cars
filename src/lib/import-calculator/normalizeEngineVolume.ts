export type EngineVolumeNormalized = {
  cm3: number;
  assumedUnit: "L" | "cm³";
};

/**
 * Normalize a user-entered engine volume to cm³.
 *
 * Rule: a decimal point means liters (multiply by 1000); an integer is taken
 * literally as cm³. Examples: "2.5" → 2500 cm³ (L), "2500" → 2500 cm³, "16" → 16 cm³.
 *
 * The input must be the raw string (not parseFloat'd) so we can detect the
 * decimal separator. Both "." and "," are accepted.
 */
export function normalizeEngineVolumeToCm3(input: string): EngineVolumeNormalized {
  const num = parseFloat(input);
  if (!Number.isFinite(num) || num <= 0) return { cm3: 0, assumedUnit: "cm³" };
  const hasDecimal = input.includes(".") || input.includes(",");
  if (hasDecimal) return { cm3: Math.round(num * 1000), assumedUnit: "L" };
  return { cm3: Math.round(num), assumedUnit: "cm³" };
}
