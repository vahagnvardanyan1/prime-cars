"use client";

import { useTranslations } from "next-intl";

import { ResultRow } from "@/components/calculator/ResultRow";

type MobileResultsSummaryProps = {
  importer: string;
  vehicleType: string;
  activeTab: string;
  auctionLocation: string;
  dateDisplay: string;
  engine: string;
  engineVolume: string;
  weightClass?: string;
  hasReverse?: boolean;
};

export const MobileResultsSummary = ({
  importer,
  vehicleType,
  activeTab,
  auctionLocation,
  dateDisplay,
  engine,
  engineVolume,
  weightClass,
  hasReverse,
}: MobileResultsSummaryProps) => {
  const t = useTranslations();

  const importerLabel = importer === "legal" ? t("calculator.results.legalPerson") : t("calculator.results.individual");
  const vehicleLabel = vehicleType ? t(`calculator.form.${vehicleType}`) : t("calculator.results.passengerCar");
  const engineTypeValue = engine ? t(`calculator.form.${engine}`) : t("calculator.form.gasoline");
  const weightValue =
    (vehicleType === "truck" || vehicleType === "largeTruck") && weightClass
      ? t(`calculator.form.weightClass${weightClass === "under5" ? "Under5" : weightClass === "5to20" ? "5to20" : "Above20"}`)
      : null;
  const reverseValue = vehicleType === "quadricycle"
    ? t(hasReverse ? "calculator.form.hasReverse" : "calculator.form.noReverse")
    : null;

  return (
    <div className="sm:hidden space-y-2.5">
      {/* Identity: importer (big) + vehicle type (smaller) — stacked to avoid awkward mid-line wrap */}
      <div className="text-center space-y-0.5">
        <p className="text-[#429de6] dark:text-[#5db3f0] font-bold text-base">
          {importerLabel}
        </p>
        <p className="text-sm text-gray-600 dark:text-white/60">
          {vehicleLabel}
        </p>
        <div className="flex justify-center pt-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#429de6]/10 dark:bg-[#429de6]/15 border border-[#429de6]/25 px-2.5 py-0.5">
            <span className="text-xs font-bold tracking-wider text-[#429de6] dark:text-[#5db3f0]">
              {activeTab.toUpperCase()}
            </span>
            <span className="text-[#429de6]/40 dark:text-[#5db3f0]/40 text-xs">·</span>
            <span className="text-xs font-semibold text-gray-800 dark:text-white/85 tabular-nums">
              {dateDisplay}
            </span>
          </div>
        </div>
      </div>

      {/* Spec rows — same card style as the cost breakdown for visual cohesion */}
      <dl className="rounded-xl border border-gray-200 dark:border-white/10 divide-y divide-gray-200 dark:divide-white/5 bg-white dark:bg-white/[0.02] overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-2">
          <dt className="text-sm text-gray-700 dark:text-white/80">{t("calculator.results.engineLabel")}</dt>
          <dd className="text-sm font-semibold text-[#429de6] dark:text-[#5db3f0]">{engineTypeValue}</dd>
        </div>
        {engine !== "electric" && (
          <div className="flex items-center justify-between gap-3 px-4 py-2">
            <dt className="text-sm text-gray-700 dark:text-white/80">{t("calculator.results.engineVolumeLabel")}</dt>
            <dd className="text-sm font-semibold text-[#429de6] dark:text-[#5db3f0] tabular-nums">
              {engineVolume ? `${engineVolume}` : "—"}
            </dd>
          </div>
        )}
        {weightValue && (
          <div className="flex items-center justify-between gap-3 px-4 py-2">
            <dt className="text-sm text-gray-700 dark:text-white/80">{t("calculator.form.weightClass")}</dt>
            <dd className="text-sm font-semibold text-[#429de6] dark:text-[#5db3f0]">{weightValue}</dd>
          </div>
        )}
        {reverseValue && (
          <div className="flex items-center justify-end gap-3 px-4 py-2">
            <dd className="text-sm font-semibold text-[#429de6] dark:text-[#5db3f0]">{reverseValue}</dd>
          </div>
        )}
        {auctionLocation && (
          <div className="flex items-start justify-between gap-3 px-4 py-2">
            <dt className="text-sm text-gray-700 dark:text-white/80 shrink-0">{t("calculator.results.auctionLocationLabel")}</dt>
            <dd className="text-sm font-semibold text-[#429de6] dark:text-[#5db3f0] text-right break-words">{auctionLocation}</dd>
          </div>
        )}
      </dl>
    </div>
  );
};

type MobileResultsBreakdownProps = {
  vehiclePrice: string;
  auctionFee: string;
  shippingPrice?: number;
  insuranceFee?: string;
  hasInsurance: boolean;
  calculatedServiceFee: number;
  otherExpenses?: string;
  totalAmount: number;
  taxCalculations: { customsUsd: number; vatUsd: number; envTaxUsd: number };
  hasRestrictedData: boolean;
};

export const MobileResultsBreakdown = ({
  vehiclePrice,
  auctionFee,
  shippingPrice,
  insuranceFee,
  hasInsurance,
  calculatedServiceFee,
  otherExpenses,
  totalAmount,
  taxCalculations,
  hasRestrictedData,
}: MobileResultsBreakdownProps) => {
  const t = useTranslations();

  return (
    <div className="sm:hidden rounded-xl border border-gray-200 dark:border-white/10 divide-y divide-gray-200 dark:divide-white/5 bg-white dark:bg-white/[0.02] overflow-hidden">
      <ResultRow label={t("calculator.form.vehiclePrice")} value={`$${vehiclePrice || "0"}`} />
      <ResultRow
        label={t("calculator.results.customsDuty")}
        value={hasRestrictedData ? `$${taxCalculations.customsUsd}` : "$000"}
        variant={hasRestrictedData ? "default" : "blurred"}
      />
      <ResultRow label={t("calculator.form.auctionFee")} value={`$${auctionFee || "0"}`} />
      <ResultRow
        label={t("calculator.results.vat")}
        value={hasRestrictedData ? `$${taxCalculations.vatUsd}` : "$000"}
        variant={hasRestrictedData ? "default" : "blurred"}
      />
      <ResultRow
        label={t("calculator.form.transportationFee")}
        value={hasRestrictedData ? `$${shippingPrice ?? "0"}` : "$000"}
        variant={hasRestrictedData ? "default" : "blurred"}
      />
      <ResultRow
        label={t("calculator.results.environmentalTax")}
        value={hasRestrictedData ? `$${taxCalculations.envTaxUsd}` : "$000"}
        variant={hasRestrictedData ? "default" : "blurred"}
      />
      <ResultRow
        label={t("calculator.form.insurance")}
        value={
          hasRestrictedData
            ? hasInsurance
              ? `$${insuranceFee ?? "0"}`
              : "—"
            : "$000"
        }
        variant={hasRestrictedData ? (hasInsurance ? "default" : "muted") : "blurred"}
      />
      <ResultRow
        label={t("calculator.form.serviceFee")}
        value={hasRestrictedData ? `$${calculatedServiceFee}` : "$000"}
        variant={hasRestrictedData ? "default" : "blurred"}
      />
      {(parseFloat(otherExpenses ?? "0") || 0) > 0 && (
        <ResultRow label={t("calculator.form.otherExpenses")} value={`$${otherExpenses}`} />
      )}
      <ResultRow
        label={t("calculator.results.totalAmount")}
        value={hasRestrictedData ? `$${totalAmount}` : "$partner"}
        variant={hasRestrictedData ? "highlight" : "blurred"}
      />
    </div>
  );
};
