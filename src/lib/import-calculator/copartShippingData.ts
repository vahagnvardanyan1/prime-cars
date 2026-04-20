/**
 * COPART Shipping Prices - Hardcoded fallback data
 * Source: COPART official pricing PDF
 * Destination: Gyumri (Armenia)
 *
 * Routes:
 * - US cities via Houston, Los Angeles, New York, Savannah ports
 * - Pacific Northwest cities via Seattle-Poti route
 * - Canada cities via Toronto-Poti route
 *
 * NOTE: This is fallback data. Live prices are fetched from the API.
 * Update this file when COPART updates their pricing.
 */

export type CopartShippingEntry = {
  city: string;
  state: string;
  port: string;
  price: number;
};

/**
 * US cities shipping to Gyumri via US ports
 */
export const COPART_US_SHIPPING: CopartShippingEntry[] = [
  { city: "ABILENE", state: "Texas", port: "Houston", price: 2275 },
  { city: "ADELANTO", state: "California", port: "Los Angeles", price: 2525 },
  { city: "AKRON", state: "Ohio", port: "New York", price: 2150 },
  { city: "ALBANY", state: "New York", port: "New York", price: 1925 },
  { city: "ALBUQUERQUE", state: "New Mexico", port: "Houston", price: 2550 },
  { city: "ALTOONA", state: "Pennsylvania", port: "New York", price: 2100 },
  { city: "AMARILLO", state: "Texas", port: "Houston", price: 2275 },
  { city: "ANCHORAGE", state: "Alaska", port: "Los Angeles", price: 5600 },
  { city: "ANCHORAGE SOUTH", state: "Alaska", port: "Los Angeles", price: 5600 },
  { city: "ANDREWS", state: "Texas", port: "Houston", price: 2300 },
  { city: "ANTELOPE", state: "California", port: "Los Angeles", price: 2650 },
  { city: "APPLETON", state: "Wisconsin", port: "Savannah", price: 2350 },
  { city: "ATLANTA EAST", state: "Georgia", port: "Savannah", price: 1925 },
  { city: "ATLANTA NORTH", state: "Georgia", port: "Savannah", price: 1925 },
  { city: "ATLANTA SOUTH", state: "Georgia", port: "Savannah", price: 1925 },
  { city: "ATLANTA WEST", state: "Georgia", port: "Savannah", price: 1925 },
  { city: "AUGUSTA", state: "Georgia", port: "Savannah", price: 1925 },
  { city: "AUSTIN", state: "Texas", port: "Houston", price: 2125 },
  { city: "BAKERSFIELD", state: "California", port: "Los Angeles", price: 2550 },
  { city: "BALTIMORE", state: "Maryland", port: "New York", price: 1975 },
  { city: "BALTIMORE EAST", state: "Maryland", port: "New York", price: 1975 },
  { city: "BATON ROUGE", state: "Louisiana", port: "Savannah", price: 2025 },
  { city: "BILLINGS", state: "Montana", port: "Houston", price: 3100 },
  { city: "BIRMINGHAM", state: "Alabama", port: "Savannah", price: 2000 },
  { city: "BISMARCK", state: "North Dakota", port: "New York", price: 2975 },
  { city: "BOISE", state: "Idaho", port: "Los Angeles", price: 3250 },
  { city: "BUFFALO", state: "New York", port: "New York", price: 2150 },
  { city: "CANDIA", state: "New Hampshire", port: "New York", price: 2050 },
  { city: "CARTERSVILLE", state: "Georgia", port: "Savannah", price: 1925 },
  { city: "CASPER", state: "Wyoming", port: "Los Angeles", price: 3650 },
  { city: "CHAMBERSBURG", state: "Pennsylvania", port: "New York", price: 2050 },
  { city: "CHARLESTON", state: "South Carolina", port: "Savannah", price: 1850 },
  { city: "CHARLESTON", state: "West Virginia", port: "New York", price: 2175 },
  { city: "CHICAGO NORTH", state: "Illinois", port: "New York", price: 2250 },
  { city: "CHICAGO SOUTH", state: "Illinois", port: "New York", price: 2250 },
  { city: "CHINA GROVE", state: "North Carolina", port: "Savannah", price: 1900 },
  { city: "CICERO", state: "Indiana", port: "New York", price: 2250 },
  { city: "CLEVELAND EAST", state: "Ohio", port: "New York", price: 2100 },
  { city: "CLEVELAND WEST", state: "Ohio", port: "New York", price: 2100 },
  { city: "COLORADO SPRINGS", state: "Colorado", port: "Houston", price: 2550 },
  { city: "COLUMBIA", state: "Missouri", port: "Savannah", price: 2225 },
  { city: "COLUMBIA", state: "South Carolina", port: "Savannah", price: 1825 },
  { city: "COLUMBUS", state: "Ohio", port: "New York", price: 2125 },
  { city: "CONCORD", state: "North Carolina", port: "Savannah", price: 1900 },
  { city: "CORPUS CHRISTI", state: "Texas", port: "Houston", price: 2100 },
  { city: "CRASHEDTOYS ATLANTA", state: "Georgia", port: "Savannah", price: 1875 },
  { city: "CRASHEDTOYS DALLAS", state: "Texas", port: "Houston", price: 2100 },
  { city: "CRASHEDTOYS EAST BETHEL", state: "Minnesota", port: "New York", price: 2275 },
  { city: "CRASHEDTOYS ELDRIDGE", state: "Iowa", port: "New York", price: 2425 },
  { city: "CRASHEDTOYS SACRAMENTO", state: "California", port: "Los Angeles", price: 2650 },
  { city: "CULPEPER", state: "Virginia", port: "New York", price: 2050 },
  { city: "DALLAS", state: "Texas", port: "Houston", price: 2125 },
  { city: "DALLAS SOUTH", state: "Texas", port: "Houston", price: 2125 },
  { city: "DANVILLE", state: "Virginia", port: "Savannah", price: 2025 },
  { city: "DAVENPORT", state: "Iowa", port: "New York", price: 2300 },
  { city: "DAYTON", state: "Ohio", port: "New York", price: 2150 },
  { city: "DENVER", state: "Colorado", port: "Houston", price: 2525 },
  { city: "DENVER CENTRAL", state: "Colorado", port: "Houston", price: 2525 },
  { city: "DENVER SOUTH", state: "Colorado", port: "Houston", price: 2525 },
  { city: "DES MOINES", state: "Iowa", port: "New York", price: 2300 },
  { city: "DETROIT", state: "Michigan", port: "New York", price: 2200 },
  { city: "DOTHAN", state: "Alabama", port: "Savannah", price: 1975 },
  { city: "DYER", state: "Indiana", port: "Savannah", price: 2225 },
  { city: "EARLINGTON", state: "Kentucky", port: "Savannah", price: 2150 },
  { city: "EL PASO", state: "Texas", port: "Houston", price: 2300 },
  { city: "EUGENE", state: "Oregon", port: "Los Angeles", price: 3100 },
  { city: "EXETER", state: "Rhode Island", port: "New York", price: 2000 },
  { city: "FAIRBURN", state: "Georgia", port: "Savannah", price: 1925 },
  { city: "FAYETTEVILLE", state: "Arkansas", port: "Houston", price: 2325 },
  { city: "FLINT", state: "Michigan", port: "New York", price: 2225 },
  { city: "FORT WAYNE", state: "Indiana", port: "New York", price: 2275 },
  { city: "FREDERICKSBURG", state: "Virginia", port: "New York", price: 2000 },
  { city: "FREETOWN", state: "Massachusetts", port: "New York", price: 2025 },
  { city: "FREMONT", state: "California", port: "Los Angeles", price: 2650 },
  { city: "FRESNO", state: "California", port: "Los Angeles", price: 2575 },
  { city: "FT. PIERCE", state: "Florida", port: "Savannah", price: 1975 },
  { city: "FT. WORTH", state: "Texas", port: "Houston", price: 2125 },
  { city: "GASTONIA", state: "North Carolina", port: "Savannah", price: 1950 },
  { city: "GLASSBORO EAST", state: "New Jersey", port: "New York", price: 1875 },
  { city: "GLASSBORO WEST", state: "New Jersey", port: "New York", price: 1875 },
  { city: "GRAHAM", state: "Washington", port: "Los Angeles", price: 3250 },
  { city: "GREER", state: "South Carolina", port: "Savannah", price: 1900 },
  { city: "GRENADA", state: "Mississippi", port: "Savannah", price: 2075 },
  { city: "HAMMOND", state: "Indiana", port: "New York", price: 2275 },
  { city: "HAMPTON", state: "Virginia", port: "New York", price: 2025 },
  { city: "HARRISBURG", state: "Pennsylvania", port: "New York", price: 1950 },
  { city: "HARTFORD", state: "Connecticut", port: "New York", price: 1950 },
  { city: "HARTFORD SPRINGFIELD", state: "Connecticut", port: "New York", price: 1900 },
  { city: "HAYWARD", state: "California", port: "Los Angeles", price: 2650 },
  { city: "HELENA", state: "Montana", port: "Los Angeles", price: 3300 },
  { city: "HOUSTON", state: "Texas", port: "Houston", price: 2050 },
  { city: "HOUSTON EAST", state: "Texas", port: "Houston", price: 2050 },
  { city: "INDIANAPOLIS", state: "Indiana", port: "Savannah", price: 2225 },
  { city: "IONIA", state: "Michigan", port: "New York", price: 2325 },
  { city: "JACKSON", state: "Mississippi", port: "Savannah", price: 2000 },
  { city: "JACKSONVILLE EAST", state: "Florida", port: "Savannah", price: 1825 },
  { city: "JACKSONVILLE NORTH", state: "Florida", port: "Savannah", price: 1825 },
  { city: "JACKSONVILLE WEST", state: "Florida", port: "Savannah", price: 1825 },
  { city: "KANSAS CITY", state: "Kansas", port: "Savannah", price: 2250 },
  { city: "KANSAS CITY EAST", state: "Kansas", port: "Savannah", price: 2250 },
  { city: "KINCHELOE", state: "Michigan", port: "New York", price: 2650 },
  { city: "KNOXVILLE", state: "Tennessee", port: "Savannah", price: 2000 },
  { city: "LANSING", state: "Michigan", port: "New York", price: 2325 },
  { city: "LAS VEGAS", state: "Nevada", port: "Los Angeles", price: 2625 },
  { city: "LAS VEGAS WEST", state: "Nevada", port: "Los Angeles", price: 2625 },
  { city: "LEXINGTON EAST", state: "Kentucky", port: "Savannah", price: 2150 },
  { city: "LEXINGTON WEST", state: "Kentucky", port: "Savannah", price: 2150 },
  { city: "LINCOLN", state: "Nebraska", port: "New York", price: 2300 },
  { city: "LITTLE ROCK", state: "Arkansas", port: "Savannah", price: 2100 },
  { city: "LONG BEACH", state: "California", port: "Los Angeles", price: 2440 },
  { city: "LONG ISLAND", state: "New York", port: "New York", price: 1925 },
  { city: "LONGVIEW", state: "Texas", port: "Houston", price: 2125 },
  { city: "LOS ANGELES", state: "California", port: "Los Angeles", price: 2440 },
  { city: "LOUISVILLE", state: "Kentucky", port: "Savannah", price: 2150 },
  { city: "LUFKIN", state: "Texas", port: "Houston", price: 2100 },
  { city: "LUMBERTON", state: "North Carolina", port: "Savannah", price: 1925 },
  { city: "LYMAN", state: "Maine", port: "New York", price: 2125 },
  { city: "MACON", state: "Georgia", port: "Savannah", price: 1875 },
  { city: "MADISON", state: "Wisconsin", port: "Savannah", price: 2300 },
  { city: "MADISON SOUTH", state: "Wisconsin", port: "Savannah", price: 2300 },
  { city: "MARTINEZ", state: "California", port: "Los Angeles", price: 2650 },
  { city: "MCALLEN", state: "Texas", port: "Houston", price: 2125 },
  { city: "MEBANE", state: "North Carolina", port: "Savannah", price: 1925 },
  { city: "MEMPHIS", state: "Tennessee", port: "Savannah", price: 2125 },
  { city: "MENTONE", state: "California", port: "Los Angeles", price: 2525 },
  { city: "MIAMI CENTRAL", state: "Florida", port: "Savannah", price: 1975 },
  { city: "MIAMI NORTH", state: "Florida", port: "Savannah", price: 1975 },
  { city: "MIAMI SOUTH", state: "Florida", port: "Savannah", price: 1975 },
  { city: "MILWAUKEE", state: "Wisconsin", port: "New York", price: 2325 },
  { city: "MILWAUKEE NORTH", state: "Wisconsin", port: "New York", price: 2325 },
  { city: "MILWAUKEE SOUTH", state: "Wisconsin", port: "New York", price: 2325 },
  { city: "MINNEAPOLIS", state: "Minnesota", port: "New York", price: 2350 },
  { city: "MINNEAPOLIS NORTH", state: "Minnesota", port: "New York", price: 2350 },
  { city: "MOBILE", state: "Alabama", port: "Savannah", price: 1950 },
  { city: "MOBILE SOUTH", state: "Alabama", port: "Savannah", price: 1950 },
  { city: "MOCKSVILLE", state: "North Carolina", port: "Savannah", price: 1925 },
  { city: "MONTGOMERY", state: "Alabama", port: "Savannah", price: 2000 },
  { city: "NAPA", state: "California", port: "Los Angeles", price: 2750 },
  { city: "NASHVILLE", state: "Tennessee", port: "Savannah", price: 2050 },
  { city: "NEW ORLEANS", state: "Louisiana", port: "Savannah", price: 2025 },
  { city: "NEWBURGH", state: "New York", port: "New York", price: 1925 },
  { city: "NORTH BOSTON", state: "Massachusetts", port: "New York", price: 2000 },
  { city: "NORTH CHARLESTON", state: "South Carolina", port: "Savannah", price: 1850 },
  { city: "NORTH SEATTLE", state: "Washington", port: "Los Angeles", price: 3300 },
  { city: "OCALA", state: "Florida", port: "Savannah", price: 1925 },
  { city: "OGDEN", state: "Utah", port: "Los Angeles", price: 2750 },
  { city: "OKLAHOMA CITY", state: "Oklahoma", port: "Houston", price: 2275 },
  { city: "ORLANDO", state: "Florida", port: "Savannah", price: 1925 },
  { city: "ORLANDO NORTH", state: "Florida", port: "Savannah", price: 1925 },
  { city: "ORLANDO SOUTH", state: "Florida", port: "Savannah", price: 1925 },
  { city: "PASCO", state: "Washington", port: "Los Angeles", price: 3400 },
  { city: "PEORIA", state: "Illinois", port: "New York", price: 2275 },
  { city: "PHILADELPHIA", state: "Pennsylvania", port: "New York", price: 1905 },
  { city: "PHILADELPHIA EAST", state: "Pennsylvania", port: "New York", price: 1905 },
  { city: "PHOENIX", state: "Arizona", port: "Los Angeles", price: 2600 },
  { city: "PHOENIX NORTH", state: "Arizona", port: "Los Angeles", price: 2630 },
  { city: "PITTSBURGH EAST", state: "Pennsylvania", port: "New York", price: 2125 },
  { city: "PITTSBURGH NORTH", state: "Pennsylvania", port: "New York", price: 2125 },
  { city: "PITTSBURGH SOUTH", state: "Pennsylvania", port: "New York", price: 2100 },
  { city: "PITTSBURGH WEST", state: "Pennsylvania", port: "New York", price: 2125 },
  { city: "PORTLAND NORTH", state: "Oregon", port: "Los Angeles", price: 3150 },
  { city: "PORTLAND SOUTH", state: "Oregon", port: "Los Angeles", price: 3250 },
  { city: "PUNTA GORDA", state: "Florida", port: "Savannah", price: 1950 },
  { city: "PUNTA GORDA SOUTH", state: "Florida", port: "Savannah", price: 1950 },
  { city: "RALEIGH", state: "North Carolina", port: "Savannah", price: 1925 },
  { city: "RALEIGH NORTH", state: "North Carolina", port: "Savannah", price: 1925 },
  { city: "RANCHO CUCAMONGA", state: "California", port: "Los Angeles", price: 2490 },
  { city: "RAPID CITY", state: "South Dakota", port: "New York", price: 2875 },
  { city: "REDDING", state: "California", port: "Los Angeles", price: 2825 },
  { city: "RENO", state: "Nevada", port: "Los Angeles", price: 2725 },
  { city: "RICHMOND", state: "Virginia", port: "New York", price: 2050 },
  { city: "RICHMOND EAST", state: "Virginia", port: "New York", price: 2050 },
  { city: "ROCHESTER", state: "New York", port: "New York", price: 2075 },
  { city: "RUTLAND", state: "Vermont", port: "New York", price: 2150 },
  { city: "SACRAMENTO", state: "California", port: "Los Angeles", price: 2650 },
  { city: "SALT LAKE CITY", state: "Utah", port: "Los Angeles", price: 2750 },
  { city: "SALT LAKE CITY NORTH", state: "Utah", port: "Los Angeles", price: 2800 },
  { city: "SAN ANTONIO", state: "Texas", port: "Houston", price: 2125 },
  { city: "SAN BERNARDINO", state: "California", port: "Los Angeles", price: 2500 },
  { city: "SAN DIEGO", state: "California", port: "Los Angeles", price: 2525 },
  { city: "SAN JOSE", state: "California", port: "Los Angeles", price: 2650 },
  { city: "SAVANNAH", state: "Georgia", port: "Savannah", price: 1750 },
  { city: "SCRANTON", state: "Pennsylvania", port: "New York", price: 1950 },
  { city: "SEAFORD", state: "Delaware", port: "New York", price: 1975 },
  { city: "SHREVEPORT", state: "Louisiana", port: "Houston", price: 2150 },
  { city: "SIKESTON", state: "Missouri", port: "Savannah", price: 2225 },
  { city: "SO SACRAMENTO", state: "California", port: "Los Angeles", price: 2650 },
  { city: "SOMERVILLE", state: "New Jersey", port: "New York", price: 1850 },
  { city: "SOUTH BOSTON", state: "Massachusetts", port: "New York", price: 2025 },
  { city: "SOUTHERN ILLINOIS", state: "Illinois", port: "Savannah", price: 2200 },
  { city: "SPARTANBURG", state: "South Carolina", port: "Savannah", price: 1925 },
  { city: "SPOKANE", state: "Washington", port: "Los Angeles", price: 3400 },
  { city: "SPRINGFIELD", state: "Missouri", port: "Savannah", price: 2225 },
  { city: "ST. CLOUD", state: "Minnesota", port: "New York", price: 2375 },
  { city: "ST. LOUIS", state: "Missouri", port: "Savannah", price: 2225 },
  { city: "SUN VALLEY", state: "California", port: "Los Angeles", price: 2500 },
  { city: "SYRACUSE", state: "New York", port: "New York", price: 2000 },
  { city: "TALLAHASSEE", state: "Florida", port: "Savannah", price: 1925 },
  { city: "TAMPA SOUTH", state: "Florida", port: "Savannah", price: 1925 },
  { city: "TANNER", state: "Alabama", port: "Savannah", price: 2025 },
  { city: "TIFTON", state: "Georgia", port: "Savannah", price: 1875 },
  { city: "TRENTON", state: "New Jersey", port: "New York", price: 1875 },
  { city: "TUCSON", state: "Arizona", port: "Los Angeles", price: 2675 },
  { city: "TULSA", state: "Oklahoma", port: "Houston", price: 2325 },
  { city: "VALLEJO", state: "California", port: "Los Angeles", price: 2675 },
  { city: "VAN NUYS", state: "California", port: "Los Angeles", price: 2480 },
  { city: "WACO", state: "Texas", port: "Houston", price: 2125 },
  { city: "WALTON", state: "Kentucky", port: "Savannah", price: 2150 },
  { city: "WASHINGTON DC", state: "Maryland", port: "New York", price: 1975 },
  { city: "WAYLAND", state: "Michigan", port: "New York", price: 2325 },
  { city: "WEST PALM BEACH", state: "Florida", port: "Savannah", price: 1975 },
  { city: "WEST WARREN", state: "Massachusetts", port: "New York", price: 2000 },
  { city: "WHEELING", state: "Illinois", port: "New York", price: 2225 },
  { city: "WICHITA", state: "Kansas", port: "Houston", price: 2325 },
  { city: "WINDHAM", state: "Maine", port: "New York", price: 2175 },
  { city: "YORK HAVEN", state: "Pennsylvania", port: "New York", price: 1950 },
];

