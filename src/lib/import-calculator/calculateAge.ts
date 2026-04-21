/** Age in full years from vehicle date to today (inclusive of today). */
export function calculateVehicleAge(year: number, month: number, day: number): number {
  const today = new Date();
  let age = today.getFullYear() - year;
  const todayMD = (today.getMonth() + 1) * 100 + today.getDate();
  const vehicleMD = month * 100 + day;
  if (todayMD < vehicleMD) age -= 1;
  return age;
}
