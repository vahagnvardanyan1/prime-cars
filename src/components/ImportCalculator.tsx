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
import { calculateAuctionFees, calculateServiceFee } from "@/lib/import-calculator/auctionFees";
import { useUser } from "@/contexts/UserContext";
import { CalculatorResults } from "@/components/calculator/CalculatorResults";

interface ImportCalculatorProps {
  showNotice?: boolean;
  showPartnerMessage?: boolean;
  disablePartnerRestrictions?: boolean;
}

export const ImportCalculator = ({ 
  showNotice = true, 
  showPartnerMessage = false,
  disablePartnerRestrictions = false 
}: ImportCalculatorProps) => {
  const t = useTranslations();
  const { user } = useUser();
  const isLoggedIn = !!user;

  const [activeTab, setActiveTab] = useState<"iaai" | "copart" | "manheim" | "other">("copart");
  const [importer, setImporter] = useState("legal");
  const [vehiclePrice, setVehiclePrice] = useState("");
  const [auctionFee, setAuctionFee] = useState("");
  const [serviceFee, setServiceFee] = useState("");
  const [insuranceFee, setInsuranceFee] = useState("");
  const [shippingPrice, setShippingPrice] = useState(0);
  const [manualShippingPrice, setManualShippingPrice] = useState("");
  const [auctionLocation, setAuctionLocation] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [engine, setEngine] = useState("");
  const [engineVolume, setEngineVolume] = useState("");
  const [insurance, setInsurance] = useState(false);
  const [highGroundClearance, setHighGroundClearance] = useState(false);
  const [hasReverse, setHasReverse] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [calculationResults, setCalculationResults] = useState<CalculatorResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [cityPriceMap, setCityPriceMap] = useState<Record<string, number>>({});
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // Fetch cities and prices when activeTab changes
  useEffect(() => {
    const loadCities = async () => {
      setIsLoadingLocations(true);
      setAuctionLocation(""); // Reset selection when tab changes
      setManualShippingPrice(""); // Reset manual price when tab changes
      
      try {
        // For "Other", fetch Copart cities
        const categoryToFetch = activeTab === "other" ? "copart" : activeTab;
        const result = await fetchShippingCities({ category: categoryToFetch });
        
        if (result.success) {
          const sortedCities = getUniqueCities(result.cities);
          setAvailableCities(sortedCities);
          // For "Other", don't set priceMap since user will enter manually
          setCityPriceMap(activeTab === "other" ? {} : result.priceMap);
        } else {
          setAvailableCities([]);
          setCityPriceMap({});
        }
      } catch  {
        setAvailableCities([]);
        setCityPriceMap({});
      } finally {
        setIsLoadingLocations(false);
      }
    };

    loadCities();
  }, [activeTab]);

  // Auto-set engine to gasoline for quadricycle
  useEffect(() => {
    if (vehicleType === "quadricycle") {
      setEngine("gasoline");
    }
  }, [vehicleType]);

  // Helper function to get error styling
  const getErrorClass = (value: string | boolean, isRequired: boolean = true) => {
    if (!showValidation || !isRequired) return "";
    return !value ? "border-red-500 dark:border-red-500" : "";
  };

  useEffect(() => {
    // Calculate service fee for all auction types
    if (vehiclePrice && !isNaN(parseFloat(vehiclePrice))) {
      const price = parseFloat(vehiclePrice);
      const calculatedServiceFee = calculateServiceFee(price);
      setServiceFee(Math.round(calculatedServiceFee).toString());
    } else {
      setServiceFee("");
    }

    // Calculate auction-specific fees
    if (activeTab === "copart") {
      if (vehiclePrice && !isNaN(parseFloat(vehiclePrice))) {
        const price = parseFloat(vehiclePrice);
        
        const fees = calculateAuctionFees({
          auction: "copart",
          vehiclePrice: price,
        });
        
        const auctionFeeTotal = 
          fees.virtualBidFee +  
          fees.liveBidFee +     
          fees.gateFee +        
          fees.titleShippingFee + 
          fees.environmentalFee;  
        
        setAuctionFee(Math.round(auctionFeeTotal).toString());
      } else {
        setAuctionFee("");
      }
      } else if (activeTab === "iaai") {
        if (vehiclePrice && !isNaN(parseFloat(vehiclePrice))) {
        const price = parseFloat(vehiclePrice);
        
        const fees = calculateAuctionFees({
          auction: "iaai",
          vehiclePrice: price,
        });
        
        // IAAI Auction Fee = Standard Volume Fee + Live Bid + Service + Environmental + Title-Handling
        const auctionFeeTotal = 
          fees.virtualBidFee +  // Standard Volume Fee (table 1)
          fees.liveBidFee +     // Live Online Bid Fee (table 3)
          fees.gateFee +        // Service Fee: $95
          fees.environmentalFee + // Environmental Fee: $15
          fees.titleShippingFee;  // Title-Handling Fee: $20
        
        setAuctionFee(Math.round(auctionFeeTotal).toString());
      } else {
        setAuctionFee("");
      }
    }
  }, [vehiclePrice, activeTab]);

  // Get shipping price from priceMap when location changes and apply vehicle type adjustments
  useEffect(() => {
    // For "Other" auction, use manual price if entered
    if (activeTab === "other") {
      const manualPrice = parseFloat(manualShippingPrice) || 0;
      let price = manualPrice;
      
      // Apply vehicle type adjustments
      if (vehicleType === "quadricycle" || vehicleType === "motorcycle") {
        price = Math.max(0, price - 500);
      } else if (vehicleType === "truck") {
        price = price + 500;
      }
      
      setShippingPrice(price);
    } else if (auctionLocation && cityPriceMap[auctionLocation]) {
      let price = cityPriceMap[auctionLocation];
      
      // Apply vehicle type adjustments
      if (vehicleType === "quadricycle" || vehicleType === "motorcycle") {
        price = Math.max(0, price - 500); // Subtract $500, but not below 0
      } else if (vehicleType === "truck") {
        price = price + 500; // Add $500
      }
      
      setShippingPrice(price);
    } else {
      setShippingPrice(0);
    }
  }, [auctionLocation, cityPriceMap, vehicleType, activeTab, manualShippingPrice]);

  // Calculate insurance: (Shipping Price + Auction Fee) * 1%
  useEffect(() => {
    if (auctionFee && shippingPrice > 0) {
      const auction = parseFloat(auctionFee) || 0;
      const shipping = shippingPrice || 0;
      const insurance = (shipping + auction) * 0.01;
      setInsuranceFee(Math.round(insurance).toString());
    } else {
      setInsuranceFee("");
    }
  }, [auctionFee, shippingPrice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show validation errors
    setShowValidation(true);
    
    // Validation - engine volume not required for electric vehicles
    const isEngineVolumeRequired = engine !== "electric";
    if (!vehiclePrice || !engine || !day || !month || !year || !auctionLocation || !vehicleType) {
      toast.error(t("calculator.form.validationError") || "Please fill in all required fields");
      return;
    }
    
    if (isEngineVolumeRequired && !engineVolume) {
      toast.error(t("calculator.form.validationError") || "Please fill in all required fields");
      return;
    }
    
    // Validation for manual shipping price when "Other" is selected
    if (activeTab === "other" && !manualShippingPrice) {
      toast.error(t("calculator.form.validationError") || "Please fill in all required fields");
      return;
    }

    setIsCalculating(true);
    
    
    try {
      const result = await calculateVehicleTaxes({
        price: parseFloat(vehiclePrice),
        volume: engine === "electric" ? 0 : parseFloat(engineVolume), // Use 0 for electric
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

  return (
    <div className="max-w-6xl mx-auto">
      {!showResults ? (
        <>
          <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-300 dark:border-white/10 overflow-hidden transition-colors duration-300">
            {/* Tabs */}
            <div className="flex border-b border-gray-300 dark:border-white/10 overflow-x-auto scrollbar-hide">
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
                    src={copart_logo}
                    alt="Copart"
                    width={120}
                    height={40}
                    className="h-8 w-auto"
                  />
                </div>
              </button>
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
                    src={iaai_logo}
                    alt="IAAI"
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
                    className={`w-full px-4 py-3 bg-transparent border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#429de6] text-gray-900 dark:text-white placeholder:text-gray-400 ${
                      getErrorClass(vehiclePrice) || "border-gray-300 dark:border-gray-700 focus:border-[#429de6]"
                    }`}
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
                    readOnly={activeTab === "copart" || activeTab === "iaai"}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none text-gray-900 dark:text-white placeholder:text-gray-400 ${
                      activeTab === "copart" || activeTab === "iaai"
                        ? "bg-gray-50 dark:bg-gray-900/50 border-gray-300 dark:border-gray-700 cursor-not-allowed"
                        : "bg-transparent border-gray-300 dark:border-gray-700 focus:ring-1 focus:ring-[#429de6] focus:border-[#429de6]"
                    }`}
                  />
                </div>

                {/* Auction Location */}
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {t("calculator.form.auctionLocation")} <span className="text-red-500">*</span>
                  </label>
                  <Select value={auctionLocation} onValueChange={setAuctionLocation} disabled={isLoadingLocations}>
                    <SelectTrigger className={`w-full h-12 bg-transparent text-gray-900 dark:text-white ${
                      getErrorClass(auctionLocation) || "border-gray-300 dark:border-gray-700"
                    }`}>
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

                {/* Manual Shipping Price (Only for "Other" auction) */}
                {activeTab === "other" && (
                  <div>
                    <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">
                      {t("calculator.form.shippingPrice")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={manualShippingPrice}
                      onChange={(e) => setManualShippingPrice(e.target.value)}
                      placeholder={t("calculator.form.enterShippingPrice") || "Enter shipping price"}
                      className={`w-full h-12 px-4 rounded-lg bg-transparent border ${
                        getErrorClass(manualShippingPrice) || "border-gray-300 dark:border-gray-700"
                      } text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#429de6] focus:border-transparent transition-all`}
                    />
                  </div>
                )}
              </div>

              {/* Vertical Separator */}
              <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800"></div>

              {/* Right Column */}
              <div className="space-y-6 lg:pl-8">
                {/* Date Selection: Day, Month, Year */}
                <div className="grid grid-cols-3 gap-4">
                  <Select value={day} onValueChange={setDay}>
                    <SelectTrigger className={`h-12 bg-transparent text-gray-900 dark:text-white ${
                      getErrorClass(day) || "border-gray-300 dark:border-gray-700"
                    }`}>
                      <SelectValue placeholder={t("calculator.form.day")} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#111111] border-gray-300 dark:border-gray-700 max-h-[300px]">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <SelectItem key={d} value={String(d)}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger className={`h-12 bg-transparent text-gray-900 dark:text-white ${
                      getErrorClass(month) || "border-gray-300 dark:border-gray-700"
                    }`}>
                      <SelectValue placeholder={t("calculator.form.month")} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#111111] border-gray-300 dark:border-gray-700 max-h-[300px]">
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <SelectItem key={m} value={String(m)}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger className={`h-12 bg-transparent text-gray-900 dark:text-white ${
                      getErrorClass(year) || "border-gray-300 dark:border-gray-700"
                    }`}>
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
                    <SelectTrigger className={`w-full h-12 bg-transparent text-gray-900 dark:text-white ${
                      getErrorClass(vehicleType) || "border-gray-300 dark:border-gray-700"
                    }`}>
                      <SelectValue placeholder={t("calculator.form.selectType")} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#111111] border-gray-300 dark:border-gray-700">
                      <SelectItem value="passenger">{t("calculator.form.passenger")}</SelectItem>
                      <SelectItem value="truck">{t("calculator.form.truck")}</SelectItem>
                      <SelectItem value="quadricycle">{t("calculator.form.quadricycle")}</SelectItem>
                      <SelectItem value="motorcycle">{t("calculator.form.motorcycle")}</SelectItem>
                      <SelectItem value="snowmobile">{t("calculator.form.snowmobile")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Engine and Engine Volume Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Engine */}
                  <div className={engine === "electric" ? "sm:col-span-2" : ""}>
                    <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">
                      {t("calculator.form.engine")} <span className="text-red-500">*</span>
                    </label>
                    <Select 
                      value={engine} 
                      onValueChange={setEngine}
                      disabled={vehicleType === "quadricycle"}
                    >
                      <SelectTrigger className={`w-full h-12 bg-transparent text-gray-900 dark:text-white ${
                        vehicleType === "quadricycle" 
                          ? "cursor-not-allowed opacity-60 border-gray-300 dark:border-gray-700" 
                          : getErrorClass(engine) || "border-gray-300 dark:border-gray-700"
                      }`}>
                        <SelectValue placeholder={t("calculator.form.selectEngine")} />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#111111] border-gray-300 dark:border-gray-700">
                        <SelectItem value="gasoline">{t("calculator.form.gasoline")}</SelectItem>
                        <SelectItem value="diesel">{t("calculator.form.diesel")}</SelectItem>
                        <SelectItem value="electric">{t("calculator.form.electric")}</SelectItem>
                        <SelectItem value="hybrid">{t("calculator.form.hybrid")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Engine Volume - Hidden for electric */}
                  {engine !== "electric" && (
                    <div>
                      <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">
                        {t("calculator.form.engineVolume")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={engineVolume}
                        onChange={(e) => setEngineVolume(e.target.value)}
                        className={`w-full px-4 py-3 bg-transparent border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#429de6] text-gray-900 dark:text-white placeholder:text-gray-400 text-sm sm:text-base ${
                          getErrorClass(engineVolume) || "border-gray-300 dark:border-gray-700 focus:border-[#429de6]"
                        }`}
                      />
                    </div>
                  )}
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

                  {/* High ground clearance - Only show for Passenger vehicles */}
                  {vehicleType === "passenger" && (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={highGroundClearance}
                        onChange={(e) => setHighGroundClearance(e.target.checked)}
                        className="w-4 h-4 bg-transparent border-gray-300 dark:border-gray-700 text-[#429de6] rounded focus:ring-[#429de6]"
                      />
                      <span className="text-gray-600 dark:text-gray-400">{t("calculator.form.highGroundClearance")}</span>
                    </label>
                  )}

                  {/* Has Reverse - Only show for Quadricycle */}
                  {vehicleType === "quadricycle" && (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasReverse}
                        onChange={(e) => setHasReverse(e.target.checked)}
                        className="w-4 h-4 bg-transparent border-gray-300 dark:border-gray-700 text-[#429de6] rounded focus:ring-[#429de6]"
                      />
                      <span className="text-gray-600 dark:text-gray-400">{t("calculator.form.hasReverse")}</span>
                    </label>
                  )}
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
          serviceFee={serviceFee}
          insuranceFee={insuranceFee}
          shippingPrice={shippingPrice}
          auctionLocation={auctionLocation}
          activeTab={activeTab}
          day={day}
          month={month}
          year={year}
          engine={engine}
          engineVolume={engineVolume}
          calculationResults={calculationResults}
          isLoggedIn={isLoggedIn}
          showPartnerMessage={showPartnerMessage}
          disablePartnerRestrictions={disablePartnerRestrictions}
          onBack={() => setShowResults(false)}
        />
      )}
    </div>
  );
};