/**
 * Pacific Northwest cities shipping via Seattle-Poti route
 */
export const COPART_SEATTLE_POTI_SHIPPING: CopartShippingEntry[] = [
  { city: "ANCHORAGE", state: "Alaska", port: "Seattle-Poti", price: 3750 },
  { city: "ANCHORAGE SOUTH", state: "Alaska", port: "Seattle-Poti", price: 3750 },
  { city: "BOISE", state: "Idaho", port: "Seattle-Poti", price: 2375 },
  { city: "CASPER", state: "Wyoming", port: "Seattle-Poti", price: 3200 },
  { city: "EUGENE", state: "Oregon", port: "Seattle-Poti", price: 2275 },
  { city: "GRAHAM", state: "Washington", port: "Seattle-Poti", price: 2050 },
  { city: "HELENA", state: "Montana", port: "Seattle-Poti", price: 2650 },
  { city: "NORTH SEATTLE", state: "Washington", port: "Seattle-Poti", price: 2125 },
  { city: "PASCO", state: "Washington", port: "Seattle-Poti", price: 2300 },
  { city: "PORTLAND NORTH", state: "Oregon", port: "Seattle-Poti", price: 2175 },
  { city: "SPOKANE", state: "Washington", port: "Seattle-Poti", price: 2275 },
];

