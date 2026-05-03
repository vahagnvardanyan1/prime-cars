const isBrowser = typeof window !== "undefined";

function isEnabled(): boolean {
  if (!isBrowser) return process.env.NODE_ENV !== "production";
  if (process.env.NODE_ENV !== "production") return true;
  try {
    return window.localStorage?.getItem("DEBUG_CALC") === "1";
  } catch {
    return false;
  }
}

export function truckLog(stage: string, payload: Record<string, unknown>): void {
  if (!isEnabled()) return;
  // eslint-disable-next-line no-console
  console.log(`[TruckCalc] ${stage}`, payload);
}

export function truckWarn(stage: string, payload: Record<string, unknown>): void {
  if (!isEnabled()) return;
  // eslint-disable-next-line no-console
  console.warn(`[TruckCalc] ${stage}`, payload);
}
