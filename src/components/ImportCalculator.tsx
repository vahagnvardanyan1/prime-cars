"use client";

import type { FormEvent } from "react";

import { useMemo, useState } from "react";

import { Calculator, DollarSign, Info, FileText, Ship, Wrench } from "lucide-react";

import { calculateImportCosts } from "@/lib/import-calculator/calculateImportCosts";

export const ImportCalculator = () => {
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
          <h2 className="text-gray-900 dark:text-white mb-6">Vehicle Information</h2>

          <form onSubmit={handleCalculate} className="space-y-6">
            <div>
              <label className="block text-gray-900 dark:text-white mb-2">
                Vehicle Purchase Price (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
                <input
                  type="number"
                  value={vehiclePrice}
                  onChange={(e) => setVehiclePrice(e.target.value)}
                  placeholder="50,000"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-black border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#429de6] focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-500"
                />
              </div>
              <p className="text-gray-600 dark:text-gray-500 mt-2">
                Enter the auction or purchase price of the vehicle
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 dark:text-white mb-2">
                  Origin Country
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 dark:bg-black border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#429de6] focus:border-transparent text-gray-900 dark:text-white"
                >
                  <option value="japan">Japan</option>
                  <option value="usa">United States</option>
                  <option value="germany">Germany</option>
                  <option value="uk">United Kingdom</option>
                  <option value="italy">Italy</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-900 dark:text-white mb-2">
                  Vehicle Type
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 dark:bg-black border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#429de6] focus:border-transparent text-gray-900 dark:text-white"
                >
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="sports">Sports Car</option>
                  <option value="luxury">Luxury Car</option>
                  <option value="electric">Electric Vehicle</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 dark:text-white mb-2">
                  Engine Size (Liters)
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
                  Vehicle Year
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
                Calculate Total Cost
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-[#429de6]/10 border border-[#429de6]/20 rounded-2xl p-6">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-[#429de6] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-gray-900 dark:text-white mb-2">Estimation Notice</h3>
              <p className="text-gray-600 dark:text-gray-400">
                This calculator provides an estimate based on typical import
                scenarios. Actual costs may vary depending on specific vehicle
                details, current exchange rates, and customs regulations. For a
                precise quote, please contact our team.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-300 dark:border-white/10 p-8 sticky top-28 transition-colors duration-300">
          <h2 className="text-gray-900 dark:text-white mb-6">Cost Breakdown</h2>

          {!showResults || !vehiclePrice ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-300 dark:border-white/10">
                <Calculator className="w-10 h-10 text-gray-500 dark:text-gray-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Enter vehicle details and calculate to see your cost breakdown
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between py-4 border-b border-gray-300 dark:border-white/10">
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-gray-900 dark:text-white">
                      Vehicle Purchase Price
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      Auction or dealer price
                    </div>
                  </div>
                </div>
                <div className="text-gray-900 dark:text-white">
                  ${costs.basePrice.toLocaleString("en-US", {
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
                      International Shipping
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      Ocean freight & handling
                    </div>
                  </div>
                </div>
                <div className="text-gray-900 dark:text-white">
                  ${costs.shippingCost.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>

              <div className="flex items-start justify-between py-4 border-b border-gray-300 dark:border-white/10">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-gray-900 dark:text-white">Customs & Duties</div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      Import taxes & VAT
                    </div>
                  </div>
                </div>
                <div className="text-gray-900 dark:text-white">
                  ${costs.customsDuty.toLocaleString("en-US", {
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
                      Inspection & Certification
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      Safety & emissions testing
                    </div>
                  </div>
                </div>
                <div className="text-gray-900 dark:text-white">
                  ${costs.inspectionFees.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>

              <div className="flex items-start justify-between py-4 border-b border-gray-300 dark:border-white/10">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-gray-900 dark:text-white">Documentation Fees</div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      Title, registration & paperwork
                    </div>
                  </div>
                </div>
                <div className="text-gray-900 dark:text-white">
                  ${costs.documentationFees.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>

              <div className="flex items-start justify-between py-4 border-b border-gray-300 dark:border-white/10">
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-gray-900 dark:text-white">Prime Cars Service Fee</div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      Concierge & support
                    </div>
                  </div>
                </div>
                <div className="text-gray-900 dark:text-white">
                  ${costs.serviceFee.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#429de6] to-[#3a8acc] rounded-xl p-6 mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-blue-100 mb-1">Estimated Total Cost</div>
                    <div className="text-white text-3xl">
                      ${costs.totalCost.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 py-4 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all" type="button">
                Request Detailed Quote
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