/**
 * Canada cities shipping via Toronto-Poti route
 */
export const COPART_CANADA_SHIPPING: CopartShippingEntry[] = [
  { city: "CALGARY", state: "Alberta", port: "Toronto-Poti", price: 3525 },
  { city: "COOKSTOWN", state: "Ontario", port: "Toronto-Poti", price: 2375 },
  { city: "EDMONTON", state: "Alberta", port: "Toronto-Poti", price: 3525 },
  { city: "HALIFAX", state: "Nova Scotia", port: "Toronto-Poti", price: 3275 },
  { city: "LONDON", state: "Ontario", port: "Toronto-Poti", price: 2325 },
  { city: "MONCTON", state: "New Brunswick", port: "Toronto-Poti", price: 3350 },
  { city: "MONTREAL", state: "Quebec", port: "Toronto-Poti", price: 2575 },
  { city: "ST. JOHN'S", state: "Newfoundland and Labrador", port: "Toronto-Poti", price: 3925 },
  { city: "TORONTO", state: "Ontario", port: "Toronto-Poti", price: 2300 },
  { city: "OTTAWA", state: "Ontario", port: "Toronto-Poti", price: 2550 },
];

/**
 * Combined shipping data for all COPART locations
 */
export const ALL_COPART_SHIPPING = [
  ...COPART_US_SHIPPING,
  ...COPART_SEATTLE_POTI_SHIPPING,
  ...COPART_CANADA_SHIPPING,
];

/**
 * Get shipping price by city name (case-insensitive)
 * Returns the first match found
 */
export const getCopartShippingPrice = (cityName: string): number | null => {
  const normalizedCity = cityName.toUpperCase().trim();
  const entry = ALL_COPART_SHIPPING.find(
    (item) => item.city.toUpperCase() === normalizedCity
  );
  return entry?.price ?? null;
};

/**
 * Get all cities as a simple string array for dropdown/autocomplete
 */
export const getCopartCityList = (): string[] => {
  return ALL_COPART_SHIPPING.map(
    (item) => `${item.city} - ${item.state}`
  );
};

/**
 * Build a price map for quick lookups (city-state -> price)
 */
export const buildCopartPriceMap = (): Record<string, number> => {
  const priceMap: Record<string, number> = {};
  ALL_COPART_SHIPPING.forEach((item) => {
    priceMap[`${item.city} - ${item.state}`] = item.price;
  });
  return priceMap;
};
