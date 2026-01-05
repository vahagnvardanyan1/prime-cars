"use client";

import { useState } from "react";

import { DollarSign, Info } from "lucide-react";
import { useTranslations } from "next-intl";

export const ImportCalculator = () => {
  const t = useTranslations();

  const [vehiclePrice, setVehiclePrice] = useState("");
  const [country, setCountry] = useState("japan");
  const [vehicleType, setVehicleType] = useState("sedan");

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-300 dark:border-white/10 p-8 transition-colors duration-300">
          <h2 className="text-gray-900 dark:text-white mb-6">
            {t("calculator.form.vehicleInfo")}
          </h2>

          <form className="space-y-6">
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
  );
};
