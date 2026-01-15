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
  calculationResults: CalculatorResponse | null;
  isLoggedIn: boolean;
  onBack: () => void;
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
  calculationResults,
  isLoggedIn,
  onBack,
}: CalculatorResultsProps) => {
  const t = useTranslations();
  const locale = useLocale();
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState(true);

  useEffect(() => {
    const loadExchangeRates = async () => {
      const result = await fetchExchangeRates();
      if (result.success) {
        setExchangeRates(result.data);
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

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black rounded-2xl border border-gray-300 dark:border-gray-800 overflow-hidden shadow-xl">
      {/* Exchange Rates */}
      <div className="bg-gray-100 dark:bg-black/40 border-b border-gray-300 dark:border-gray-800 py-4 sm:py-6 md:py-8 px-4 sm:px-6">
        <div className="flex justify-center items-center gap-6 md:gap-12 flex-wrap">
          <div className="text-center">
            <div className="text-gray-600 dark:text-white/70 text-xs md:text-sm mb-1.5">1 USD</div>
            <div className="text-orange-600 dark:text-orange-500 font-bold text-lg md:text-xl">
              {isLoadingRates ? "..." : `${parseFloat(usdRate).toFixed(2)} AMD`}
            </div>
          </div>
          <div className="text-orange-600/50 dark:text-orange-500/50 text-2xl">/</div>
          <div className="text-center">
            <div className="text-gray-600 dark:text-white/70 text-xs md:text-sm mb-1.5">1 EUR</div>
            <div className="text-orange-600 dark:text-orange-500 font-bold text-lg md:text-xl">
              {isLoadingRates ? "..." : `${parseFloat(eurRate).toFixed(2)} AMD`}
            </div>
          </div>
          <div className="text-orange-600/50 dark:text-orange-500/50 text-2xl">/</div>
          <div className="text-center">
            <div className="text-gray-600 dark:text-white/70 text-xs md:text-sm mb-1.5">EUR/USD</div>
            <div className="text-orange-600 dark:text-orange-500 font-bold text-lg md:text-xl">
              {isLoadingRates ? "..." : eurUsdRate}
            </div>
          </div>
        </div>
      </div>

      {/* Calculation Summary */}
      <div className="bg-gradient-to-r from-orange-100 to-transparent dark:from-orange-500/10 dark:to-transparent border-b border-gray-300 dark:border-gray-800 py-4 sm:py-6 px-4 sm:px-6">
        <div className="text-center max-w-4xl mx-auto">
          <p className="text-orange-600 dark:text-orange-400 text-sm md:text-base mb-2">
            <span className="font-bold">
              {importer === "legal" ? t("calculator.results.legalPerson") : t("calculator.results.individual")}
            </span>
            <span className="text-gray-400 dark:text-white/50 mx-2">/</span>
            <span className="font-semibold">{vehicleType || t("calculator.results.passengerCar")}</span>
          </p>
          <p className="text-gray-700 dark:text-white/80 text-xs md:text-sm leading-relaxed">
            <span className="text-orange-600 dark:text-orange-400 font-semibold">{getCurrentDateTime()}</span>
            <span className="text-gray-400 dark:text-white/50 mx-2">/</span>
            <span className="font-semibold text-orange-600 dark:text-orange-400">{activeTab.toUpperCase()}</span>
            <span className="text-gray-400 dark:text-white/50 mx-2">/</span>
            {t("calculator.results.auctionLocationLabel")}: <span className="text-gray-900 dark:text-white font-medium">{auctionLocation || ""}</span>
            <span className="text-gray-400 dark:text-white/50 mx-2">/</span>
            {t("calculator.results.chooseYearLabel")}: <span className="text-orange-600 dark:text-orange-400 font-semibold">{year || new Date().getFullYear()}/{month || "--"}/{day || "--"}</span>
            <span className="text-gray-400 dark:text-white/50 mx-2">/</span>
            {t("calculator.results.engineLabel")}: <span className="text-orange-600 dark:text-orange-400 font-semibold">
              {engine ? t(`calculator.form.${engine}`) : t("calculator.form.gasoline")}
            </span>
            <span className="text-gray-400 dark:text-white/50 mx-2">/</span>
            {t("calculator.results.engineVolumeLabel")}: <span className="text-orange-600 dark:text-orange-400 font-semibold">{engineVolume || "1"}</span>
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
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-orange-600 font-semibold text-sm sm:text-base w-[15%]">
                  {isLoggedIn ? `€${vehiclePrice || "0"}` : <span className="opacity-50 blur-[2px] select-none">$partner</span>}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 dark:text-white font-medium text-sm sm:text-base w-[30%]">{t("calculator.results.customsDuty")}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-gray-400 dark:text-gray-600 text-base sm:text-lg w-[5%]">/</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-orange-600 font-semibold text-sm sm:text-base w-[15%]">
                  {isLoggedIn ? `€${(calculationResults?.globTax ?? 0).toFixed(2)}` : <span className="opacity-50 blur-[2px] select-none">$partner</span>}
                </td>
              </tr>

              {/* Row 2: Auction fee | VAT */}
              <tr className="bg-gradient-to-r from-white to-gray-50 dark:from-black dark:to-gray-900/30 hover:from-gray-100 hover:to-white dark:hover:from-gray-900 dark:hover:to-gray-900/40 transition-colors">
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 dark:text-white font-medium text-sm sm:text-base">{t("calculator.form.auctionFee")}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-gray-400 dark:text-gray-600 text-base sm:text-lg">/</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-orange-600 font-semibold text-sm sm:text-base">
                  {isLoggedIn ? `$${auctionFee || "0"}` : <span className="opacity-50 blur-[2px] select-none">$partner</span>}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 dark:text-white font-medium text-sm sm:text-base">{t("calculator.results.vat")}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-gray-400 dark:text-gray-600 text-base sm:text-lg">/</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-orange-600 font-semibold text-sm sm:text-base">
                  {isLoggedIn ? `€${(calculationResults?.nds ?? 0).toFixed(2)}` : <span className="opacity-50 blur-[2px] select-none">$partner</span>}
                </td>
              </tr>

              {/* Row 3: Transportation fee | Environmental tax */}
              <tr className="bg-gradient-to-r from-gray-100 to-white dark:from-gray-900 dark:to-gray-900/50 hover:from-gray-200 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-900/60 transition-colors">
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 dark:text-white font-medium text-sm sm:text-base">{t("calculator.form.transportationFee")}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-gray-400 dark:text-gray-600 text-base sm:text-lg">/</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-orange-600 font-semibold text-sm sm:text-base"><span className="opacity-50 blur-[2px] select-none">$partner</span></td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 dark:text-white font-medium text-sm sm:text-base">{t("calculator.results.environmentalTax")}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-gray-400 dark:text-gray-600 text-base sm:text-lg">/</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-orange-600 font-semibold text-sm sm:text-base">
                  {isLoggedIn ? `€${(calculationResults?.envTaxPay ?? 0).toFixed(2)}` : <span className="opacity-50 blur-[2px] select-none">$partner</span>}
                </td>
              </tr>

              {/* Row 4: Insurance | Service fee */}
              <tr className="bg-gradient-to-r from-white to-gray-50 dark:from-black dark:to-gray-900/30 hover:from-gray-100 hover:to-white dark:hover:from-gray-900 dark:hover:to-gray-900/40 transition-colors">
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 dark:text-white font-medium text-sm sm:text-base">{t("calculator.form.insurance")}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-gray-400 dark:text-gray-600 text-base sm:text-lg">/</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-orange-600 font-semibold text-sm sm:text-base"><span className="opacity-50 blur-[2px] select-none">$partner</span></td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 dark:text-white font-medium text-sm sm:text-base">{t("calculator.form.serviceFee")}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-center text-gray-400 dark:text-gray-600 text-base sm:text-lg">/</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-orange-600 font-semibold text-sm sm:text-base"><span className="opacity-50 blur-[2px] select-none">$partner</span></td>
              </tr>

              {/* Total row - full width */}
              <tr className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900/30 dark:hover:to-orange-800/30 transition-colors border-t-2 border-orange-300 dark:border-orange-600">
                <td colSpan={4} className="px-3 sm:px-6 py-4 sm:py-5 text-gray-900 dark:text-white font-bold text-base sm:text-lg">{t("calculator.results.totalAmount")}</td>
                <td className="px-2 sm:px-4 py-4 sm:py-5 text-center text-orange-400 dark:text-orange-600 text-lg sm:text-xl font-bold">/</td>
                <td className="px-3 sm:px-6 py-4 sm:py-5 text-right text-orange-600 dark:text-orange-400 font-bold text-xl sm:text-2xl">
                  {isLoggedIn ? `€${(calculationResults?.sumPay ?? 0).toFixed(2)}` : <span className="opacity-40 blur-[4px] select-none">$partner</span>}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Partner Message */}
        <div className="mt-6 sm:mt-8 text-center py-4 sm:py-6 px-4 bg-gradient-to-r from-orange-100 via-orange-50 to-orange-100 dark:from-orange-500/5 dark:via-orange-500/10 dark:to-orange-500/5 rounded-xl border border-orange-300 dark:border-orange-500/20 shadow-sm">
          <p className="text-orange-600 dark:text-orange-400 text-base sm:text-lg md:text-xl font-bold">
            <Link 
              href={`/${locale}/partners`}
              className="underline decoration-orange-500/50 hover:decoration-orange-600 dark:hover:decoration-orange-500 transition-all cursor-pointer hover:text-orange-700 dark:hover:text-orange-300"
            >
              {t("calculator.results.partnerMessage")}
            </Link>
          </p>
        </div>

        {/* Important Notice */}
        <div className="mt-4 sm:mt-6 bg-gradient-to-br from-red-50 via-red-100/50 to-white dark:from-red-900/20 dark:via-red-800/10 dark:to-transparent border border-red-300 dark:border-red-800/50 rounded-xl p-4 sm:p-6 shadow-md">
          <h3 className="text-red-600 dark:text-red-400 font-bold mb-2 sm:mb-3 text-center text-base sm:text-lg md:text-xl flex items-center justify-center gap-2">
            <span className="text-xl sm:text-2xl">⚠</span>
            {t("calculator.results.importantTitle")}
          </h3>
          <p className="text-gray-800 dark:text-white/90 text-xs sm:text-sm md:text-base leading-relaxed text-center">
            {t("calculator.results.importantNotice")}
          </p>
        </div>

        {/* Back to Calculator Button */}
        <div className="flex justify-center mt-6 sm:mt-8 mb-2">
          <button
            onClick={onBack}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#429de6] to-[#3a8acc] text-white font-semibold rounded-xl hover:from-[#3a8acc] hover:to-[#2d7ab8] transition-all shadow-lg hover:shadow-2xl hover:shadow-blue-500/30 flex items-center gap-2 sm:gap-3 text-base sm:text-lg transform hover:scale-105 active:scale-95"
            type="button"
          >
            <span className="text-xl sm:text-2xl">←</span>
            {t("calculator.results.backToCalculator")}
          </button>
        </div>
      </div>
    </div>
  );
};
