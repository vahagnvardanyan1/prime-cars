# Import Calculator — Overview

This document captures the cross‑cutting concepts of the import calculator: what flows where, what units are used, and which behaviors are shared vs. vehicle‑type specific. Per‑calculator math lives in dedicated docs (e.g. [`truck-calculation.md`](../truck-calculator/truck-calculation.md)).

## Architecture at a glance

```
ImportCalculator.tsx            ← form state (UI)
   │  submit
   ▼
vehicleCalculators.ts           ← params router + USD↔EUR boundary
   │   USD → EUR (÷ rate)
   │   ├─ truck       → calculateTruckTaxes()        (local, EUR math)
   │   ├─ quadricycle → calculateQuadricycleTaxes()  (local, EUR math)
   │   ├─ motorcycle  → calculateMotorcycleTaxes()   (local, EUR math)
   │   ├─ snowmobile  → calculateSnowmobileTaxes()   (local, EUR math)
   │   ├─ jetski      → calculateJetSkiTaxes()       (local, EUR math)
   │   └─ passenger   → calculateVehicleTaxes()      (REMOTE backend, EUR math)
   │   EUR → USD (× rate)  [skipped for passenger; done in CalculatorResults]
   ▼
CalculatorResults.tsx           ← display
```

## USD ⇄ EUR round‑trip

Armenian customs rates are denominated in EUR (e.g. `OLD_TRUCK_CUSTOMS_RATE_PER_CM3 = €1.00/cm³`), so all tax math runs in EUR. The form takes USD, converts once on entry, and converts back once at exit.

| Layer | Operation | Cumulative state |
|---|---|---|
| Form (USD in) | — | USD |
| `vehicleCalculators.ts` | `÷ eurUsdRate` | EUR |
| `calculateXxxTaxes` | tax math | EUR |
| `applyRateCompensation` | `× eurUsdRate` | USD |
| `CalculatorResults` | `× 1` (skipped via `LOCAL_USD_TYPES`) | USD |

