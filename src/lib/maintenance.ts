/**
 * Maintenance Mode Configuration
 *
 * Two ways to control maintenance mode:
 *
 * 1. Using this file (set DEFAULT_MAINTENANCE_MODE).
 * 2. Using the NEXT_PUBLIC_MAINTENANCE_MODE env var, which overrides the default.
 */

const DEFAULT_MAINTENANCE_MODE = false;

const MAINTENANCE_MODE =
  process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true"
    ? true
    : DEFAULT_MAINTENANCE_MODE;

export const isMaintenanceMode = (): boolean => {
  return MAINTENANCE_MODE;
};
