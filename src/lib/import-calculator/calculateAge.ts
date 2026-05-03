/**
 * Age in years from vehicle date to today, using the customs ceiling rule:
 * any time past the most recent anniversary counts as the next full year.
 *
 * Examples (today = 2026-05-02):
 *   2023-05-02 → 3 (exactly on anniversary)
 *   2023-05-01 → 4 (1 day past anniversary → ceiling)
 *   2023-01-02 → 4 (4 months past January anniversary)
 *   2024-06-15 → 2 (anniversary in June not yet reached → no +1)
 */
export function calculateVehicleAge(year: number, month: number, day: number): number {
  const today = new Date();
  let age = today.getFullYear() - year;
  const todayMD = (today.getMonth() + 1) * 100 + today.getDate();
  const vehicleMD = month * 100 + day;
  if (todayMD > vehicleMD) age += 1;
  return age;
}
