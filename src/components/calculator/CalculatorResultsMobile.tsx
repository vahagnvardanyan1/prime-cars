"use client";

import { useTranslations } from "next-intl";

import { ResultRow } from "@/components/calculator/ResultRow";

type MobileResultsSummaryProps = {
  importer: string;
  vehicleType: string;
  currentDateTime: string;
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
  currentDateTime,
  activeTab,
  auctionLocation,
  dateDisplay,
  engine,
  engineVolume,
  weightClass,
  hasReverse,
}: MobileResultsSummaryProps) => {
  const t = useTranslations();

  return (
    <div className="sm:hidden text-left rounded-xl border border-gray-200/70 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] overflow-hidden">
      {/* Heading: importer + vehicle type */}
      <div className="px-4 py-3 text-center border-b border-gray-200/70 dark:border-white/10 bg-[#429de6]/5 dark:bg-[#429de6]/10">
        <p className="text-[#429de6] dark:text-[#5db3f0] font-bold text-base">
          {importer === "legal" ? t("calculator.results.legalPerson") : t("calculator.results.individual")}
        </p>
        <p className="text-gray-700 dark:text-white/70 text-sm mt-0.5">
          {vehicleType ? t(`calculator.form.${vehicleType}`) : t("calculator.results.passengerCar")}
        </p>
      </div>

      {/* Meta strip: timestamp + auction */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200/50 dark:border-white/5">
        <span className="text-xs text-gray-500 dark:text-white/50 tabular-nums">{currentDateTime}</span>
        <span className="text-xs font-bold tracking-wider text-[#429de6] dark:text-[#5db3f0]">{activeTab.toUpperCase()}</span>
      </div>

      {/* Detail rows */}
      <dl className="divide-y divide-gray-200/50 dark:divide-white/5">
        <div className="flex justify-between gap-3 px-4 py-2.5">
          <dt className="text-sm text-gray-500 dark:text-white/60">{t("calculator.results.auctionLocationLabel")}</dt>
          <dd className="text-sm font-semibold text-right text-[#429de6] dark:text-[#5db3f0] break-words">{auctionLocation || "—"}</dd>
        </div>
        <div className="flex justify-between gap-3 px-4 py-2.5">
          <dt className="text-sm text-gray-500 dark:text-white/60">{t("calculator.results.chooseYearLabel")}</dt>
          <dd className="text-sm font-semibold text-[#429de6] dark:text-[#5db3f0]">{dateDisplay}</dd>
        </div>
        <div className="flex justify-between gap-3 px-4 py-2.5">
          <dt className="text-sm text-gray-500 dark:text-white/60">{t("calculator.results.engineLabel")}</dt>
          <dd className="text-sm font-semibold text-[#429de6] dark:text-[#5db3f0]">
            {engine ? t(`calculator.form.${engine}`) : t("calculator.form.gasoline")}
          </dd>
        </div>
        {engine !== "electric" && (
          <div className="flex justify-between gap-3 px-4 py-2.5">
            <dt className="text-sm text-gray-500 dark:text-white/60">{t("calculator.results.engineVolumeLabel")}</dt>
            <dd className="text-sm font-semibold text-[#429de6] dark:text-[#5db3f0]">{engineVolume || "—"}</dd>
          </div>
        )}
        {(vehicleType === "truck" || vehicleType === "largeTruck") && weightClass && (
          <div className="flex justify-between gap-3 px-4 py-2.5">
            <dt className="text-sm text-gray-500 dark:text-white/60">{t("calculator.form.weightClass")}</dt>
            <dd className="text-sm font-semibold text-[#429de6] dark:text-[#5db3f0]">
              {t(`calculator.form.weightClass${weightClass === "under5" ? "Under5" : weightClass === "5to20" ? "5to20" : "Above20"}`)}
            </dd>
          </div>
        )}
        {vehicleType === "quadricycle" && (
          <div className="flex justify-end px-4 py-2.5">
            <span className="text-sm font-semibold text-[#429de6] dark:text-[#5db3f0]">
              {t(hasReverse ? "calculator.form.hasReverse" : "calculator.form.noReverse")}
            </span>
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
    <div className="sm:hidden space-y-2">
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
