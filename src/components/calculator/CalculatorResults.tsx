"use client";

import { useEffect, useState } from "react";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

import type { CalculatorResponse } from "@/lib/import-calculator/calculateVehicleTaxes";
import {
  fetchExchangeRates,
  calculateEurUsdRate,
  type ExchangeRates,
} from "@/lib/import-calculator/fetchExchangeRates";

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
  showPartnerMessage?: boolean;
  onBack: () => void;
  // Restricted data - only provided in admin panel
  serviceFee?: string;
  insuranceFee?: string;
  shippingPrice?: number;
  calculationResults?: CalculatorResponse | null;
  hasInsurance?: boolean;
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
  showPartnerMessage = false,
  onBack,
  // Restricted data - only available in admin
  serviceFee,
  insuranceFee,
  shippingPrice,
  calculationResults,
  hasInsurance = false,
}: CalculatorResultsProps) => {
  const t = useTranslations();
  const locale = useLocale();
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);

  // Check if restricted data is available (admin panel)
  const hasRestrictedData = calculationResults !== undefined;
  const [isLoadingRates, setIsLoadingRates] = useState(true);


  useEffect(() => {
    console.log(insuranceFee, 'insuranceFee');
  }, [insuranceFee]);

  useEffect(() => {
    const loadExchangeRates = async () => {
      const result = await fetchExchangeRates();
      if (result.success) {
        setExchangeRates(result.data);
        } else {
          console.error("Failed to fetch exchange rates:", result.error);
          // Use fallback rates - approximate rates for calculation
          setExchangeRates({
            USD: "380.33",
            EUR: "443.24",
          });
        }
      setIsLoadingRates(false);
    };

    loadExchangeRates();
  }, []);

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace("T", " ");
  };

  const usdRate = exchangeRates?.USD || "380.33";
  const eurRate = exchangeRates?.EUR || "443.24";
  const eurUsdRate = exchangeRates ? calculateEurUsdRate(exchangeRates) : "1.1774";

  // Calculate total including all fees - ALL IN USD (only when restricted data is available)
  const calculateTotal = () => {
    if (!hasRestrictedData) return 0;
    
    const eurUsdRateNum = parseFloat(eurUsdRate);
    
    // Vehicle price and shipping in USD (already integers)
    const vehiclePriceUsd = parseFloat(vehiclePrice) || 0;
    const shippingPriceUsd = shippingPrice || 0;
    
    // Backend taxes: convert each one individually and round, then sum
    const customsUsd = Math.round((calculationResults?.globTax ?? 0) / eurUsdRateNum);
    const vatUsd = Math.round((calculationResults?.nds ?? 0) / eurUsdRateNum);
    const envTaxUsd = Math.round((calculationResults?.envTaxPay ?? 0) / eurUsdRateNum);
    
    // All other fees are already in USD
    const auctionFeeUsd = parseFloat(auctionFee) || 0;
    const serviceFeeUsd = parseFloat(serviceFee || "0") || 0;
    // Only include insurance if hasInsurance is true
    const insuranceFeeUsd = hasInsurance ? (parseFloat(insuranceFee || "0") || 0) : 0;
    
    // Total = sum of all rounded values
    const totalUsd = vehiclePriceUsd + shippingPriceUsd + customsUsd + vatUsd + envTaxUsd + auctionFeeUsd + serviceFeeUsd + insuranceFeeUsd;
    
    return Math.round(totalUsd);
  };

  const totalAmount = calculateTotal();

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black rounded-2xl border border-gray-300 dark:border-gray-800 overflow-hidden shadow-xl">
      {/* Back Button - Top Left */}
      <div className="bg-gray-100 dark:bg-black/40 border-b border-gray-300 dark:border-gray-800 px-4 sm:px-6 py-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-[#429de6] dark:text-[#5db3f0] hover:text-[#3a8acc] dark:hover:text-[#6fc0f5] transition-colors group"
          type="button"
        >
          <svg 
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
      <div className="bg-gray-100 dark:bg-black/40 border-b border-gray-300 dark:border-gray-800 py-4 sm:py-6 md:py-8 px-4 sm:px-6">
        <div className="flex justify-center items-center gap-6 md:gap-12 flex-wrap">
          <div className="text-center">
            <div className="text-gray-600 dark:text-white/70 text-xs md:text-sm mb-1.5">1 USD</div>
            <div className="text-[#429de6] dark:text-[#5db3f0] font-bold text-lg md:text-xl">
              {isLoadingRates ? "..." : `${Math.round(parseFloat(usdRate))} AMD`}
            </div>
          </div>
          <div className="text-[#429de6]/50 dark:text-[#5db3f0]/50 text-2xl">/</div>
          <div className="text-center">
            <div className="text-gray-600 dark:text-white/70 text-xs md:text-sm mb-1.5">1 EUR</div>
            <div className="text-[#429de6] dark:text-[#5db3f0] font-bold text-lg md:text-xl">
              {isLoadingRates ? "..." : `${Math.round(parseFloat(eurRate))} AMD`}
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
      <div className="bg-gradient-to-r from-[#429de6]/10 to-transparent dark:from-[#429de6]/10 dark:to-transparent border-b border-gray-300 dark:border-gray-800 py-4 sm:py-6 px-4 sm:px-6">
        <div className="text-center max-w-4xl mx-auto">
          <p className="text-[#429de6] dark:text-[#5db3f0] text-sm md:text-base mb-2">
            <span className="font-bold">
              {importer === "legal" ? t("calculator.results.legalPerson") : t("calculator.results.individual")}
            </span>
            <span className="text-gray-400 dark:text-white/50 mx-2">/</span>
            <span className="font-semibold">{vehicleType ? t(`calculator.form.${vehicleType}`) : t("calculator.results.passengerCar")}</span>
          </p>
          <p className="text-gray-700 dark:text-white/80 text-xs md:text-sm leading-relaxed">
            <span className="text-[#429de6] dark:text-[#5db3f0] font-semibold">{getCurrentDateTime()}</span>
            <span className="text-gray-400 dark:text-white/50 mx-2">/</span>
            <span className="font-semibold text-[#429de6] dark:text-[#5db3f0]">{activeTab.toUpperCase()}</span>
            <span className="text-gray-400 dark:text-white/50 mx-2">/</span>
            {t("calculator.results.auctionLocationLabel")}: <span className="text-gray-900 dark:text-white font-medium">{auctionLocation || ""}</span>
            <span className="text-gray-400 dark:text-white/50 mx-2">/</span>
            {t("calculator.results.chooseYearLabel")}: <span className="text-[#429de6] dark:text-[#5db3f0] font-semibold">{year || new Date().getFullYear()}/{month || "--"}/{day || "--"}</span>
            <span className="text-gray-400 dark:text-white/50 mx-2">/</span>
            {t("calculator.results.engineLabel")}: <span className="text-[#429de6] dark:text-[#5db3f0] font-semibold">
              {engine ? t(`calculator.form.${engine}`) : t("calculator.form.gasoline")}
            </span>
            <span className="text-gray-400 dark:text-white/50 mx-2">/</span>
            {t("calculator.results.engineVolumeLabel")}: <span className="text-[#429de6] dark:text-[#5db3f0] font-semibold">{engineVolume || "1"}</span>
          </p>
        </div>
      </div>

      {/* Cost Breakdown Table */}
      <div className="p-4 sm:p-6">
        <div className="border border-gray-300 dark:border-gray-800 rounded-xl overflow-x-auto shadow-lg">
          <table className="w-full min-w-[300px]">
            <tbody className="divide-y divide-gray-300 dark:divide-gray-800">
              {/* Row 1: Vehicle price | Customs duty */}
              <tr className="bg-gradient-to-r from-gray-100 to-white dark:from-gray-900 dark:to-gray-900/50 hover:from-gray-200 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-900/60 transition-colors">
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 dark:text-white font-medium text-sm sm:text-base w-[30%]">{t("calculator.form.vehiclePrice")}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-gray-400 dark:text-gray-600 text-base sm:text-lg w-[5%]">/</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-[#429de6] dark:text-[#5db3f0] font-semibold text-sm sm:text-base w-[15%]">
                  ${vehiclePrice || "0"}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 dark:text-white font-medium text-sm sm:text-base w-[30%]">{t("calculator.results.customsDuty")}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-gray-400 dark:text-gray-600 text-base sm:text-lg w-[5%]">/</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-semibold text-sm sm:text-base w-[15%]">
                  {hasRestrictedData ? (
                    <span className="text-[#429de6] dark:text-[#5db3f0]">${Math.round((calculationResults?.globTax ?? 0) / parseFloat(eurUsdRate))}</span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 opacity-60 blur-[3px] select-none">$000</span>
                  )}
                </td>
              </tr>

              {/* Row 2: Auction fee | VAT */}
              <tr className="bg-gradient-to-r from-white to-gray-50 dark:from-black dark:to-gray-900/30 hover:from-gray-100 hover:to-white dark:hover:from-gray-900 dark:hover:to-gray-900/40 transition-colors">
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 dark:text-white font-medium text-sm sm:text-base">{t("calculator.form.auctionFee")}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-gray-400 dark:text-gray-600 text-base sm:text-lg">/</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-[#429de6] dark:text-[#5db3f0] font-semibold text-sm sm:text-base">
                  ${auctionFee || "0"}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 dark:text-white font-medium text-sm sm:text-base">{t("calculator.results.vat")}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-gray-400 dark:text-gray-600 text-base sm:text-lg">/</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-semibold text-sm sm:text-base">
                  {hasRestrictedData ? (
                    <span className="text-[#429de6] dark:text-[#5db3f0]">${Math.round((calculationResults?.nds ?? 0) / parseFloat(eurUsdRate))}</span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 opacity-60 blur-[3px] select-none">$000</span>
                  )}
                </td>
              </tr>

              {/* Row 3: Transportation fee | Environmental tax */}
              <tr className="bg-gradient-to-r from-gray-100 to-white dark:from-gray-900 dark:to-gray-900/50 hover:from-gray-200 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-900/60 transition-colors">
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 dark:text-white font-medium text-sm sm:text-base">{t("calculator.form.transportationFee")}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-gray-400 dark:text-gray-600 text-base sm:text-lg">/</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-semibold text-sm sm:text-base">
                  {hasRestrictedData ? (
                    <span className="text-[#429de6] dark:text-[#5db3f0]">${shippingPrice || "0"}</span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 opacity-60 blur-[3px] select-none">$000</span>
                  )}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 dark:text-white font-medium text-sm sm:text-base">{t("calculator.results.environmentalTax")}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-gray-400 dark:text-gray-600 text-base sm:text-lg">/</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-semibold text-sm sm:text-base">
                  {hasRestrictedData ? (
                    <span className="text-[#429de6] dark:text-[#5db3f0]">${Math.round((calculationResults?.envTaxPay ?? 0) / parseFloat(eurUsdRate))}</span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 opacity-60 blur-[3px] select-none">$000</span>
                  )}
                </td>
              </tr>

              {/* Row 4: Insurance | Service fee */}
              <tr className="bg-gradient-to-r from-white to-gray-50 dark:from-black dark:to-gray-900/30 hover:from-gray-100 hover:to-white dark:hover:from-gray-900 dark:hover:to-gray-900/40 transition-colors">
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 dark:text-white font-medium text-sm sm:text-base">{t("calculator.form.insurance")}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-gray-400 dark:text-gray-600 text-base sm:text-lg">/</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-semibold text-sm sm:text-base">
                  {hasRestrictedData ? (
                    hasInsurance ? (
                      <span className="text-[#429de6] dark:text-[#5db3f0]">${insuranceFee || "0"}</span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600">-</span>
                    )
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 opacity-60 blur-[3px] select-none">$000</span>
                  )}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 dark:text-white font-medium text-sm sm:text-base">{t("calculator.form.serviceFee")}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-gray-400 dark:text-gray-600 text-base sm:text-lg">/</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-semibold text-sm sm:text-base">
                  {hasRestrictedData ? (
                    <span className="text-[#429de6] dark:text-[#5db3f0]">${serviceFee || "0"}</span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 opacity-60 blur-[3px] select-none">$000</span>
                  )}
                </td>
              </tr>

              {/* Total row - full width */}
              <tr className="bg-gradient-to-r from-[#429de6]/10 to-[#429de6]/20 dark:from-[#429de6]/20 dark:to-[#429de6]/10 hover:from-[#429de6]/20 hover:to-[#429de6]/30 dark:hover:from-[#429de6]/30 dark:hover:to-[#429de6]/20 transition-colors border-t-2 border-[#429de6]/30 dark:border-[#429de6]/50">
                <td colSpan={4} className="px-3 sm:px-6 py-4 sm:py-5 text-gray-900 dark:text-white font-bold text-base sm:text-lg">{t("calculator.results.totalAmount")}</td>
                <td className="px-2 sm:px-4 py-4 sm:py-5 text-center text-[#429de6]/60 dark:text-[#5db3f0]/70 text-lg sm:text-xl font-bold">/</td>
                <td className="px-3 sm:px-6 py-4 sm:py-5 text-right font-bold text-xl sm:text-2xl">
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
                href={`/${locale}/partners`}
                className="underline decoration-[#429de6]/50 hover:decoration-[#429de6] dark:hover:decoration-[#5db3f0] transition-all cursor-pointer hover:text-[#3a8acc] dark:hover:text-[#6fc0f5]"
              >
                {t("calculator.results.partnerMessage")}
              </Link>
            </p>
          </div>
        )}

        {/* Important Notice */}
        <div className="mt-4 sm:mt-6 mb-6 bg-gradient-to-br from-red-50 via-red-100/50 to-white dark:from-red-900/20 dark:via-red-800/10 dark:to-transparent border border-red-300 dark:border-red-800/50 rounded-xl p-4 sm:p-6 shadow-md">
          <h3 className="text-red-600 dark:text-red-400 font-bold mb-2 sm:mb-3 text-center text-base sm:text-lg md:text-xl flex items-center justify-center gap-2">
            <span className="text-xl sm:text-2xl">⚠</span>
            {t("calculator.results.importantTitle")}
          </h3>
          <p className="text-gray-800 dark:text-white/90 text-xs sm:text-sm md:text-base leading-relaxed text-center">
            {t("calculator.results.importantNotice")}
          </p>
        </div>
      </div>
    </div>
  );
};
