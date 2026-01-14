"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { Info, MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { copart_logo, iaai_logo, manheim_logo } from "@/data/images";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculateVehicleTaxes,
  formatDate,
  mapEngineType,
  type CalculatorResponse,
} from "@/lib/import-calculator/calculateVehicleTaxes";
import {
  fetchShippingCities,
  getUniqueCities,
} from "@/lib/import-calculator/fetchShippingPrices";
import { useUser } from "@/contexts/UserContext";
import { CalculatorResults } from "@/components/calculator/CalculatorResults";

interface ImportCalculatorProps {
  showNotice?: boolean;
}

export const ImportCalculator = ({ showNotice = true }: ImportCalculatorProps) => {
  const t = useTranslations();
  const { user } = useUser();
  const isLoggedIn = !!user;

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
  const [calculationResults, setCalculationResults] = useState<CalculatorResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  // Fetch cities when activeTab changes (public endpoint, no auth required)
  useEffect(() => {
    const loadCities = async () => {
      setIsLoadingLocations(true);
      setAuctionLocation(""); // Reset selection when tab changes
      
      try {
        const result = await fetchShippingCities({ category: activeTab });
        
        if (result.success) {
          const sortedCities = getUniqueCities(result.data);
          setAvailableCities(sortedCities);
        } else {
          setAvailableCities([]);
        }
      } catch (error) {
        setAvailableCities([]);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    loadCities();
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!vehiclePrice || !engineVolume || !engine || !day || !month || !year || !auctionLocation) {
      toast.error(t("calculator.form.validationError") || "Please fill in all required fields");
      return;
    }

    setIsCalculating(true);
    
    try {
      const result = await calculateVehicleTaxes({
        price: parseFloat(vehiclePrice),
        volume: parseFloat(engineVolume),
        engineType: mapEngineType(engine),
        date: formatDate({ day, month, year }),
        isLegal: importer === "legal" ? 1 : 0,
        offRoad: highGroundClearance ? 1 : 0,
        ICEpower: 0, // Default to 0 as per API spec
      });

      if (result.success) {
        setCalculationResults(result.data);
        setShowResults(true);
      } else {
        toast.error(t("calculator.form.calculationError") || "Calculation failed", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error(t("calculator.form.calculationError") || "Calculation failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsCalculating(false);
    }
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
            <div className="p-4 sm:p-6 md:p-8">
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
                  <Select value={auctionLocation} onValueChange={setAuctionLocation} disabled={isLoadingLocations}>
                    <SelectTrigger className="w-full h-12 bg-transparent border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                      <SelectValue placeholder={isLoadingLocations ? t("calculator.form.loadingLocations") || "Loading..." : t("calculator.form.selectLocation")} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#111111] border-gray-300 dark:border-gray-700 max-h-[300px] overflow-y-auto">
                      {availableCities.length > 0 ? (
                        availableCities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-locations" disabled>
                          {t("calculator.form.noLocationsAvailable") || "No locations available"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Vertical Separator */}
              <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800"></div>

              {/* Right Column */}
              <div className="space-y-6 lg:pl-8">
                {/* Date Selection: Day, Month, Year */}
                <div className="grid grid-cols-3 gap-4">
                  <Select value={day} onValueChange={setDay}>
                    <SelectTrigger className="h-12 bg-transparent border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                      <SelectValue placeholder={t("calculator.form.day")} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#111111] border-gray-300 dark:border-gray-700 max-h-[300px]">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <SelectItem key={d} value={String(d)}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger className="h-12 bg-transparent border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                      <SelectValue placeholder={t("calculator.form.month")} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#111111] border-gray-300 dark:border-gray-700 max-h-[300px]">
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <SelectItem key={m} value={String(m)}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger className="h-12 bg-transparent border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                      <SelectValue placeholder={t("calculator.form.year")} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#111111] border-gray-300 dark:border-gray-700 max-h-[300px]">
                      {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {t("calculator.form.vehicleType")} <span className="text-red-500">*</span>
                  </label>
                  <Select value={vehicleType} onValueChange={setVehicleType}>
                    <SelectTrigger className="w-full h-12 bg-transparent border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                      <SelectValue placeholder={t("calculator.form.selectType")} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#111111] border-gray-300 dark:border-gray-700">
                      <SelectItem value="passenger">{t("calculator.form.passengerCar")}</SelectItem>
                      <SelectItem value="sedan">{t("calculator.form.sedan")}</SelectItem>
                      <SelectItem value="suv">{t("calculator.form.suv")}</SelectItem>
                      <SelectItem value="sports">{t("calculator.form.sports")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Engine and Engine Volume Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Engine */}
                  <div>
                    <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">
                      {t("calculator.form.engine")} <span className="text-red-500">*</span>
                    </label>
                    <Select value={engine} onValueChange={setEngine}>
                      <SelectTrigger className="w-full h-12 bg-transparent border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                        <SelectValue placeholder={t("calculator.form.selectEngine")} />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#111111] border-gray-300 dark:border-gray-700">
                        <SelectItem value="gasoline">{t("calculator.form.gasoline")}</SelectItem>
                        <SelectItem value="diesel">{t("calculator.form.diesel")}</SelectItem>
                        <SelectItem value="hybridPetrol">{t("calculator.form.hybridPetrol")}</SelectItem>
                        <SelectItem value="hybridDiesel">{t("calculator.form.hybridDiesel")}</SelectItem>
                        <SelectItem value="electric">{t("calculator.form.electric")}</SelectItem>
                      </SelectContent>
                    </Select>
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
                disabled={isCalculating}
                className="px-8 py-3 bg-[#429de6] text-white rounded-lg hover:bg-[#3a8acc] transition-all hover:shadow-lg hover:shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCalculating ? t("calculator.form.calculating") || "Calculating..." : t("calculator.form.calculateCost")}
                <span>›</span>
              </button>
            </div>
          </form>
            </div>
          </div>

          {showNotice && (
            <div className="mt-4 sm:mt-6 bg-[#429de6]/10 border border-[#429de6]/20 rounded-2xl p-4 sm:p-6">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-[#429de6] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                    {t("calculator.form.noticeTitle")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {t("calculator.form.noticeBody")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <CalculatorResults
          importer={importer}
          vehicleType={vehicleType}
          vehiclePrice={vehiclePrice}
          auctionFee={auctionFee}
          auctionLocation={auctionLocation}
          activeTab={activeTab}
          day={day}
          month={month}
          year={year}
          engine={engine}
          engineVolume={engineVolume}
          calculationResults={calculationResults}
          isLoggedIn={isLoggedIn}
          onBack={() => setShowResults(false)}
        />
      )}
    </div>
  );
};
