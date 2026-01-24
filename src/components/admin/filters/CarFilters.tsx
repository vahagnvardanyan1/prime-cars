"use client";

import { memo, useCallback, useMemo } from "react";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/admin/primitives/DateRangePicker";

export type CarFiltersState = {
  search: string;
  type: string;
  auction: string;
  carPaid: "all" | "paid" | "not-paid";
  shippingPaid: "all" | "paid" | "not-paid";
  insurance: "all" | "exists" | "not-exists";
  purchaseDateFrom: string;
  purchaseDateTo: string;
};

type CarFiltersProps = {
  filters: CarFiltersState;
  onFiltersChange: (filters: CarFiltersState) => void;
  onClearFilters: () => void;
};

const VEHICLE_TYPES = [
  "auto",
  "motorcycle",
  "limousine",
  "boat",
  "trailer",
  "truck",
  "oversized truck",
  "jetski",
  "ATV",
  "moped",
  "scooter",
  "other",
];

const AUCTIONS = [
  "copart",
  "iaai",
  "manheim",
  "other",
];

export const CarFilters = memo(function CarFilters({ filters, onFiltersChange, onClearFilters }: CarFiltersProps) {
  const t = useTranslations("admin.filters");
  const tCar = useTranslations("admin.modals.addCar");

  // Memoize the active filters check
  const hasActiveFilters = useMemo(() =>
    filters.search !== "" ||
    filters.type !== "all" ||
    filters.auction !== "all" ||
    filters.carPaid !== "all" ||
    filters.shippingPaid !== "all" ||
    filters.insurance !== "all" ||
    filters.purchaseDateFrom !== "" ||
    filters.purchaseDateTo !== "",
    [filters]
  );

  // Stable callback handlers
  const handleSearchChange = useCallback((search: string) => {
    onFiltersChange({ ...filters, search });
  }, [filters, onFiltersChange]);

  const handleTypeChange = useCallback((type: string) => {
    onFiltersChange({ ...filters, type });
  }, [filters, onFiltersChange]);

  const handleAuctionChange = useCallback((auction: string) => {
    onFiltersChange({ ...filters, auction });
  }, [filters, onFiltersChange]);

  const handleCarPaidChange = useCallback((value: string) => {
    onFiltersChange({ ...filters, carPaid: value as "all" | "paid" | "not-paid" });
  }, [filters, onFiltersChange]);

  const handleShippingPaidChange = useCallback((value: string) => {
    onFiltersChange({ ...filters, shippingPaid: value as "all" | "paid" | "not-paid" });
  }, [filters, onFiltersChange]);

  const handleInsuranceChange = useCallback((value: string) => {
    onFiltersChange({ ...filters, insurance: value as "all" | "exists" | "not-exists" });
  }, [filters, onFiltersChange]);

  const handlePurchaseDateFromChange = useCallback((value: string) => {
    onFiltersChange({ ...filters, purchaseDateFrom: value });
  }, [filters, onFiltersChange]);

  const handlePurchaseDateToChange = useCallback((value: string) => {
    onFiltersChange({ ...filters, purchaseDateTo: value });
  }, [filters, onFiltersChange]);

  const handlePurchaseDateClear = useCallback(() => {
    onFiltersChange({ ...filters, purchaseDateFrom: "", purchaseDateTo: "" });
  }, [filters, onFiltersChange]);

  return (
    <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t("searchCars")}
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 h-10 bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10 focus-visible:ring-[#429de6]"
            />
          </div>

          {/* Clear Filters Button */}
          <Button
            type="button"
            variant="outline"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className="h-10 px-4 whitespace-nowrap border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-400 dark:hover:border-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <X aria-hidden="true" className="h-4 w-4 mr-2" />
            {t("clearFilters")}
          </Button>
        </div>

        {/* Second Row: All Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-3">
          {/* Type Filter */}
          <Select value={filters.type} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-full min-w-[200px] h-10 bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10">
              <SelectValue placeholder={t("type")} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10">
              <SelectItem value="all">{t("allTypes")}</SelectItem>
              {VEHICLE_TYPES.map((type) => (
                <SelectItem key={type} value={type} className="capitalize">
                  {tCar.has(`vehicleTypes.${type}`) 
                    ? tCar(`vehicleTypes.${type}`) 
                    : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Auction Filter */}
          <Select value={filters.auction} onValueChange={handleAuctionChange}>
            <SelectTrigger className="w-full min-w-[200px] h-10 bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10">
              <SelectValue placeholder={t("auction")} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10">
              <SelectItem value="all">{t("allAuctions")}</SelectItem>
              {AUCTIONS.map((auction) => (
                <SelectItem key={auction} value={auction} className="capitalize">
                  {tCar.has(`auctions.${auction}`) 
                    ? tCar(`auctions.${auction}`) 
                    : auction}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Car Paid Filter */}
          <Select value={filters.carPaid} onValueChange={handleCarPaidChange}>
            <SelectTrigger className="w-full min-w-[200px] h-10 bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10">
              <SelectValue placeholder={t("carPaid")} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10">
              <SelectItem value="all">{t("allCarPayments")}</SelectItem>
              <SelectItem value="paid">{tCar("paid")}</SelectItem>
              <SelectItem value="not-paid">{tCar("notPaid")}</SelectItem>
            </SelectContent>
          </Select>

          {/* Shipping Paid Filter */}
          <Select value={filters.shippingPaid} onValueChange={handleShippingPaidChange}>
            <SelectTrigger className="w-full min-w-[200px] h-10 bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10">
              <SelectValue placeholder={t("shippingPaid")} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10">
              <SelectItem value="all">{t("allShippingPayments")}</SelectItem>
              <SelectItem value="paid">{tCar("paid")}</SelectItem>
              <SelectItem value="not-paid">{tCar("notPaid")}</SelectItem>
            </SelectContent>
          </Select>

          {/* Insurance Filter */}
          <Select value={filters.insurance} onValueChange={handleInsuranceChange}>
            <SelectTrigger className="w-full min-w-[200px] h-10 bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10">
              <SelectValue placeholder={t("insuranceFilter")} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10">
              <SelectItem value="all">{t("allInsurance")}</SelectItem>
              <SelectItem value="exists">{tCar("exists")}</SelectItem>
              <SelectItem value="not-exists">{tCar("notExists")}</SelectItem>
            </SelectContent>
          </Select>

          {/* Purchase Date Range */}
          <DateRangePicker
            dateFrom={filters.purchaseDateFrom}
            dateTo={filters.purchaseDateTo}
            onDateFromChange={handlePurchaseDateFromChange}
            onDateToChange={handlePurchaseDateToChange}
            onClear={handlePurchaseDateClear}
            placeholder={t("purchaseDateRange")}
          />
        </div>
      </div>
    </div>
  );
});
