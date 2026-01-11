/**
 * Utility functions to translate vehicle specifications (engine type, transmission, fuel type)
 */

type TranslationFunction = (key: string) => string;

/**
 * Translates engine type to localized string
 * @param engineType - The engine type value (e.g., "GASOLINE", "DIESEL")
 * @param t - Translation function from useTranslations("carDetails")
 * @returns Localized engine type string
 */
export function translateEngineType(engineType: string | undefined, t: TranslationFunction): string {
  if (!engineType) return "";
  
  const normalized = engineType.toUpperCase().trim();
  
  // Try to find exact match in engineTypes translations
  try {
    return t(`engineTypes.${normalized}`);
  } catch {
    // If translation key doesn't exist, return capitalized version
    return engineType.charAt(0).toUpperCase() + engineType.slice(1).toLowerCase();
  }
}

/**
 * Translates transmission type to localized string
 * @param transmission - The transmission type value (e.g., "AUTOMATIC", "MANUAL")
 * @param t - Translation function from useTranslations("carDetails")
 * @returns Localized transmission type string
 */
export function translateTransmission(transmission: string | undefined, t: TranslationFunction): string {
  if (!transmission) return "";
  
  const normalized = transmission.toUpperCase().trim().replace(/[\s-]/g, "_");
  
  // Try to find exact match in transmissionTypes translations
  try {
    return t(`transmissionTypes.${normalized}`);
  } catch {
    // If translation key doesn't exist, return capitalized version
    return transmission.charAt(0).toUpperCase() + transmission.slice(1).toLowerCase();
  }
}

/**
 * Translates fuel type to localized string
 * @param fuelType - The fuel type value (e.g., "GASOLINE", "DIESEL")
 * @param t - Translation function from useTranslations("carDetails")
 * @returns Localized fuel type string
 */
export function translateFuelType(fuelType: string | undefined, t: TranslationFunction): string {
  if (!fuelType) return "";
  
  const normalized = fuelType.toUpperCase().trim().replace(/[\s-]/g, "_");
  
  // Try to find exact match in fuelTypes translations
  try {
    return t(`fuelTypes.${normalized}`);
  } catch {
    // If translation key doesn't exist, return capitalized version
    return fuelType.charAt(0).toUpperCase() + fuelType.slice(1).toLowerCase();
  }
}
