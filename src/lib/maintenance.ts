/**
 * Maintenance Mode Configuration
 * 
 * Two ways to control maintenance mode:
 * 
 * 1. Using this file (recommended for quick changes):
 *    - Set MAINTENANCE_MODE to true to enable
 *    - Set MAINTENANCE_MODE to false to disable
 * 
 * 2. Using environment variable (recommended for production):
 *    - Set NEXT_PUBLIC_MAINTENANCE_MODE=true in your .env file
 *    - This will override the setting below
 */

// Default maintenance mode setting (can be overridden by environment variable)
const DEFAULT_MAINTENANCE_MODE = false;

// Check environment variable first, fall back to default
export const MAINTENANCE_MODE = 
  process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true' 
    ? true 
    : DEFAULT_MAINTENANCE_MODE;

/**
 * Optional: Add IP whitelist to allow specific IPs to bypass maintenance mode
 * Useful for testing while in maintenance mode
 */
export const MAINTENANCE_WHITELIST_IPS: string[] = [
  // Add IPs that should bypass maintenance mode
  // Example: '192.168.1.1', '10.0.0.1'
];

/**
 * Check if the site is in maintenance mode
 */
export const isMaintenanceMode = (): boolean => {
  return MAINTENANCE_MODE;
};

/**
 * Check if an IP is whitelisted to bypass maintenance mode
 */
export const isWhitelisted = (ip: string): boolean => {
  return MAINTENANCE_WHITELIST_IPS.includes(ip);
};
