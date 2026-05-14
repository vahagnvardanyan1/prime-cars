"use client";

import { useEffect, useState, useMemo, useCallback } from "react";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

import type { CalculatorResponse } from "@/lib/import-calculator/calculateVehicleTaxes";
import {
  fetchExchangeRates,
  calculateEurUsdRate,
  type ExchangeRates,
} from "@/lib/import-calculator/fetchExchangeRates";
import { calculateServiceFee, calculateServiceFeeFromBrackets } from "@/lib/import-calculator/auctionFees";
import type { IncomeTaxBracket } from "@/lib/admin/types";
import { MobileResultsSummary, MobileResultsBreakdown } from "@/components/calculator/CalculatorResultsMobile";

// Fallback rates hoisted outside component to avoid recreation (React best practice 7.9)
const FALLBACK_RATES: ExchangeRates = {
  USD: "380.33",
  EUR: "443.24",
};

const FALLBACK_EUR_USD_RATE = "1.1774";

type CalculatorResultsProps = {
  importer: string;
  vehicleType: string;
  vehiclePrice: string;
  auctionFee: string;
  auctionLocation: string;
  activeTab: string;
  day: string;
  month: string;
  year: string;
  engine: string;
  engineVolume: string;
  weightClass?: string;
  hasReverse?: boolean;
  showPartnerMessage?: boolean;
  otherExpenses?: string;
  onBack: () => void;
  // Restricted data - only provided in admin panel
  insuranceFee?: string;
  shippingPrice?: number;
  calculationResults?: CalculatorResponse | null;
  hasInsurance?: boolean;
  // Per-user income tax brackets (for logged-in users)
  incomeTaxBrackets?: IncomeTaxBracket[] | null;
};