**Passenger** is the exception: the remote backend returns EUR, `applyRateCompensation` is **skipped**, and `CalculatorResults` does the EUR → USD multiply itself (because passenger's `type` is not in `LOCAL_USD_TYPES`). Net effect is the same — one division at entry, one multiplication at exit.

> Historical note: a previous version had `applyRateCompensation` use `eurUsdRate²` plus another `× rate` in `CalculatorResults` — total `rate³` overcharge. The single‑multiplication invariant above is the fix.

## Engine volume — canonical unit is cm³

`VehicleCalcParams.engineVolumeCm3` is always cm³. The form parses user input via `normalizeEngineVolumeToCm3()`:

| Input | Interpreted as | cm³  |
|-------|----------------|------|
| `"2.5"` (decimal) | liters | 2500 |
| `"2500"` (integer) | cm³ | 2500 |
| `"16"` | cm³ | 16   |

Decimal point present → liters → multiply by 1000. Otherwise the raw integer is treated as cm³.

The passenger backend still expects liters, so `calculatePassengerResult` does an explicit `cm3 / 1000` re‑conversion at that one boundary.

## Two age formulas (intentional)

| Helper | Where used | Rule |
|---|---|---|
| `calculateVehicleAge` (`calculateAge.ts`) | Truck customs duty | Customs ceiling: any time past the most recent anniversary bumps to next year |
| Calendar‑year diff (`calculateEnvironmentalTax.ts`) | Env tax for truck/quad/snowmobile | `currentYear - vehicleYear` only (no month/day) |

Today (2026) examples:

| Vehicle date | calculateVehicleAge | Env‑tax age |
|---|---|---|
| 2023‑05‑02 (exactly 3y) | 3 | 3 |
| 2023‑05‑01 (3y + 1d) | **4** | 3 |
| 2024‑06‑15 | 2 | 2 |
| 2026‑02‑01 | 0 | 0 |

## Importer (legal vs individual)

The importer flag controls **which sums enter the customs/VAT bases** for local calculators:

| | Customs base | VAT base |
|---|---|---|
| Individual | `vehiclePrice + auctionFee` | `vehiclePrice + auctionFee + customsDuty` |
| Legal | `vehiclePrice + auctionFee + shipping` | `vehiclePrice + auctionFee + customsDuty + shipping` |

Env tax base never includes shipping or customs duty for any importer.

For **passenger**, the rule is simpler at the frontend: `shippingForTax = importer === "individual" ? 0 : shippingPriceUsd`, then sent as a single `price` to the backend.

## Shipping vs cityTax — two separate values

The form maintains two distinct numbers per auction location:

| State | Source | Role |
|---|---|---|
| `shippingPrice` | `cityPriceMap[location]` | Display only — "Transportation" line on results page; in the on-screen total |
| `cityTax` | `cityTaxMap[location]` | Tax math — passed as `shippingPriceUsd` to `calculateXxxTaxes`; enters customs/VAT bases for legal importer |

`shippingPrice` carries the per‑vehicle adjustments via `applyShippingAdjustments`:

- quadricycle / motorcycle → `× 0.5`
- truck → `+ $500`
- "Out of auction borders" (sublot) → `+ $50`

`cityTax` is **always** the raw value from `cityTaxMap[location]` (or the manual entry in the "Other" tab). No adjustments. This decoupling means the displayed Transportation line and the customs/VAT bases can diverge intentionally.

## Sublot ("Out of auction borders")

A single checkbox in the form — labels in translations call it "Out of auction borders / Offsite / Sublot." When checked:

- Adds **$50** to `shippingPrice` only.
- Does NOT touch `cityTax`, customs duty, VAT, env tax, or insurance.
- DOES affect the on-screen total (because `shippingPrice` is in the total sum).

Debug log `[Sublot]` in `applyShippingAdjustments` shows base, after-type-adjust, sublot delta, and final value.

> The `setSublotPrice` state in `ImportCalculator.tsx:72` is dead code — declared but never read. Slated for cleanup.

## Engine type rules per vehicle type

| Vehicle type | Engine selector | Allowed values | ICE power checkbox |
|---|---|---|---|
| Passenger | enabled | gasoline, diesel, electric, hybrid | shown for hybrid |
| Truck | enabled | gasoline, diesel, electric (hybrid disabled) | n/a |
| Motorcycle | enabled | gasoline, diesel, electric (hybrid removed) | n/a |
| Quadricycle | disabled, auto‑set to gasoline | — | n/a |
| Snowmobile | disabled, auto‑set to gasoline | — | n/a |
| Jet ski | disabled, auto‑set to gasoline | — | n/a |

Engine volume input is **hidden** when:
- `engine === "electric"` (any vehicle type), or
- `vehicleType === "snowmobile"` or `"jetski"` (engine volume not used in their calc).

The same rule applies to the engine‑volume row on the results page.

## ICE power exceeds electric (passenger hybrid only)

`icePowerExceedsElectric` checkbox renders only when `vehicleType === "passenger"` and `engine === "hybrid"`. Defaults to `false` (the user must opt in). Threaded through:

```
form state → params.icePowerExceedsElectric → calculatePassengerResult →
  calculateVehicleTaxes({ ICEpower: icePowerExceedsElectric ? 1 : 0 })
```

Backend uses the `ICEpower` flag to choose between two hybrid customs‑duty paths.

## Public vs authenticated city fetch

Logged‑in users hit `fetchShippingCities` (returns cities + priceMap + taxMap). Anonymous users hit `fetchShippingCitiesPublic` (returns cities only — no prices). For anonymous users, picking a city sets `shippingPrice = 0` and `cityTax = 0`; they have to use the **Other** tab to enter shipping manually.

The fetch effect re‑runs on `[activeTab, user]`, so logging in/out while on the calculator refetches with the appropriate endpoint.

## Console logs (temporary, for verification)

The branch currently has plain `console.log` calls for diagnostics:

| Tag | Where | What it shows |
|---|---|---|
| `[Shipping/auction]` | `ImportCalculator.tsx` shipping effect | raw + adjusted shipping/cityTax per location |
| `[Shipping/other]` | same | raw + adjusted manual entry |
| `[Sublot]` | `applyShippingAdjustments` | base, type-adjust, sublot delta, final |
| `[Quadricycle/entry-usd]` etc. | `calculateQuadricycleResult` | USD inputs, EUR conversion, EUR result, USD output |
| `[Motorcycle/entry-usd]` etc. | `calculateMotorcycleResult` | same shape as quadricycle |
| `[TruckCalc] …` | `truckDebug.ts` | gated structured logger; respects `localStorage.DEBUG_CALC` |

`truckLog` is the only gated logger; the rest should be removed before commit.

## Files map

| Concern | File |
|---|---|
| Form state + dispatch | `src/components/ImportCalculator.tsx` |
| Params router + USD ⇄ EUR | `src/lib/import-calculator/vehicleCalculators.ts` |
| Truck math | `src/lib/import-calculator/calculateTruckTaxes.ts` + `truckTaxConstants.ts` |
| Quadricycle math | `src/lib/import-calculator/calculateQuadricycleTaxes.ts` + `quadricycleTaxConstants.ts` |
| Motorcycle math | `src/lib/import-calculator/calculateMotorcycleTaxes.ts` |
| Snowmobile math | `src/lib/import-calculator/calculateSnowmobileTaxes.ts` |
| Jet ski math | `src/lib/import-calculator/calculateJetSkiTaxes.ts` |
| Passenger (remote) | `src/lib/import-calculator/calculateVehicleTaxes.ts` |
| Customs‑ceiling age | `src/lib/import-calculator/calculateAge.ts` |
| Env‑tax (shared) | `src/lib/import-calculator/calculateEnvironmentalTax.ts` |
| Engine volume normalize | `src/lib/import-calculator/normalizeEngineVolume.ts` |
| Truck debug logger | `src/lib/import-calculator/truckDebug.ts` |
| City fetch (auth) | `src/lib/import-calculator/fetchShippingPrices.ts` |
| City fetch (public) | `src/lib/import-calculator/fetchShippingCitiesPublic.ts` |
| Results display | `src/components/calculator/CalculatorResults.tsx` |
