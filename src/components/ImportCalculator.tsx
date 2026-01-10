"use client";

import Image from "next/image";
import { useState } from "react";

import { Info, MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { copart_logo, iaai_logo, manheim_logo } from "@/data/images";

interface ImportCalculatorProps {
  showNotice?: boolean;
}

export const ImportCalculator = ({ showNotice = true }: ImportCalculatorProps) => {
  const t = useTranslations();

  const [activeTab, setActiveTab] = useState<"iaai" | "copart" | "manheim" | "other">("iaai");
  const [importer, setImporter] = useState("legal");
  const [vehiclePrice, setVehiclePrice] = useState("");
  const [auctionFee, setAuctionFee] = useState("");
  const [auctionLocation, setAuctionLocation] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [engine, setEngine] = useState("");
  const [engineVolume, setEngineVolume] = useState("");
  const [insurance, setInsurance] = useState(false);
  const [highGroundClearance, setHighGroundClearance] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace("T", " ");
  };

  return (
    <div className="max-w-6xl mx-auto">
      {!showResults ? (
        <>
          <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-300 dark:border-white/10 overflow-hidden transition-colors duration-300">
            {/* Tabs */}
            <div className="flex border-b border-gray-300 dark:border-white/10 overflow-x-auto scrollbar-hide">
              <button
                type="button"
                onClick={() => setActiveTab("iaai")}
                className={`flex-1 min-w-[140px] py-6 px-4 sm:px-8 transition-colors bg-black whitespace-nowrap ${
                  activeTab === "iaai"
                    ? "border-b-2 border-[#429de6]"
                    : "opacity-60"
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  <Image
                    src={copart_logo}
                    alt="IAAI"
                    width={120}
                    height={40}
                    className="h-8 w-auto"
                  />
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("copart")}
                className={`flex-1 min-w-[140px] py-6 px-4 sm:px-8 transition-colors bg-black whitespace-nowrap ${
                  activeTab === "copart"
                    ? "border-b-2 border-[#429de6]"
                    : "opacity-60"
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  <Image
                    src={iaai_logo}
                    alt="Copart"
                    width={120}
                    height={40}
                    className="h-10 w-auto"
                  />
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("manheim")}
                className={`flex-1 min-w-[140px] py-6 px-4 sm:px-8 transition-colors bg-black whitespace-nowrap ${
                  activeTab === "manheim"
                    ? "border-b-2 border-[#429de6]"
                    : "opacity-60"
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  <Image
                    src={manheim_logo}
                    alt="Manheim"
                    width={120}
                    height={40}
                    className="h-8 w-auto"
                  />
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("other")}
                className={`flex-1 min-w-[140px] py-6 px-4 sm:px-8 transition-all duration-300 bg-black whitespace-nowrap ${
                  activeTab === "other"
                    ? "border-b-2 border-[#429de6]"
                    : "opacity-60 hover:opacity-80"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className={`text-base sm:text-lg font-semibold transition-colors duration-300 ${
                    activeTab === "other"
                      ? "text-white"
                      : "text-white/90"
                  }`}>
                    {t("calculator.form.other")}
                  </span>
                  <div className={`p-2 rounded-lg transition-all duration-300 ${
                    activeTab === "other" 
                      ? "bg-[#429de6]/20" 
                      : "bg-white/10"
                  }`}>
                    <MoreHorizontal className={`w-5 h-5 transition-colors duration-300 ${
                      activeTab === "other"
                        ? "text-[#429de6]"
                        : "text-white"
                    }`} />
                  </div>
                </div>
              </button>
            </div>

            {/* Form */}
            <div className="p-8">
          <form onSubmit={handleSubmit}>
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Importer */}
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-3">
                    {t("calculator.form.importer")} <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setImporter("legal")}
                      className={`py-3 px-4 rounded-lg border transition-all text-sm sm:text-base ${
                        importer === "legal"
                          ? "border-orange-500 bg-transparent text-gray-900 dark:text-white"
                          : "border-gray-300 dark:border-gray-700 bg-transparent text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600"
                      }`}
                    >
                      {t("calculator.form.legalPerson")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setImporter("individual")}
                      className={`py-3 px-4 rounded-lg border transition-all text-sm sm:text-base ${
                        importer === "individual"
                          ? "border-orange-500 bg-transparent text-gray-900 dark:text-white"
                          : "border-gray-300 dark:border-gray-700 bg-transparent text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600"
                      }`}
                    >
                      {t("calculator.form.individual")}
                    </button>
                  </div>
                </div>

                {/* Vehicle Price */}
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {t("calculator.form.vehiclePrice")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={vehiclePrice}
                    onChange={(e) => setVehiclePrice(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#429de6] focus:border-[#429de6] text-gray-900 dark:text-white placeholder:text-gray-400"
                  />
                </div>

                {/* Auction Fee */}
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {t("calculator.form.auctionFee")}
                  </label>
                  <input
                    type="number"
                    value={auctionFee}
                    onChange={(e) => setAuctionFee(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#429de6] focus:border-[#429de6] text-gray-900 dark:text-white placeholder:text-gray-400"
                  />
                </div>

                {/* Auction Location */}
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {t("calculator.form.auctionLocation")} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={auctionLocation}
                    onChange={(e) => setAuctionLocation(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#429de6] focus:border-[#429de6] text-gray-900 dark:text-white appearance-none bg-[length:12px] dark:bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2712%27%20height=%2712%27%20viewBox=%270%200%2012%2012%27%3E%3Cpath%20fill=%27%23ffffff%27%20d=%27M6%209L1%204h10z%27/%3E%3C/svg%3E')] bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2712%27%20height=%2712%27%20viewBox=%270%200%2012%2012%27%3E%3Cpath%20fill=%27%23000000%27%20d=%27M6%209L1%204h10z%27/%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center]"
                  >
                    <option value="">{t("calculator.form.selectLocation")}</option>
                    <option value="location1">{t("calculator.form.location1")}</option>
                    <option value="location2">{t("calculator.form.location2")}</option>
                  </select>
                </div>
              </div>

              {/* Vertical Separator */}
              <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800"></div>

              {/* Right Column */}
              <div className="space-y-6 lg:pl-8">
                {/* Date Selection: Day, Month, Year */}
                <div className="grid grid-cols-3 gap-4">
                  <select 
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="px-4 py-3 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white appearance-none bg-[length:12px] dark:bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2712%27%20height=%2712%27%20viewBox=%270%200%2012%2012%27%3E%3Cpath%20fill=%27%23ffffff%27%20d=%27M6%209L1%204h10z%27/%3E%3C/svg%3E')] bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2712%27%20height=%2712%27%20viewBox=%270%200%2012%2012%27%3E%3Cpath%20fill=%27%23000000%27%20d=%27M6%209L1%204h10z%27/%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center]"
                  >
                    <option value="">{t("calculator.form.day")}</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <select 
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="px-4 py-3 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white appearance-none bg-[length:12px] dark:bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2712%27%20height=%2712%27%20viewBox=%270%200%2012%2012%27%3E%3Cpath%20fill=%27%23ffffff%27%20d=%27M6%209L1%204h10z%27/%3E%3C/svg%3E')] bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2712%27%20height=%2712%27%20viewBox=%270%200%2012%2012%27%3E%3Cpath%20fill=%27%23000000%27%20d=%27M6%209L1%204h10z%27/%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center]"
                  >
                    <option value="">{t("calculator.form.month")}</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select 
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="px-4 py-3 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white appearance-none bg-[length:12px] dark:bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2712%27%20height=%2712%27%20viewBox=%270%200%2012%2012%27%3E%3Cpath%20fill=%27%23ffffff%27%20d=%27M6%209L1%204h10z%27/%3E%3C/svg%3E')] bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2712%27%20height=%2712%27%20viewBox=%270%200%2012%2012%27%3E%3Cpath%20fill=%27%23000000%27%20d=%27M6%209L1%204h10z%27/%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center]"
                  >
                    <option value="">{t("calculator.form.year")}</option>
                    {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {t("calculator.form.vehicleType")} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#429de6] focus:border-[#429de6] text-gray-900 dark:text-white appearance-none bg-[length:12px] dark:bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2712%27%20height=%2712%27%20viewBox=%270%200%2012%2012%27%3E%3Cpath%20fill=%27%23ffffff%27%20d=%27M6%209L1%204h10z%27/%3E%3C/svg%3E')] bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2712%27%20height=%2712%27%20viewBox=%270%200%2012%2012%27%3E%3Cpath%20fill=%27%23000000%27%20d=%27M6%209L1%204h10z%27/%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center]"
                  >
                    <option value="">{t("calculator.form.selectType")}</option>
                    <option value="passenger">{t("calculator.form.passengerCar")}</option>
                    <option value="sedan">{t("calculator.form.sedan")}</option>
                    <option value="suv">{t("calculator.form.suv")}</option>
                    <option value="sports">{t("calculator.form.sports")}</option>
                  </select>
                </div>

                {/* Engine and Engine Volume Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Engine */}
                  <div>
                    <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">
                      {t("calculator.form.engine")} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={engine}
                      onChange={(e) => setEngine(e.target.value)}
                      className="w-full px-4 py-3 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#429de6] focus:border-[#429de6] text-gray-900 dark:text-white appearance-none bg-[length:12px] dark:bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2712%27%20height=%2712%27%20viewBox=%270%200%2012%2012%27%3E%3Cpath%20fill=%27%23ffffff%27%20d=%27M6%209L1%204h10z%27/%3E%3C/svg%3E')] bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2712%27%20height=%2712%27%20viewBox=%270%200%2012%2012%27%3E%3Cpath%20fill=%27%23000000%27%20d=%27M6%209L1%204h10z%27/%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center] text-sm sm:text-base"
                    >
                      <option value="">{t("calculator.form.selectEngine")}</option>
                      <option value="gasoline">{t("calculator.form.gasoline")}</option>
                      <option value="diesel">{t("calculator.form.diesel")}</option>
                      <option value="electric">{t("calculator.form.electric")}</option>
                      <option value="hybrid">{t("calculator.form.hybrid")}</option>
                    </select>
                  </div>

                  {/* Engine Volume */}
                  <div>
                    <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">
                      {t("calculator.form.engineVolume")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={engineVolume}
                      onChange={(e) => setEngineVolume(e.target.value)}
                      className="w-full px-4 py-3 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#429de6] focus:border-[#429de6] text-gray-900 dark:text-white placeholder:text-gray-400 text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3 pt-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={insurance}
                      onChange={(e) => setInsurance(e.target.checked)}
                      className="w-4 h-4 bg-transparent border-gray-300 dark:border-gray-700 text-[#429de6] rounded focus:ring-[#429de6]"
                    />
                    <span className="text-gray-600 dark:text-gray-400">{t("calculator.form.insurance")}</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={highGroundClearance}
                      onChange={(e) => setHighGroundClearance(e.target.checked)}
                      className="w-4 h-4 bg-transparent border-gray-300 dark:border-gray-700 text-[#429de6] rounded focus:ring-[#429de6]"
                    />
                    <span className="text-gray-600 dark:text-gray-400">{t("calculator.form.highGroundClearance")}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <div className="mt-8 flex justify-center">
              <button
                type="submit"
                className="px-8 py-3 bg-[#429de6] text-white rounded-lg hover:bg-[#3a8acc] transition-all hover:shadow-lg hover:shadow-blue-500/20 flex items-center gap-2"
              >
                {t("calculator.form.calculateCost")}
                <span>›</span>
              </button>
            </div>
          </form>
            </div>
          </div>

          {showNotice && (
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
          )}
        </>
      ) : (
        /* Results Section */
        <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black rounded-2xl border border-gray-300 dark:border-gray-800 overflow-hidden shadow-xl">
          {/* Exchange Rates */}
          <div className="bg-gray-100 dark:bg-black/40 border-b border-gray-300 dark:border-gray-800 py-8 px-6">
            <div className="flex justify-center items-center gap-6 md:gap-12 flex-wrap">
              <div className="text-center">
                <div className="text-gray-600 dark:text-white/70 text-xs md:text-sm mb-1.5">1 USD</div>
                <div className="text-orange-600 dark:text-orange-500 font-bold text-lg md:text-xl">381.36 AMD</div>
              </div>
              <div className="text-orange-600/50 dark:text-orange-500/50 text-2xl">/</div>
              <div className="text-center">
                <div className="text-gray-600 dark:text-white/70 text-xs md:text-sm mb-1.5">1 EUR</div>
                <div className="text-orange-600 dark:text-orange-500 font-bold text-lg md:text-xl">449.01 AMD</div>
              </div>
              <div className="text-orange-600/50 dark:text-orange-500/50 text-2xl">/</div>
              <div className="text-center">
                <div className="text-gray-600 dark:text-white/70 text-xs md:text-sm mb-1.5">EUR/USD</div>
                <div className="text-orange-600 dark:text-orange-500 font-bold text-lg md:text-xl">1.1774</div>
              </div>
            </div>
          </div>

          {/* Calculation Summary */}
          <div className="bg-gradient-to-r from-orange-100 to-transparent dark:from-orange-500/10 dark:to-transparent border-b border-gray-300 dark:border-gray-800 py-6 px-6">
            <div className="text-center max-w-4xl mx-auto">
              <p className="text-orange-600 dark:text-orange-400 text-sm md:text-base mb-2">
                <span className="font-bold">{importer === "legal" ? "Legal person (ACP)" : "Individual (SCDR)"}</span> 
                <span className="text-gray-400 dark:text-white/50 mx-2">/</span>
                <span className="font-semibold">{vehicleType || "Passenger Car"}</span>
              </p>
              <p className="text-gray-700 dark:text-white/80 text-xs md:text-sm leading-relaxed">
                <span className="text-orange-600 dark:text-orange-400 font-semibold">{getCurrentDateTime()}</span> 
                <span className="text-gray-400 dark:text-white/50 mx-2">/</span>
                <span className="font-semibold text-orange-600 dark:text-orange-400">{activeTab.toUpperCase()}</span>
                <span className="text-gray-400 dark:text-white/50 mx-2">/</span>
                Auction location: <span className="text-gray-900 dark:text-white font-medium">{auctionLocation || ""}</span>
                <span className="text-gray-400 dark:text-white/50 mx-2">/</span>
                Choose year: <span className="text-orange-600 dark:text-orange-400 font-semibold">{year || new Date().getFullYear()}/{month || "--"}/{day || "--"}</span>
                <span className="text-gray-400 dark:text-white/50 mx-2">/</span>
                Engine: <span className="text-orange-600 dark:text-orange-400 font-semibold">{engine || "Gasoline"}</span>
                <span className="text-gray-400 dark:text-white/50 mx-2">/</span>
                Engine volume: <span className="text-orange-600 dark:text-orange-400 font-semibold">{engineVolume || "1"}</span>
              </p>
            </div>
          </div>

          {/* Cost Breakdown Table */}
          <div className="p-6">
            <div className="border border-gray-300 dark:border-gray-800 rounded-xl overflow-hidden shadow-lg">
              <table className="w-full">
                <tbody className="divide-y divide-gray-300 dark:divide-gray-800">
                  <tr className="bg-gradient-to-r from-gray-100 to-white dark:from-gray-900 dark:to-gray-900/50 hover:from-gray-200 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-900/60 transition-colors">
                    <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">Vehicle price</td>
                    <td className="px-6 py-4 text-center text-gray-400 dark:text-gray-600 text-lg">/</td>
                    <td className="px-6 py-4 text-right text-gray-900 dark:text-white font-bold text-lg">${vehiclePrice || "1"}</td>
                  </tr>
                  <tr className="bg-gradient-to-r from-white to-gray-50 dark:from-black dark:to-gray-900/30 hover:from-gray-100 hover:to-white dark:hover:from-gray-900 dark:hover:to-gray-900/40 transition-colors">
                    <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">Customs duty</td>
                    <td className="px-6 py-4 text-center text-gray-400 dark:text-gray-600 text-lg">/</td>
                    <td className="px-6 py-4 text-right text-orange-600 font-semibold">$partner</td>
                  </tr>
                  <tr className="bg-gradient-to-r from-gray-100 to-white dark:from-gray-900 dark:to-gray-900/50 hover:from-gray-200 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-900/60 transition-colors">
                    <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">Auction fee</td>
                    <td className="px-6 py-4 text-center text-gray-400 dark:text-gray-600 text-lg">/</td>
                    <td className="px-6 py-4 text-right text-gray-900 dark:text-white font-bold text-lg">${auctionFee || "146"}</td>
                  </tr>
                  <tr className="bg-gradient-to-r from-white to-gray-50 dark:from-black dark:to-gray-900/30 hover:from-gray-100 hover:to-white dark:hover:from-gray-900 dark:hover:to-gray-900/40 transition-colors">
                    <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">VAT</td>
                    <td className="px-6 py-4 text-center text-gray-400 dark:text-gray-600 text-lg">/</td>
                    <td className="px-6 py-4 text-right text-orange-600 font-semibold">$partner</td>
                  </tr>
                  <tr className="bg-gradient-to-r from-gray-100 to-white dark:from-gray-900 dark:to-gray-900/50 hover:from-gray-200 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-900/60 transition-colors">
                    <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">Transportation Fee</td>
                    <td className="px-6 py-4 text-center text-gray-400 dark:text-gray-600 text-lg">/</td>
                    <td className="px-6 py-4 text-right text-orange-600 font-semibold">$partner</td>
                  </tr>
                  <tr className="bg-gradient-to-r from-white to-gray-50 dark:from-black dark:to-gray-900/30 hover:from-gray-100 hover:to-white dark:hover:from-gray-900 dark:hover:to-gray-900/40 transition-colors">
                    <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">Environmental tax</td>
                    <td className="px-6 py-4 text-center text-gray-400 dark:text-gray-600 text-lg">/</td>
                    <td className="px-6 py-4 text-right text-orange-600 font-semibold">$partner</td>
                  </tr>
                  <tr className="bg-gradient-to-r from-gray-100 to-white dark:from-gray-900 dark:to-gray-900/50 hover:from-gray-200 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-900/60 transition-colors">
                    <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">Insurance</td>
                    <td className="px-6 py-4 text-center text-gray-400 dark:text-gray-600 text-lg">/</td>
                    <td className="px-6 py-4 text-right text-orange-600 font-semibold">$partner</td>
                  </tr>
                  <tr className="bg-gradient-to-r from-white to-gray-50 dark:from-black dark:to-gray-900/30 hover:from-gray-100 hover:to-white dark:hover:from-gray-900 dark:hover:to-gray-900/40 transition-colors">
                    <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">Taxes</td>
                    <td className="px-6 py-4 text-center text-gray-400 dark:text-gray-600 text-lg">/</td>
                    <td className="px-6 py-4 text-right text-orange-600 font-semibold">$partner</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Partner Message */}
            <div className="mt-8 text-center py-6 bg-gradient-to-r from-orange-100 via-orange-50 to-orange-100 dark:from-orange-500/5 dark:via-orange-500/10 dark:to-orange-500/5 rounded-xl border border-orange-300 dark:border-orange-500/20 shadow-sm">
              <p className="text-orange-600 dark:text-orange-400 text-lg md:text-xl font-bold">
                <span className="underline decoration-orange-500/50 hover:decoration-orange-600 dark:hover:decoration-orange-500 transition-all cursor-pointer">
                  To use calculator become a partner.
                </span>
              </p>
            </div>

            {/* Important Notice */}
            <div className="mt-6 bg-gradient-to-br from-red-50 via-red-100/50 to-white dark:from-red-900/20 dark:via-red-800/10 dark:to-transparent border border-red-300 dark:border-red-800/50 rounded-xl p-6 shadow-md">
              <h3 className="text-red-600 dark:text-red-400 font-bold mb-3 text-center text-lg md:text-xl flex items-center justify-center gap-2">
                <span className="text-2xl">⚠</span>
                Important
              </h3>
              <p className="text-gray-800 dark:text-white/90 text-sm md:text-base leading-relaxed text-center">
                All Transactions with companies and citizens of the Republic of Armenia are made exclusively in Armenian currency (Dram / AMD). Note: customs fees are calculated at the exchange rate set by the Central Bank of Armenia as of the given day.
              </p>
            </div>

            {/* Back to Calculator Button */}
            <div className="flex justify-center mt-8 mb-2">
              <button
                onClick={() => setShowResults(false)}
                className="px-8 py-4 bg-gradient-to-r from-[#429de6] to-[#3a8acc] text-white font-semibold rounded-xl hover:from-[#3a8acc] hover:to-[#2d7ab8] transition-all shadow-lg hover:shadow-2xl hover:shadow-blue-500/30 flex items-center gap-3 text-lg transform hover:scale-105 active:scale-95"
                type="button"
              >
                <span className="text-2xl">←</span>
                Back to Calculator
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