export const CalculatorResults = ({
  importer,
  vehicleType,
  vehiclePrice,
  auctionFee,
  auctionLocation,
  activeTab,
  day,
  month,
  year,
  engine,
  engineVolume,
  weightClass,
  hasReverse,
  showPartnerMessage = false,
  otherExpenses,
  onBack,
  // Restricted data - only available in admin
  insuranceFee,
  shippingPrice,
  calculationResults,
  hasInsurance = false,
  incomeTaxBrackets,
}: CalculatorResultsProps) => {
  const t = useTranslations();
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState(true);

  // Derived boolean - memoized to avoid recalculation (React best practice 5.4)
  const hasRestrictedData = calculationResults !== undefined;

  // Fetch exchange rates on mount
  useEffect(() => {
    let isMounted = true;

    const loadExchangeRates = async () => {
      const result = await fetchExchangeRates();

      if (!isMounted) return;

      if (result.success) {
        setExchangeRates(result.data);
      } else {
        // Use fallback rates on error
        setExchangeRates(FALLBACK_RATES);
      }
      setIsLoadingRates(false);
    };

    loadExchangeRates();

    return () => {
      isMounted = false;
    };
  }, []);

  // Memoize exchange rate values (React best practice 5.1 - avoid unnecessary calculations)
  const { usdRate, eurRate, eurUsdRate } = useMemo(() => ({
    usdRate: exchangeRates?.USD ?? FALLBACK_RATES.USD,
    eurRate: exchangeRates?.EUR ?? FALLBACK_RATES.EUR,
    eurUsdRate: exchangeRates ? calculateEurUsdRate(exchangeRates) : FALLBACK_EUR_USD_RATE,
  }), [exchangeRates]);

  // Parse EUR/USD rate once (React best practice 7.3 - cache property access)
  const eurUsdRateNum = useMemo(() => parseFloat(eurUsdRate), [eurUsdRate]);

  // Memoize individual tax calculations to avoid recalculating in render (React best practice 5.2)
  const taxCalculations = useMemo(() => {
    if (!hasRestrictedData || !calculationResults) {
      return { customsUsd: 0, vatUsd: 0, envTaxUsd: 0 };
    }

    // Local calculators (truck, quadricycle, etc.) return USD via applyRateCompensation.
    // Passenger car API returns EUR — needs conversion here.
    // These type strings are set by us in vehicleCalculators.ts — they will never collide with API types.
    const LOCAL_USD_TYPES = ["truck", "largeTruck", "quadricycle", "snowmobile", "jetski", "motorcycle"];
    const isAlreadyUsd = LOCAL_USD_TYPES.includes(calculationResults.type);
    const rate = isAlreadyUsd ? 1 : eurUsdRateNum;

    return {
      customsUsd: Math.round((calculationResults.globTax ?? 0) * rate),
      vatUsd: Math.round((calculationResults.nds ?? 0) * rate),
      envTaxUsd: Math.round((calculationResults.envTaxPay ?? 0) * rate),
    };
  }, [hasRestrictedData, calculationResults, eurUsdRateNum]);

  const taxTotal = useMemo(() => {
    const { customsUsd, vatUsd, envTaxUsd } = taxCalculations;
    return customsUsd + vatUsd + envTaxUsd;
  }, [taxCalculations]);

  // Calculate service fee based on total of all costs (Vehicle price + Auction fee + Transportation + Insurance + Customs + VAT + Env tax)
  const calculatedServiceFee = useMemo(() => {
    if (!hasRestrictedData) return 0;

    const vehiclePriceUsd = parseFloat(vehiclePrice) || 0;
    const shippingPriceUsd = shippingPrice ?? 0;
    const auctionFeeUsd = parseFloat(auctionFee) || 0;
    const insuranceFeeUsd = hasInsurance ? (parseFloat(insuranceFee ?? "0") || 0) : 0;
    const { customsUsd, vatUsd, envTaxUsd } = taxCalculations;

    // Calculate subtotal before service fee
    const subtotal = vehiclePriceUsd + auctionFeeUsd + shippingPriceUsd + insuranceFeeUsd + customsUsd + vatUsd + envTaxUsd;

    // Use per-user brackets if available (logged-in individual), otherwise hardcoded
    if (importer === "individual" && incomeTaxBrackets && incomeTaxBrackets.length > 0) {
      const fee = Math.round(calculateServiceFeeFromBrackets(subtotal, incomeTaxBrackets));
      return fee;
    }
    const fee = Math.round(calculateServiceFee(subtotal, importer));
    return fee;
  }, [
    hasRestrictedData,
    vehiclePrice,
    shippingPrice,
    auctionFee,
    insuranceFee,
    hasInsurance,
    taxCalculations,
    importer,
    incomeTaxBrackets,
  ]);

  // Memoize total calculation (React best practice 5.2 - extract expensive work)
  const totalAmount = useMemo(() => {
    if (!hasRestrictedData) return 0;

    // Parse values once
    const vehiclePriceUsd = parseFloat(vehiclePrice) || 0;
    const shippingPriceUsd = shippingPrice ?? 0;
    const auctionFeeUsd = parseFloat(auctionFee) || 0;
    const insuranceFeeUsd = hasInsurance ? (parseFloat(insuranceFee ?? "0") || 0) : 0;
    const otherExpensesUsd = parseFloat(otherExpenses ?? "0") || 0;

    const { customsUsd, vatUsd, envTaxUsd } = taxCalculations;

    return Math.round(
      vehiclePriceUsd + shippingPriceUsd + customsUsd + vatUsd + envTaxUsd + auctionFeeUsd + calculatedServiceFee + insuranceFeeUsd + otherExpensesUsd
    );
  }, [
    hasRestrictedData,
    vehiclePrice,
    shippingPrice,
    auctionFee,
    insuranceFee,
    hasInsurance,
    otherExpenses,
    taxCalculations,
    calculatedServiceFee,
  ]);

  // Memoize current date/time - only compute once per render, not on every call
  const currentDateTime = useMemo(() => {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace("T", " ");
  }, []);

  // Memoize formatted rates for display (React best practice 7.4 - cache function results)
  const displayRates = useMemo(() => ({
    usd: Math.round(parseFloat(usdRate)),
    eur: Math.round(parseFloat(eurRate)),
  }), [usdRate, eurRate]);

  // Format date display - memoized (React best practice 5.2)
  const dateDisplay = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return `${year || currentYear}/${month || "--"}/${day || "--"}`;
  }, [year, month, day]);

  // Memoize the back button handler to use stable reference
  const handleBack = useCallback(() => {
    onBack();
  }, [onBack]);

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black rounded-2xl border border-gray-300 dark:border-gray-800 shadow-xl overflow-hidden">
      {/* Desktop: full sticky back bar (mobile uses system back / swipe-back) */}
      <div className="hidden sm:block sticky top-0 z-10 backdrop-blur-md bg-gray-100/90 dark:bg-black/80 border-b border-gray-300 dark:border-gray-800 rounded-t-2xl px-4 sm:px-6 py-2 sm:py-3">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 min-h-[44px] -my-1 text-[#429de6] dark:text-[#5db3f0] hover:text-[#3a8acc] dark:hover:text-[#6fc0f5] transition-colors group"
          type="button"
          aria-label={t("calculator.results.backToCalculator")}
        >
          <svg
            aria-hidden="true"
            className="w-5 h-5 transition-transform group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium text-sm sm:text-base">{t("calculator.results.backToCalculator")}</span>
        </button>
      </div>

      {/* Exchange Rates */}
      <div className="bg-gray-100 dark:bg-black/40 border-b border-gray-300 dark:border-gray-800 py-3 sm:py-6 md:py-8 px-4 sm:px-6">
        {/* Mobile: single inline row */}
        <div className="flex sm:hidden flex-wrap justify-center items-baseline gap-x-3 gap-y-1 text-sm tabular-nums">
          <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
            <span className="text-gray-600 dark:text-white/70">1 USD</span>
            <span className="text-[#429de6] dark:text-[#5db3f0] font-bold">
              {isLoadingRates ? "..." : `${displayRates.usd} AMD`}
            </span>
          </span>
          <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
            <span className="text-gray-600 dark:text-white/70">1 EUR</span>
            <span className="text-[#429de6] dark:text-[#5db3f0] font-bold">
              {isLoadingRates ? "..." : `${displayRates.eur} AMD`}
            </span>
          </span>
          <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
            <span className="text-gray-600 dark:text-white/70">EUR/USD</span>
            <span className="text-[#429de6] dark:text-[#5db3f0] font-bold">
              {isLoadingRates ? "..." : eurUsdRate}
            </span>
          </span>
        </div>
        {/* Desktop: original 3-box layout */}
        <div className="hidden sm:flex justify-center items-center gap-6 md:gap-12 flex-wrap">
          <div className="text-center">
            <div className="text-gray-600 dark:text-white/70 text-xs md:text-sm mb-1.5">1 USD</div>
            <div className="text-[#429de6] dark:text-[#5db3f0] font-bold text-lg md:text-xl">
              {isLoadingRates ? "..." : `${displayRates.usd} AMD`}
            </div>
          </div>
          <div className="text-[#429de6]/50 dark:text-[#5db3f0]/50 text-2xl">/</div>
          <div className="text-center">
            <div className="text-gray-600 dark:text-white/70 text-xs md:text-sm mb-1.5">1 EUR</div>
            <div className="text-[#429de6] dark:text-[#5db3f0] font-bold text-lg md:text-xl">
              {isLoadingRates ? "..." : `${displayRates.eur} AMD`}
            </div>
          </div>
          <div className="text-[#429de6]/50 dark:text-[#5db3f0]/50 text-2xl">/</div>
          <div className="text-center">
            <div className="text-gray-600 dark:text-white/70 text-xs md:text-sm mb-1.5">EUR/USD</div>
            <div className="text-[#429de6] dark:text-[#5db3f0] font-bold text-lg md:text-xl">
              {isLoadingRates ? "..." : eurUsdRate}
            </div>
          </div>
        </div>
      </div>

      {/* Calculation Summary */}
      <div className="bg-gradient-to-r from-[#429de6]/10 to-transparent dark:from-[#429de6]/10 dark:to-transparent border-b border-gray-300 dark:border-gray-800 py-2 sm:py-6 px-4 sm:px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* Desktop heading: importer / vehicleType */}
          <p className="hidden sm:block text-[#429de6] dark:text-[#5db3f0] text-sm md:text-base mb-2">
            <span className="font-bold">
              {importer === "legal" ? t("calculator.results.legalPerson") : t("calculator.results.individual")}
            </span>
            <span className="text-gray-400 dark:text-white/50 mx-2">/</span>
            <span className="font-semibold">{vehicleType ? t(`calculator.form.${vehicleType}`) : t("calculator.results.passengerCar")}</span>
          </p>
          {/* Desktop: original `/`-separated paragraph */}
          <p className="hidden sm:block text-gray-700 dark:text-white/80 text-xs md:text-sm leading-relaxed">
            <span className="text-[#429de6] dark:text-[#5db3f0] font-semibold">{currentDateTime}</span>
            <span className="text-gray-400 dark:text-white/50 mx-2">/</span>
            <span className="font-semibold text-[#429de6] dark:text-[#5db3f0]">{activeTab.toUpperCase()}</span>
            <span className="text-gray-400 dark:text-white/50 mx-2">/</span>
            {t("calculator.results.auctionLocationLabel")}: <span className="text-gray-900 dark:text-white font-medium">{auctionLocation || ""}</span>
            <span className="text-gray-400 dark:text-white/50 mx-2">/</span>
            {t("calculator.results.chooseYearLabel")}: <span className="text-[#429de6] dark:text-[#5db3f0] font-semibold">{dateDisplay}</span>
            <span className="text-gray-400 dark:text-white/50 mx-2">/</span>
            {t("calculator.results.engineLabel")}: <span className="text-[#429de6] dark:text-[#5db3f0] font-semibold">
              {engine ? t(`calculator.form.${engine}`) : t("calculator.form.gasoline")}
            </span>
            {engine !== "electric" && (
              <>
                <span className="text-gray-400 dark:text-white/50 mx-2">/</span>
                {t("calculator.results.engineVolumeLabel")}: <span className="text-[#429de6] dark:text-[#5db3f0] font-semibold">{engineVolume || "—"}</span>
              </>
            )}
            {(vehicleType === "truck" || vehicleType === "largeTruck") && weightClass && (
              <>
                <span className="text-gray-400 dark:text-white/50 mx-2">/</span>
                {t("calculator.form.weightClass")}: <span className="text-[#429de6] dark:text-[#5db3f0] font-semibold">
                  {t(`calculator.form.weightClass${weightClass === "under5" ? "Under5" : weightClass === "5to20" ? "5to20" : "Above20"}`)}
                </span>
              </>
            )}
            {vehicleType === "quadricycle" && (
              <>
                <span className="text-gray-400 dark:text-white/50 mx-2">/</span>
                <span className="text-[#429de6] dark:text-[#5db3f0] font-semibold">
                  {t(hasReverse ? "calculator.form.hasReverse" : "calculator.form.noReverse")}
                </span>
              </>
            )}
          </p>

          {/* Mobile: extracted summary card */}
          <MobileResultsSummary
            importer={importer}
            vehicleType={vehicleType}
            activeTab={activeTab}
            auctionLocation={auctionLocation}
            dateDisplay={dateDisplay}
            engine={engine}
            engineVolume={engineVolume}
            weightClass={weightClass}
            hasReverse={hasReverse}
          />
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="p-4 sm:p-6">
        {/* Mobile: extracted stacked cards */}
        <MobileResultsBreakdown
          vehiclePrice={vehiclePrice}
          auctionFee={auctionFee}
          shippingPrice={shippingPrice}
          insuranceFee={insuranceFee}
          hasInsurance={hasInsurance ?? false}
          calculatedServiceFee={calculatedServiceFee}
          otherExpenses={otherExpenses}
          totalAmount={totalAmount}
          taxCalculations={taxCalculations}
          hasRestrictedData={hasRestrictedData}
        />

        {/* Desktop: original 7-column table */}
        <div className="hidden sm:block border border-gray-300 dark:border-gray-800 rounded-xl overflow-x-auto shadow-lg">
          <table className="w-full min-w-[300px]">
            <caption className="sr-only">{t("calculator.results.costBreakdown")}</caption>
            <tbody className="divide-y divide-gray-300 dark:divide-gray-800">
              {/* Row 1: Vehicle price | Customs duty */}
              <tr className="bg-gradient-to-r from-gray-100 to-white dark:from-gray-900 dark:to-gray-900/50 hover:from-gray-200 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-900/60 transition-colors">
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 dark:text-white font-medium text-sm sm:text-base w-[28%]">{t("calculator.form.vehiclePrice")}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-gray-400 dark:text-gray-600 text-base sm:text-lg w-[5%]">/</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-[#429de6] dark:text-[#5db3f0] font-semibold text-sm sm:text-base whitespace-nowrap w-[14%]">
                  ${vehiclePrice || "0"}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 dark:text-white font-medium text-sm sm:text-base w-[28%]">{t("calculator.results.customsDuty")}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-gray-400 dark:text-gray-600 text-base sm:text-lg w-[5%]">/</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-semibold text-sm sm:text-base whitespace-nowrap w-[12%]">
                  {hasRestrictedData ? (
                    <span className="text-[#429de6] dark:text-[#5db3f0]">${taxCalculations.customsUsd}</span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 opacity-60 blur-[3px] select-none">$000</span>
                  )}
                </td>
                {/* Tax summary — smooth brace + total spanning 3 tax rows */}
                <td rowSpan={3} className="align-middle px-0 w-[120px] sm:w-[140px]">
                  <div className="flex items-center justify-center h-full">
                    <svg className="shrink-0 w-[20px] sm:w-[24px] self-stretch" viewBox="0 0 14 100" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M2 0 C6 0, 7 2, 7 12 L7 42 C7 46, 9 50, 12 50 C9 50, 7 54, 7 58 L7 88 C7 98, 6 100, 2 100"
                        stroke="url(#braceGradient)"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <defs>
                        <linearGradient id="braceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#429de6" stopOpacity="0.3" />
                          <stop offset="45%" stopColor="#429de6" stopOpacity="0.7" />
                          <stop offset="55%" stopColor="#429de6" stopOpacity="0.7" />
                          <stop offset="100%" stopColor="#429de6" stopOpacity="0.3" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="pl-2 sm:pl-3 pr-2 sm:pr-4">
                      {hasRestrictedData ? (
                        <span className="text-[#429de6] dark:text-[#5db3f0] font-bold text-sm sm:text-base whitespace-nowrap">
                          ${taxTotal}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 opacity-60 blur-[3px] select-none text-sm">$000</span>
                      )}
                    </div>
                  </div>
                </td>
              </tr>

              {/* Row 2: Auction fee | VAT */}
              <tr className="bg-gradient-to-r from-white to-gray-50 dark:from-black dark:to-gray-900/30 hover:from-gray-100 hover:to-white dark:hover:from-gray-900 dark:hover:to-gray-900/40 transition-colors">
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 dark:text-white font-medium text-sm sm:text-base">{t("calculator.form.auctionFee")}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-gray-400 dark:text-gray-600 text-base sm:text-lg">/</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-[#429de6] dark:text-[#5db3f0] font-semibold text-sm sm:text-base whitespace-nowrap">
                  ${auctionFee || "0"}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 dark:text-white font-medium text-sm sm:text-base">{t("calculator.results.vat")}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-gray-400 dark:text-gray-600 text-base sm:text-lg">/</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-semibold text-sm sm:text-base whitespace-nowrap">
                  {hasRestrictedData ? (
                    <span className="text-[#429de6] dark:text-[#5db3f0]">${taxCalculations.vatUsd}</span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 opacity-60 blur-[3px] select-none">$000</span>
                  )}
                </td>
              </tr>

              {/* Row 3: Transportation fee | Environmental tax */}
              <tr className="bg-gradient-to-r from-gray-100 to-white dark:from-gray-900 dark:to-gray-900/50 hover:from-gray-200 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-900/60 transition-colors">
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 dark:text-white font-medium text-sm sm:text-base">{t("calculator.form.transportationFee")}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-gray-400 dark:text-gray-600 text-base sm:text-lg">/</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-semibold text-sm sm:text-base whitespace-nowrap">
                  {hasRestrictedData ? (
                    <span className="text-[#429de6] dark:text-[#5db3f0]">${shippingPrice ?? "0"}</span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 opacity-60 blur-[3px] select-none">$000</span>
                  )}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 dark:text-white font-medium text-sm sm:text-base">{t("calculator.results.environmentalTax")}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-gray-400 dark:text-gray-600 text-base sm:text-lg">/</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-semibold text-sm sm:text-base whitespace-nowrap">
                  {hasRestrictedData ? (
                    <span className="text-[#429de6] dark:text-[#5db3f0]">${taxCalculations.envTaxUsd}</span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 opacity-60 blur-[3px] select-none">$000</span>
                  )}
                </td>
              </tr>

              {/* Row 4: Insurance | Service fee */}
              <tr className="bg-gradient-to-r from-white to-gray-50 dark:from-black dark:to-gray-900/30 hover:from-gray-100 hover:to-white dark:hover:from-gray-900 dark:hover:to-gray-900/40 transition-colors">
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 dark:text-white font-medium text-sm sm:text-base">{t("calculator.form.insurance")}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-gray-400 dark:text-gray-600 text-base sm:text-lg">/</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-semibold text-sm sm:text-base whitespace-nowrap">
                  {hasRestrictedData ? (
                    hasInsurance ? (
                      <span className="text-[#429de6] dark:text-[#5db3f0]">${insuranceFee ?? "0"}</span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600">-</span>
                    )
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 opacity-60 blur-[3px] select-none">$000</span>
                  )}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 dark:text-white font-medium text-sm sm:text-base">{t("calculator.form.serviceFee")}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-gray-400 dark:text-gray-600 text-base sm:text-lg">/</td>
                <td colSpan={2} className="px-3 sm:px-6 py-3 sm:py-4 text-right font-semibold text-sm sm:text-base whitespace-nowrap">
                  {hasRestrictedData ? (
                    <span className="text-[#429de6] dark:text-[#5db3f0]">${calculatedServiceFee}</span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 opacity-60 blur-[3px] select-none">$000</span>
                  )}
                </td>
              </tr>

              {/* Row 5: Other Expenses (only if value > 0) */}
              {(parseFloat(otherExpenses ?? "0") || 0) > 0 && (
                <tr className="bg-gradient-to-r from-gray-100 to-white dark:from-gray-900 dark:to-gray-900/50 hover:from-gray-200 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-900/60 transition-colors">
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 dark:text-white font-medium text-sm sm:text-base">{t("calculator.form.otherExpenses")}</td>
                  <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-gray-400 dark:text-gray-600 text-base sm:text-lg">/</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-[#429de6] dark:text-[#5db3f0] font-semibold text-sm sm:text-base whitespace-nowrap">
                    ${otherExpenses}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4"></td>
                  <td className="px-2 sm:px-4 py-3 sm:py-4"></td>
                  <td colSpan={2} className="px-3 sm:px-6 py-3 sm:py-4"></td>
                </tr>
              )}

              {/* Total row - full width */}
              <tr className="bg-gradient-to-r from-[#429de6]/10 to-[#429de6]/20 dark:from-[#429de6]/20 dark:to-[#429de6]/10 hover:from-[#429de6]/20 hover:to-[#429de6]/30 dark:hover:from-[#429de6]/30 dark:hover:to-[#429de6]/20 transition-colors border-t-2 border-[#429de6]/30 dark:border-[#429de6]/50">
                <td colSpan={5} className="px-3 sm:px-6 py-4 sm:py-5 text-gray-900 dark:text-white font-bold text-base sm:text-lg">{t("calculator.results.totalAmount")}</td>
                <td colSpan={2} className="px-3 sm:px-6 py-4 sm:py-5 text-right font-bold text-xl sm:text-2xl whitespace-nowrap">
                  {hasRestrictedData ? (
                    <span className="text-[#429de6] dark:text-[#5db3f0]">${totalAmount}</span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 opacity-40 blur-[4px] select-none">$partner</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Partner Message - Only show on home page */}
        {showPartnerMessage && (
          <div className="mt-6 sm:mt-8 text-center py-4 sm:py-6 px-4 bg-gradient-to-r from-[#429de6]/10 via-[#429de6]/5 to-[#429de6]/10 dark:from-[#429de6]/10 dark:via-[#429de6]/15 dark:to-[#429de6]/10 rounded-xl border border-[#429de6]/30 dark:border-[#429de6]/30 shadow-sm">
            <p className="text-[#429de6] dark:text-[#5db3f0] text-base sm:text-lg md:text-xl font-bold">
              <Link
                href="/partners"
                className="underline decoration-[#429de6]/50 hover:decoration-[#429de6] dark:hover:decoration-[#5db3f0] transition-all cursor-pointer hover:text-[#3a8acc] dark:hover:text-[#6fc0f5]"
              >
                {t("calculator.results.partnerMessage")}
              </Link>
            </p>
          </div>
        )}

        {/* Important Notice */}
        <div className="mt-3 sm:mt-6 mb-4 sm:mb-6 bg-gradient-to-br from-red-50 via-red-100/50 to-white dark:from-red-900/20 dark:via-red-800/10 dark:to-transparent border border-red-300 dark:border-red-800/50 rounded-xl p-4 sm:p-6 shadow-md">
          <h3 className="text-red-600 dark:text-red-400 font-bold mb-2 sm:mb-3 text-center text-base sm:text-lg md:text-xl flex items-center justify-center gap-2">
            <span aria-hidden="true" className="text-lg sm:text-2xl">⚠</span>
            {t("calculator.results.importantTitle")}
          </h3>
          <p className="text-gray-800 dark:text-white/90 text-sm sm:text-sm md:text-base leading-snug sm:leading-relaxed text-center">
            {t("calculator.results.importantNotice")}
          </p>
        </div>
      </div>
    </div>
  );
};
