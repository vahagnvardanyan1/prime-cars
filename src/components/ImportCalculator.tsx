"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

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

import { calculateAuctionFees } from "@/lib/import-calculator/auctionFees";
import { calculateTruckTaxes, type TruckWeightClass } from "@/lib/import-calculator/calculateTruckTaxes";
import { calculateQuadricycleTaxes } from "@/lib/import-calculator/calculateQuadricycleTaxes";
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

  const [activeTab, setActiveTab] = useState<"iaai" | "copart" | "manheim" | "other">("copart");
  const [importer, setImporter] = useState("legal");
  const [vehiclePrice, setVehiclePrice] = useState("");
  const [auctionFee, setAuctionFee] = useState("");
  const [insuranceFee, setInsuranceFee] = useState("");
  const [shippingPrice, setShippingPrice] = useState(0);
  const [manualShippingPrice, setManualShippingPrice] = useState("");
  const [auctionLocation, setAuctionLocation] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [weightClass, setWeightClass] = useState<TruckWeightClass | "">("");
  const [engine, setEngine] = useState("");
  const [engineVolume, setEngineVolume] = useState("");
  const [insurance, setInsurance] = useState(false);
  const [highGroundClearance, setHighGroundClearance] = useState(false);
  const [hasReverse, setHasReverse] = useState(false);
  const [icePowerExceedsElectric, setIcePowerExceedsElectric] = useState(false);
  const [outOfAuctionBorders, setOutOfAuctionBorders] = useState(false);
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

  // Handle browser back button when showing results
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.calculatorResults) {
        setShowResults(true);
      } else if (showResults) {
        setShowResults(false);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [showResults]);

  // Push history state when showing results
  const handleShowResults = useCallback(() => {
    window.history.pushState({ calculatorResults: true }, "");
    setShowResults(true);
  }, []);

  // Handle back navigation from results
  const handleBackFromResults = useCallback(() => {
    window.history.back();
  }, []);

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

  // Reset weight class when switching away from truck
  // Reset engine to gasoline if truck is selected with invalid engine type
  useEffect(() => {
    if (vehicleType !== "truck") {
      setWeightClass("");
    } else {
      // Trucks only support gasoline and diesel
      if (engine === "electric" || engine === "hybrid") {
        setEngine("gasoline");
      }
    }
  }, [vehicleType, engine]);

  // Reset high ground clearance when electric engine is selected
  useEffect(() => {
    if (engine === "electric") {
      setHighGroundClearance(false);
    }
  }, [engine]);

  // Set ICE power checkbox to true by default when hybrid is selected
  useEffect(() => {
    if (engine === "hybrid") {
      setIcePowerExceedsElectric(true);
    } else {
      setIcePowerExceedsElectric(false);
    }
  }, [engine]);

  // Helper function to get error styling
  const getErrorClass = (value: string | boolean, isRequired: boolean = true) => {
    if (!showValidation || !isRequired) return "";
    return !value ? "border-red-500 dark:border-red-500" : "";
  };

  useEffect(() => {
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
      
      // Apply out of auction borders adjustment (add 50%)
      if (outOfAuctionBorders) {
        price = price + 50 ;
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
      
      // Apply out of auction borders adjustment (add 50%)
      if (outOfAuctionBorders) {
        price = price + 50
      }
      
      setShippingPrice(price);
    } else {
      setShippingPrice(0);
    }
  }, [auctionLocation, cityPriceMap, vehicleType, activeTab, manualShippingPrice, outOfAuctionBorders]);

  // Calculate insurance: (Shipping Price + Auction Fee) * 1%
  useEffect(() => {
    if (auctionFee && parseFloat(vehiclePrice) > 0) {
      const auction = parseFloat(auctionFee) || 0;
      const vehiclePriceNum = parseFloat(vehiclePrice) || 0;

      let insurance = (vehiclePriceNum + auction) * 0.01;
      if (insurance < 65) {
        insurance = 65
      }

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

    // Validation for weight class when truck is selected
    if (vehicleType === "truck" && !weightClass) {
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
      // Fetch exchange rates first
      const { fetchExchangeRates, calculateEurUsdRate } = await import("@/lib/import-calculator/fetchExchangeRates");
      const ratesResult = await fetchExchangeRates();

      let eurUsdRate: number;
      if (!ratesResult.success) {
        console.error("Failed to fetch exchange rates, using fallback");
        // Use fallback rate: 443.24 / 380.33 = 1.1653
        eurUsdRate = 1.1653;
      } else {
        eurUsdRate = parseFloat(calculateEurUsdRate(ratesResult.data));
      }

      // Convert (carPrice + shippingPrice) from USD to EUR
      const carPriceUsd = parseFloat(vehiclePrice);
      const shippingPriceUsd = shippingPrice || 0;
      const auctionUsd = parseFloat(auctionFee);

      // Handle truck calculation differently (client-side)
      if (vehicleType === "truck" && weightClass) {
        // Convert USD to EUR for truck calculation (divide by eurUsdRate since 1 EUR = eurUsdRate USD)
        const vehiclePriceEur = carPriceUsd / eurUsdRate;
        const auctionFeeEur = auctionUsd / eurUsdRate;

        // Map engine type: "gasoline" -> "petrol", "diesel" -> "diesel"
        const truckEngineType = engine === "diesel" ? "diesel" : "petrol";

        const truckResult = calculateTruckTaxes({
          vehiclePriceEur,
          auctionFeeEur,
          engineVolumeLiters: parseFloat(engineVolume),
          weightClass: weightClass as TruckWeightClass,
          vehicleYear: parseInt(year),
          engineType: truckEngineType,
        });

        // Map truck result to CalculatorResponse format
        // Note: CalculatorResults divides by eurUsdRate to convert EUR→USD, but it should multiply.
        // To compensate, we multiply by eurUsdRate² here so the final displayed USD values are correct.
        const rateSquared = eurUsdRate * eurUsdRate;
        const calculatorResponse: CalculatorResponse = {
          globTax: Math.round(truckResult.customsDuty * rateSquared),
          nds: Math.round(truckResult.vat * rateSquared),
          envTaxPay: Math.round(truckResult.environmentalTax * rateSquared),
          sumPay: Math.round(truckResult.total * rateSquared),
          type: "truck",
        };

        setCalculationResults(calculatorResponse);
        handleShowResults();
      } else if (vehicleType === "quadricycle" || vehicleType === "snowmobile") {
        // Quadricycle/Snowmobile calculation (client-side)
        const vehiclePriceEur = carPriceUsd / eurUsdRate;
        const auctionFeeEur = auctionUsd / eurUsdRate;

        const quadResult = calculateQuadricycleTaxes({
          vehiclePriceEur,
          auctionFeeEur,
          engineVolumeLiters: parseFloat(engineVolume),
          vehicleYear: parseInt(year),
        });

        // Apply rate² compensation (same as trucks)
        const rateSquared = eurUsdRate * eurUsdRate;
        const calculatorResponse: CalculatorResponse = {
          globTax: Math.round(quadResult.customsDuty * rateSquared),
          nds: Math.round(quadResult.vat * rateSquared),
          envTaxPay: Math.round(quadResult.environmentalTax * rateSquared),
          sumPay: Math.round(quadResult.total * rateSquared),
          type: vehicleType,
        };

        setCalculationResults(calculatorResponse);
        handleShowResults();
      } else {
        // Standard vehicle calculation via API
        // Individual importers don't include shipping in the taxable base
        const shippingForTax = importer === "individual" ? 0 : shippingPriceUsd;
        const totalPriceEur = Math.round((carPriceUsd + shippingForTax + auctionUsd) / eurUsdRate);

        const result = await calculateVehicleTaxes({
          price: totalPriceEur, // Send EUR price to backend as integer
          volume: engine === "electric" ? 0 : parseFloat(engineVolume), // Use 0 for electric
          engineType: mapEngineType(engine),
          date: formatDate({ day, month, year }),
          isLegal: importer === "legal" ? 1 : 0,
          offRoad: highGroundClearance ? 1 : 0,
          ICEpower: 0, // Default to 0 as per API spec
        });

        if (result.success) {
          setCalculationResults(result.data);
          handleShowResults();
        } else {
          toast.error(t("calculator.form.calculationError") || "Calculation failed", {
            description: result.error,
          });
        }
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
            <div role="tablist" aria-label={t("calculator.form.auctionTabsAriaLabel")} className="flex border-b border-gray-300 dark:border-white/10 overflow-x-auto scrollbar-hide">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "copart"}
                aria-controls="calculator-form"
                onClick={() => setActiveTab("copart")}
                className={`flex-1 min-w-[140px] py-6 px-4 sm:px-8 transition-colors bg-black whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#429de6] focus-visible:ring-inset ${
                  activeTab === "copart"
                    ? "border-b-2 border-[#429de6]"
                    : "opacity-60 hover:opacity-80"
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
                role="tab"
                aria-selected={activeTab === "iaai"}
                aria-controls="calculator-form"
                onClick={() => setActiveTab("iaai")}
                className={`flex-1 min-w-[140px] py-6 px-4 sm:px-8 transition-colors bg-black whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#429de6] focus-visible:ring-inset ${
                  activeTab === "iaai"
                    ? "border-b-2 border-[#429de6]"
                    : "opacity-60 hover:opacity-80"
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
                role="tab"
                aria-selected={activeTab === "manheim"}
                aria-controls="calculator-form"
                onClick={() => setActiveTab("manheim")}
                className={`flex-1 min-w-[140px] py-6 px-4 sm:px-8 transition-colors bg-black whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#429de6] focus-visible:ring-inset ${
                  activeTab === "manheim"
                    ? "border-b-2 border-[#429de6]"
                    : "opacity-60 hover:opacity-80"
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
                role="tab"
                aria-selected={activeTab === "other"}
                aria-controls="calculator-form"
                onClick={() => setActiveTab("other")}
                className={`flex-1 min-w-[140px] py-6 px-4 sm:px-8 transition-colors bg-black whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#429de6] focus-visible:ring-inset ${
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
                  <div className={`p-2 rounded-lg transition-colors duration-300 ${
                    activeTab === "other"
                      ? "bg-[#429de6]/20"
                      : "bg-white/10"
                  }`}>
                    <MoreHorizontal aria-hidden="true" className={`w-5 h-5 transition-colors duration-300 ${
                      activeTab === "other"
                        ? "text-[#429de6]"
                        : "text-white"
                    }`} />
                  </div>
                </div>
              </button>
            </div>

            {/* Form */}
            <div id="calculator-form" role="tabpanel" className="p-4 sm:p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Importer */}
                <fieldset>
                  <legend className="block text-gray-600 dark:text-gray-400 text-sm mb-3">
                    {t("calculator.form.importer")} <span className="text-red-500" aria-hidden="true">*</span>
                  </legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="radiogroup" aria-required="true">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={importer === "legal"}
                      onClick={() => setImporter("legal")}
                      className={`py-3 px-4 rounded-lg border transition-colors text-sm sm:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-[#429de6] focus-visible:ring-offset-2 ${
                        importer === "legal"
                          ? "border-orange-500 bg-transparent text-gray-900 dark:text-white"
                          : "border-gray-300 dark:border-gray-700 bg-transparent text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600"
                      }`}
                    >
                      {t("calculator.form.legalPerson")}
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={importer === "individual"}
                      onClick={() => setImporter("individual")}
                      className={`py-3 px-4 rounded-lg border transition-colors text-sm sm:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-[#429de6] focus-visible:ring-offset-2 ${
                        importer === "individual"
                          ? "border-orange-500 bg-transparent text-gray-900 dark:text-white"
                          : "border-gray-300 dark:border-gray-700 bg-transparent text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600"
                      }`}
                    >
                      {t("calculator.form.individual")}
                    </button>
                  </div>
                </fieldset>

                {/* Vehicle Price */}
                <div>
                  <label htmlFor="vehicle-price" className="block text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {t("calculator.form.vehiclePrice")} <span className="text-red-500" aria-hidden="true">*</span>
                    <span className="sr-only">({t("calculator.form.required")})</span>
                  </label>
                  <input
                    id="vehicle-price"
                    name="vehiclePrice"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    value={vehiclePrice}
                    onChange={(e) => setVehiclePrice(e.target.value.replace(/[^0-9]/g, ''))}
                    aria-required="true"
                    aria-invalid={showValidation && !vehiclePrice}
                    className={`w-full px-4 py-3 bg-transparent border rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#429de6] text-gray-900 dark:text-white placeholder:text-gray-400 tabular-nums ${
                      getErrorClass(vehiclePrice) || "border-gray-300 dark:border-gray-700 focus:border-[#429de6]"
                    }`}
                  />
                </div>

                {/* Auction Fee */}
                <div>
                  <label htmlFor="auction-fee" className="block text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {t("calculator.form.auctionFee")}
                  </label>
                  <input
                    id="auction-fee"
                    name="auctionFee"
                    type="number"
                    autoComplete="off"
                    value={auctionFee}
                    onChange={(e) => setAuctionFee(e.target.value)}
                    readOnly={activeTab === "copart" || activeTab === "iaai"}
                    aria-readonly={activeTab === "copart" || activeTab === "iaai"}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none text-gray-900 dark:text-white placeholder:text-gray-400 tabular-nums ${
                      activeTab === "copart" || activeTab === "iaai"
                        ? "bg-gray-50 dark:bg-gray-900/50 border-gray-300 dark:border-gray-700 cursor-not-allowed"
                        : "bg-transparent border-gray-300 dark:border-gray-700 focus-visible:ring-2 focus-visible:ring-[#429de6] focus:border-[#429de6]"
                    }`}
                  />
                </div>

                {/* Auction Location and Out of Borders Checkbox */}
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 sm:gap-4 sm:items-end">
                  <div>
                    <label id="auction-location-label" className="block text-gray-600 dark:text-gray-400 text-sm mb-2">
                      {t("calculator.form.auctionLocation")} <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <Select value={auctionLocation} onValueChange={setAuctionLocation} disabled={isLoadingLocations}>
                      <SelectTrigger
                        aria-labelledby="auction-location-label"
                        aria-required="true"
                        aria-invalid={showValidation && !auctionLocation}
                        className={`w-full h-12 bg-transparent text-gray-900 dark:text-white ${
                          getErrorClass(auctionLocation) || "border-gray-300 dark:border-gray-700"
                        }`}
                      >
                        <SelectValue placeholder={isLoadingLocations ? `${t("calculator.form.loadingLocations") || "Loading"}…` : t("calculator.form.selectLocation")} />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#111111] border-gray-300 dark:border-gray-700 max-h-[300px] overflow-y-auto">
                        {availableCities.length > 0 ? (
                          availableCities.map((city) => (
                            <SelectItem 
                              key={city}
                              value={city}
                              className="text-gray-900 dark:text-white hover:bg-[#429de6]/20 hover:text-[#429de6] hover:font-medium dark:hover:bg-[#429de6]/30 dark:hover:text-[#429de6] focus:bg-[#429de6]/20 focus:text-[#429de6] focus:font-medium dark:focus:bg-[#429de6]/30 dark:focus:text-[#429de6] data-[state=checked]:bg-[#429de6]/20 data-[state=checked]:text-[#429de6] data-[state=checked]:font-medium dark:data-[state=checked]:bg-[#429de6]/30 dark:data-[state=checked]:text-[#429de6] transition-colors cursor-pointer"
                            >
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

                  {/* Out of Auction Borders Checkbox */}
                  <div className="sm:pb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        id="out-of-borders"
                        name="outOfAuctionBorders"
                        type="checkbox"
                        checked={outOfAuctionBorders}
                        onChange={(e) => setOutOfAuctionBorders(e.target.checked)}
                        className="w-4 h-4 flex-shrink-0 bg-transparent border-gray-300 dark:border-gray-700 text-[#429de6] rounded focus:ring-[#429de6] focus:ring-offset-0"
                      />
                      <span className="text-gray-600 dark:text-gray-400 text-xs leading-tight">{t("calculator.form.outOfAuctionBorders")}</span>
                    </label>
                  </div>
                </div>

                {/* Manual Shipping Price (Only for "Other" auction) */}
                {activeTab === "other" && (
                  <div>
                    <label htmlFor="manual-shipping-price" className="block text-gray-600 dark:text-gray-400 text-sm mb-2">
                      {t("calculator.form.shippingPrice")} <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="manual-shipping-price"
                      name="manualShippingPrice"
                      type="number"
                      inputMode="decimal"
                      autoComplete="off"
                      value={manualShippingPrice}
                      onChange={(e) => setManualShippingPrice(e.target.value)}
                      placeholder={t("calculator.form.enterShippingPrice") || "Enter shipping price"}
                      aria-required="true"
                      aria-invalid={showValidation && !manualShippingPrice}
                      className={`w-full h-12 px-4 rounded-lg bg-transparent border ${
                        getErrorClass(manualShippingPrice) || "border-gray-300 dark:border-gray-700"
                      } text-gray-900 dark:text-white placeholder-gray-400 tabular-nums focus:outline-none focus-visible:ring-2 focus-visible:ring-[#429de6] focus:border-transparent transition-colors`}
                    />
                  </div>
                )}
              </div>

              {/* Vertical Separator */}
              <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800"></div>

              {/* Right Column */}
              <div className="space-y-6 lg:pl-8">
                {/* Date Selection: Day, Month, Year */}
                <fieldset>
                  <legend className="sr-only">{t("calculator.form.vehicleYear")} <span className="text-red-500" aria-hidden="true">*</span></legend>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label id="day-label" className="sr-only">{t("calculator.form.day")}</label>
                      <Select value={day} onValueChange={setDay}>
                        <SelectTrigger
                          aria-labelledby="day-label"
                          aria-required="true"
                          aria-invalid={showValidation && !day}
                          className={`h-12 bg-transparent text-gray-900 dark:text-white tabular-nums ${
                            getErrorClass(day) || "border-gray-300 dark:border-gray-700"
                          }`}
                        >
                          <SelectValue placeholder={t("calculator.form.day")} />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#111111] border-gray-300 dark:border-gray-700 max-h-[300px]">
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                            <SelectItem key={d} value={String(d)} className="tabular-nums">{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label id="month-label" className="sr-only">{t("calculator.form.month")}</label>
                      <Select value={month} onValueChange={setMonth}>
                        <SelectTrigger
                          aria-labelledby="month-label"
                          aria-required="true"
                          aria-invalid={showValidation && !month}
                          className={`h-12 bg-transparent text-gray-900 dark:text-white tabular-nums ${
                            getErrorClass(month) || "border-gray-300 dark:border-gray-700"
                          }`}
                        >
                          <SelectValue placeholder={t("calculator.form.month")} />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#111111] border-gray-300 dark:border-gray-700 max-h-[300px]">
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                            <SelectItem key={m} value={String(m)} className="tabular-nums">{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label id="year-label" className="sr-only">{t("calculator.form.year")}</label>
                      <Select value={year} onValueChange={setYear}>
                        <SelectTrigger
                          aria-labelledby="year-label"
                          aria-required="true"
                          aria-invalid={showValidation && !year}
                          className={`h-12 bg-transparent text-gray-900 dark:text-white tabular-nums ${
                            getErrorClass(year) || "border-gray-300 dark:border-gray-700"
                          }`}
                        >
                          <SelectValue placeholder={t("calculator.form.year")} />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#111111] border-gray-300 dark:border-gray-700 max-h-[300px]">
                          {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                            <SelectItem key={y} value={String(y)} className="tabular-nums">{y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </fieldset>

                {/* Vehicle Type */}
                <div>
                  <label id="vehicle-type-label" className="block text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {t("calculator.form.vehicleType")} <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <Select value={vehicleType} onValueChange={setVehicleType}>
                    <SelectTrigger
                      aria-labelledby="vehicle-type-label"
                      aria-required="true"
                      aria-invalid={showValidation && !vehicleType}
                      className={`w-full h-12 bg-transparent text-gray-900 dark:text-white ${
                        getErrorClass(vehicleType) || "border-gray-300 dark:border-gray-700"
                      }`}
                    >
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

                {/* Weight Class - Only for Trucks */}
                {vehicleType === "truck" && (
                  <div>
                    <label id="weight-class-label" className="block text-gray-600 dark:text-gray-400 text-sm mb-2">
                      {t("calculator.form.weightClass")} <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <Select value={weightClass} onValueChange={(value) => setWeightClass(value as TruckWeightClass)}>
                      <SelectTrigger
                        aria-labelledby="weight-class-label"
                        aria-required="true"
                        aria-invalid={showValidation && vehicleType === "truck" && !weightClass}
                        className={`w-full h-12 bg-transparent text-gray-900 dark:text-white ${
                          (showValidation && vehicleType === "truck" && !weightClass) ? "border-red-500 dark:border-red-500" : "border-gray-300 dark:border-gray-700"
                        }`}
                      >
                        <SelectValue placeholder={t("calculator.form.selectWeightClass")} />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#111111] border-gray-300 dark:border-gray-700">
                        <SelectItem value="under5">{t("calculator.form.weightClassUnder5")}</SelectItem>
                        <SelectItem value="5to20">{t("calculator.form.weightClass5to20")}</SelectItem>
                        <SelectItem value="above20">{t("calculator.form.weightClassAbove20")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Engine and Engine Volume Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Engine */}
                  <div className={engine === "electric" ? "sm:col-span-2" : ""}>
                    <label id="engine-type-label" className="block text-gray-600 dark:text-gray-400 text-sm mb-2">
                      {t("calculator.form.engine")} <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <Select
                      value={engine}
                      onValueChange={setEngine}
                      disabled={vehicleType === "quadricycle"}
                    >
                      <SelectTrigger
                        aria-labelledby="engine-type-label"
                        aria-required="true"
                        aria-invalid={showValidation && !engine}
                        className={`w-full h-12 bg-transparent text-gray-900 dark:text-white ${
                          vehicleType === "quadricycle"
                            ? "cursor-not-allowed opacity-60 border-gray-300 dark:border-gray-700"
                            : getErrorClass(engine) || "border-gray-300 dark:border-gray-700"
                        }`}
                      >
                        <SelectValue placeholder={t("calculator.form.selectEngine")} />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#111111] border-gray-300 dark:border-gray-700">
                        <SelectItem value="gasoline">{t("calculator.form.gasoline")}</SelectItem>
                        <SelectItem value="diesel">{t("calculator.form.diesel")}</SelectItem>
                        {vehicleType !== "truck" && (
                          <>
                            <SelectItem value="electric">{t("calculator.form.electric")}</SelectItem>
                            <SelectItem value="hybrid">{t("calculator.form.hybrid")}</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Engine Volume - Hidden for electric */}
                  {engine !== "electric" && (
                    <div>
                      <label htmlFor="engine-volume" className="block text-gray-600 dark:text-gray-400 text-sm mb-2">
                        {t("calculator.form.engineVolume")} <span className="text-red-500" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="engine-volume"
                        name="engineVolume"
                        type="number"
                        inputMode="decimal"
                        autoComplete="off"
                        step="any"
                        value={engineVolume}
                        onChange={(e) => setEngineVolume(e.target.value)}
                        aria-required="true"
                        aria-invalid={showValidation && !engineVolume}
                        className={`w-full px-4 py-3 bg-transparent border rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#429de6] text-gray-900 dark:text-white placeholder:text-gray-400 text-sm sm:text-base tabular-nums ${
                          getErrorClass(engineVolume) || "border-gray-300 dark:border-gray-700 focus:border-[#429de6]"
                        }`}
                      />
                    </div>
                  )}
                </div>

                {/* Checkboxes */}
                <fieldset className="space-y-3 pt-4">
                  <label htmlFor="insurance-checkbox" className="flex items-center gap-3 cursor-pointer">
                    <input
                      id="insurance-checkbox"
                      name="insurance"
                      type="checkbox"
                      checked={insurance}
                      onChange={(e) => setInsurance(e.target.checked)}
                      className="w-4 h-4 bg-transparent border-gray-300 dark:border-gray-700 text-[#429de6] rounded focus:ring-[#429de6] focus:ring-offset-0"
                    />
                    <span className="text-gray-600 dark:text-gray-400">{t("calculator.form.insurance")}</span>
                  </label>

                  {/* High ground clearance - Only show for Passenger vehicles and not electric */}
                  {vehicleType === "passenger" && engine !== "electric" && (
                    <label htmlFor="high-ground-clearance" className="flex items-center gap-3 cursor-pointer">
                      <input
                        id="high-ground-clearance"
                        name="highGroundClearance"
                        type="checkbox"
                        checked={highGroundClearance}
                        onChange={(e) => setHighGroundClearance(e.target.checked)}
                        className="w-4 h-4 bg-transparent border-gray-300 dark:border-gray-700 text-[#429de6] rounded focus:ring-[#429de6] focus:ring-offset-0"
                      />
                      <span className="text-gray-600 dark:text-gray-400">{t("calculator.form.highGroundClearance")}</span>
                    </label>
                  )}

                  {/* Has Reverse - Only show for Quadricycle */}
                  {vehicleType === "quadricycle" && (
                    <label htmlFor="has-reverse" className="flex items-center gap-3 cursor-pointer">
                      <input
                        id="has-reverse"
                        name="hasReverse"
                        type="checkbox"
                        checked={hasReverse}
                        onChange={(e) => setHasReverse(e.target.checked)}
                        className="w-4 h-4 bg-transparent border-gray-300 dark:border-gray-700 text-[#429de6] rounded focus:ring-[#429de6] focus:ring-offset-0"
                      />
                      <span className="text-gray-600 dark:text-gray-400">{t("calculator.form.hasReverse")}</span>
                    </label>
                  )}

                  {/* ICE Power Exceeds Electric - Only show for Hybrid */}
                  {engine === "hybrid" && (
                    <label htmlFor="ice-power-exceeds" className="flex items-center gap-3 cursor-pointer">
                      <input
                        id="ice-power-exceeds"
                        name="icePowerExceedsElectric"
                        type="checkbox"
                        checked={icePowerExceedsElectric}
                        onChange={(e) => setIcePowerExceedsElectric(e.target.checked)}
                        className="w-4 h-4 bg-transparent border-gray-300 dark:border-gray-700 text-[#429de6] rounded focus:ring-[#429de6] focus:ring-offset-0"
                      />
                      <span className="text-gray-600 dark:text-gray-400">{t("calculator.form.icePowerExceedsElectric")}</span>
                    </label>
                  )}
                </fieldset>
              </div>
            </div>

            {/* Calculate Button */}
            <div className="mt-8 flex justify-center">
              <button
                type="submit"
                disabled={isCalculating}
                aria-busy={isCalculating}
                className="px-8 py-3 bg-[#429de6] text-white rounded-lg hover:bg-[#3a8acc] transition-colors hover:shadow-lg hover:shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#429de6] focus-visible:ring-offset-2"
              >
                {isCalculating ? `${t("calculator.form.calculating") || "Calculating"}…` : t("calculator.form.calculateCost")}
                <span aria-hidden="true">›</span>
              </button>
            </div>
          </form>
            </div>
          </div>

          {showNotice && (
            <div className="mt-4 sm:mt-6 bg-[#429de6]/10 border border-[#429de6]/20 rounded-2xl p-4 sm:p-6">
              <div className="flex gap-3">
                <Info aria-hidden="true" className="w-5 h-5 text-[#429de6] flex-shrink-0 mt-0.5" />
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
          showPartnerMessage={showPartnerMessage}
          onBack={handleBackFromResults}
          // Restricted data - only pass when in admin panel
          {...(disablePartnerRestrictions && {
            insuranceFee,
            shippingPrice,
            calculationResults,
            hasInsurance: insurance,
          })}
        />
      )}
    </div>
  );
};
