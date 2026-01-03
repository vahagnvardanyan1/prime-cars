"use client";

import type { FormEvent } from "react";

import { useMemo, useState } from "react";

import { Calculator, DollarSign, Info, FileText, Ship, Wrench } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { calculateImportCosts } from "@/lib/import-calculator/calculateImportCosts";

export const ImportCalculator = () => {
  const t = useTranslations();
  const locale = useLocale();

  const [vehiclePrice, setVehiclePrice] = useState("");
  const [country, setCountry] = useState("japan");
  const [vehicleType, setVehicleType] = useState("sedan");
  const [showResults, setShowResults] = useState(false);

  const costs = useMemo(() => {
    return calculateImportCosts({
      vehiclePriceUsd: Number.parseFloat(vehiclePrice) || 0,
      originCountry: country,
      vehicleType,
    });
  }, [country, vehiclePrice, vehicleType]);

  const handleCalculate = (e: FormEvent) => {
    e.preventDefault();
    setShowResults(true);
  };

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3">
        <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-300 dark:border-white/10 p-8 transition-colors duration-300">
          <h2 className="text-gray-900 dark:text-white mb-6">
            {t("calculator.form.vehicleInfo")}
          </h2>

          <form onSubmit={handleCalculate} className="space-y-6">
            <div>
              <label className="block text-gray-900 dark:text-white mb-2">
                {t("calculator.form.purchasePriceLabel")}
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
                <input
                  type="number"
                  value={vehiclePrice}
                  onChange={(e) => setVehiclePrice(e.target.value)}
                  placeholder={t("calculator.form.purchasePricePlaceholder")}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-black border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#429de6] focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-500"
                />
              </div>
              <p className="text-gray-600 dark:text-gray-500 mt-2">
                {t("calculator.form.purchasePriceHint")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 dark:text-white mb-2">
                  {t("calculator.form.originCountry")}
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 dark:bg-black border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#429de6] focus:border-transparent text-gray-900 dark:text-white"
                >
                  <option value="japan">{t("calculator.form.countries.japan")}</option>
                  <option value="usa">{t("calculator.form.countries.usa")}</option>
                  <option value="germany">{t("calculator.form.countries.germany")}</option>
                  <option value="uk">{t("calculator.form.countries.uk")}</option>
                  <option value="italy">{t("calculator.form.countries.italy")}</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-900 dark:text-white mb-2">
                  {t("calculator.form.vehicleType")}
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 dark:bg-black border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#429de6] focus:border-transparent text-gray-900 dark:text-white"
                >
                  <option value="sedan">{t("calculator.form.types.sedan")}</option>
                  <option value="suv">{t("calculator.form.types.suv")}</option>
                  <option value="sports">{t("calculator.form.types.sports")}</option>
                  <option value="luxury">{t("calculator.form.types.luxury")}</option>
                  <option value="electric">{t("calculator.form.types.electric")}</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 dark:text-white mb-2">
                  {t("calculator.form.engineSize")}
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="2.0"
                  className="w-full px-4 py-4 bg-gray-50 dark:bg-black border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#429de6] focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-gray-900 dark:text-white mb-2">
                  {t("calculator.form.vehicleYear")}
                </label>
                <input
                  type="number"
                  placeholder="2023"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  className="w-full px-4 py-4 bg-gray-50 dark:bg-black border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#429de6] focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                className="w-full py-4 bg-[#429de6] text-white rounded-lg hover:bg-[#3a8acc] transition-all hover:shadow-lg hover:shadow-blue-500/20"
              >
                {t("calculator.form.calculate")}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-[#429de6]/10 border border-[#429de6]/20 rounded-2xl p-6">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-[#429de6] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-gray-900 dark:text-white mb-2">
                {t("calculator.form.noticeTitle")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t("calculator.form.noticeBody")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-300 dark:border-white/10 p-8 sticky top-28 transition-colors duration-300">
          <h2 className="text-gray-900 dark:text-white mb-6">
            {t("calculator.breakdown.title")}
          </h2>

          {!showResults || !vehiclePrice ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-300 dark:border-white/10">
                <Calculator className="w-10 h-10 text-gray-500 dark:text-gray-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {t("calculator.breakdown.empty")}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between py-4 border-b border-gray-300 dark:border-white/10">
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-gray-900 dark:text-white">
                      {t("calculator.breakdown.rows.base.title")}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      {t("calculator.breakdown.rows.base.subtitle")}
                    </div>
                  </div>
                </div>
                <div className="text-gray-900 dark:text-white">
                  ${costs.basePrice.toLocaleString(locale, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>

              <div className="flex items-start justify-between py-4 border-b border-gray-300 dark:border-white/10">
                <div className="flex items-start gap-3">
                  <Ship className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-gray-900 dark:text-white">
                      {t("calculator.breakdown.rows.shipping.title")}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      {t("calculator.breakdown.rows.shipping.subtitle")}
                    </div>
                  </div>
                </div>
                <div className="text-gray-900 dark:text-white">
                  ${costs.shippingCost.toLocaleString(locale, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>

              <div className="flex items-start justify-between py-4 border-b border-gray-300 dark:border-white/10">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-gray-900 dark:text-white">
                      {t("calculator.breakdown.rows.customs.title")}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      {t("calculator.breakdown.rows.customs.subtitle")}
                    </div>
                  </div>
                </div>
                <div className="text-gray-900 dark:text-white">
                  ${costs.customsDuty.toLocaleString(locale, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>

              <div className="flex items-start justify-between py-4 border-b border-gray-300 dark:border-white/10">
                <div className="flex items-start gap-3">
                  <Wrench className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-gray-900 dark:text-white">
                      {t("calculator.breakdown.rows.inspection.title")}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      {t("calculator.breakdown.rows.inspection.subtitle")}
                    </div>
                  </div>
                </div>
                <div className="text-gray-900 dark:text-white">
                  ${costs.inspectionFees.toLocaleString(locale, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>

              <div className="flex items-start justify-between py-4 border-b border-gray-300 dark:border-white/10">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-gray-900 dark:text-white">
                      {t("calculator.breakdown.rows.docs.title")}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      {t("calculator.breakdown.rows.docs.subtitle")}
                    </div>
                  </div>
                </div>
                <div className="text-gray-900 dark:text-white">
                  ${costs.documentationFees.toLocaleString(locale, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>

              <div className="flex items-start justify-between py-4 border-b border-gray-300 dark:border-white/10">
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-gray-900 dark:text-white">
                      {t("calculator.breakdown.rows.serviceFee.title")}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      {t("calculator.breakdown.rows.serviceFee.subtitle")}
                    </div>
                  </div>
                </div>
                <div className="text-gray-900 dark:text-white">
                  ${costs.serviceFee.toLocaleString(locale, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#429de6] to-[#3a8acc] rounded-xl p-6 mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-blue-100 mb-1">
                      {t("calculator.breakdown.rows.estimatedTotal")}
                    </div>
                    <div className="text-white text-3xl">
                      ${costs.totalCost.toLocaleString(locale, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 py-4 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all" type="button">
                {t("calculator.breakdown.rows.requestQuote")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
