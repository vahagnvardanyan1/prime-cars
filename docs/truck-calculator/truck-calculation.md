# Truck Calculation

Source of truth: `src/lib/import-calculator/calculateTruckTaxes.ts` and `src/lib/import-calculator/truckTaxConstants.ts`.

All inputs to the math are in **EUR** (frontend converts USD → EUR via `eurUsdRate` before calling). Engine volume is in **cm³** (canonical unit; see [calculator overview](../calculator/overview.md)).

## Bases (EUR)

For all trucks:

```
baseValue       = vehiclePrice + auctionFee
customsDutyBase = importer === "legal"
                  ? baseValue + shipping
                  : baseValue
vatBase         = importer === "legal"
                  ? baseValue + customsDuty + shipping
                  : baseValue + customsDuty
envTaxBase      = baseValue          // shipping/customsDuty NEVER included
```

## Customs Duty branches

Each branch is tagged with an ID (`P1..P9` for petrol, `D1..D12` for diesel, `E1` for electric) — this ID is logged via `truckLog` for traceability.

### Petrol

| ID  | Weight class | Engine cc | Age      | Formula                       |
|-----|--------------|-----------|----------|-------------------------------|
| P1  | under 5 t    | < 2800    | 0–7 yrs  | base × 15%                    |
| P2  | under 5 t    | < 2800    | > 7 yrs  | engineCc × €1.00              |
| P3  | under 5 t    | ≥ 2800    | 0–3 yrs  | base × 12.5%                  |
| P4  | under 5 t    | ≥ 2800    | 3–7 yrs  | base × 15%                    |
| P5  | under 5 t    | ≥ 2800    | > 7 yrs  | engineCc × €1.00              |
| P6  | 5–20 t       | any       | 0–7 yrs  | base × 15%                    |
| P7  | 5–20 t       | any       | > 7 yrs  | engineCc × €1.00              |
| P8  | above 20 t   | any       | 0–7 yrs  | base × 15%                    |
| P9  | above 20 t   | any       | > 7 yrs  | engineCc × €1.00              |

### Diesel

| ID   | Weight class | Engine cc | Age      | Formula                                          |
|------|--------------|-----------|----------|--------------------------------------------------|
| D1   | under 5 t    | < 2500    | 0–5 yrs  | base × 10%                                       |
| D2   | under 5 t    | < 2500    | 5–7 yrs  | MAX(base × 10%, engineCc × €0.13)                |
| D3   | under 5 t    | < 2500    | > 7 yrs  | engineCc × €1.00                                 |
| D4   | under 5 t    | ≥ 2500    | 0–7 yrs  | base × 10%                                       |
| D5   | under 5 t    | ≥ 2500    | > 7 yrs  | engineCc × €1.00                                 |
| D6   | 5–20 t       | any       | 0–3 yrs  | base × 15%                                       |
| D7   | 5–20 t       | any       | 3–5 yrs  | base × 10%                                       |
| D8   | 5–20 t       | any       | 5–7 yrs  | MAX(base × 10%, engineCc × €0.18)                |
| D9   | 5–20 t       | any       | > 7 yrs  | engineCc × €1.00                                 |
| D10  | above 20 t   | any       | 0–3 yrs  | base × 5%                                        |
| D11  | above 20 t   | any       | 3–7 yrs  | base × 10%                                       |
| D12  | above 20 t   | any       | > 7 yrs  | engineCc × €1.00                                 |

### Electric

| ID  | Formula        |
|-----|----------------|
| E1  | base × 15% (flat — no weight, age, or volume distinction) |

## VAT

```
vat = vatBase × 20%
```

## Environmental Tax

Calendar‑year age (`currentYear - vehicleYear` — no month/day, no anniversary rule):

| Env age   | Rate |
|-----------|------|
| 0–2 yrs   | 2%   |
| 3–4 yrs   | 4%   |
| 5–9 yrs   | 6%   |
| 10–14 yrs | 12%  |
| 15+ yrs   | 24%  |

```
environmentalTax = envTaxBase × rate    // envTaxBase = baseValue (no shipping, no customsDuty)
```

Helper: `calculateEnvironmentalTax()` in `src/lib/import-calculator/calculateEnvironmentalTax.ts` — shared across truck, quadricycle, and snowmobile.

## Two age models — important

Trucks use two different age formulas at the same time:

1. **Customs‑duty age** — uses `calculateVehicleAge` (`src/lib/import-calculator/calculateAge.ts`). Customs ceiling rule: any time past the most recent anniversary bumps to the next year.
2. **Env‑tax age** — calendar‑year diff only (`currentYear - vehicleYear`). No month/day.

This is intentional and matches Armenian customs/environmental code semantics.

## Returned shape

```ts
{
  customsDuty:     number,   // EUR, rounded
  vat:             number,   // EUR, rounded
  environmentalTax: number,  // EUR, rounded
  total:           number    // sum, rounded
}
```

The frontend then converts each field EUR → USD by multiplying by `eurUsdRate` exactly once via `applyRateCompensation` in `vehicleCalculators.ts` (and `CalculatorResults` skips the conversion since type `"truck"` is in `LOCAL_USD_TYPES`).

## Debug logging

Set `localStorage.DEBUG_CALC = "1"` (always on in dev). `truckLog` emits structured records at each stage: `entry/usd`, `entry/engine-resolved`, `entry/eur`, `bases`, `customs/route`, `vat`, `env`, `result/eur`, `result/usd`. Each `customs/route` log carries the matched branch ID so you can map a wrong number to a specific row in the tables above.

## Engine‑type fallbacks (defensive)

`calculateTruckResult` in `vehicleCalculators.ts` warns via `truckWarn` if it receives `hybrid` or any unknown engine string — both silently map to petrol. The dropdown in `ImportCalculator` doesn't allow hybrid for trucks, so this should never fire in production.
