"use client";

import { memo, useCallback, useMemo } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/admin/primitives/DateRangePicker";
import { SearchInput } from "@/components/admin/primitives/SearchInput";

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

type CarFilterFieldsProps = {
  filters: CarFiltersState;
  onFiltersChange: (filters: CarFiltersState) => void;
};

type FilterOption = { value: string; label: string };

type FilterSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  label: string;
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

const AUCTIONS = ["copart", "iaai", "manheim", "other"];

export const hasActiveFilters = (filters: CarFiltersState): boolean =>
  filters.search !== "" ||
  filters.type !== "all" ||
  filters.auction !== "all" ||
  filters.carPaid !== "all" ||
  filters.shippingPaid !== "all" ||
  filters.insurance !== "all" ||
  filters.purchaseDateFrom !== "" ||
  filters.purchaseDateTo !== "";

export const countActiveDropdownFilters = (filters: CarFiltersState): number => {
  let count = 0;
  if (filters.type !== "all") count++;
  if (filters.auction !== "all") count++;
  if (filters.carPaid !== "all") count++;
  if (filters.shippingPaid !== "all") count++;
  if (filters.insurance !== "all") count++;
  if (filters.purchaseDateFrom !== "" || filters.purchaseDateTo !== "") count++;
  return count;
};

const FilterSelect = ({ value, onChange, options, label}: FilterSelectProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label={label}
        className="w-full h-10 bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10"
      >
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10">
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="capitalize">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export const CarFilterFields = memo(function CarFilterFields({
  filters,
  onFiltersChange,
}: CarFilterFieldsProps) {
  const t = useTranslations("admin.filters");
  const tCar = useTranslations("admin.modals.addCar");

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

  const typeOptions = useMemo<FilterOption[]>(
    () => [
      { value: "all", label: t("allTypes") },
      ...VEHICLE_TYPES.map((type) => ({
        value: type,
        label: tCar.has(`vehicleTypes.${type}`) ? tCar(`vehicleTypes.${type}`) : type,
      })),
    ],
    [t, tCar]
  );

  const auctionOptions = useMemo<FilterOption[]>(
    () => [
      { value: "all", label: t("allAuctions") },
      ...AUCTIONS.map((auction) => ({
        value: auction,
        label: tCar.has(`auctions.${auction}`) ? tCar(`auctions.${auction}`) : auction,
      })),
    ],
    [t, tCar]
  );

  const carPaidOptions = useMemo<FilterOption[]>(
    () => [
      { value: "all", label: t("allCarPayments") },
      { value: "paid", label: tCar("paid") },
      { value: "not-paid", label: tCar("notPaid") },
    ],
    [t, tCar]
  );

  const shippingPaidOptions = useMemo<FilterOption[]>(
    () => [
      { value: "all", label: t("allShippingPayments") },
      { value: "paid", label: tCar("paid") },
      { value: "not-paid", label: tCar("notPaid") },
    ],
    [t, tCar]
  );

  const insuranceOptions = useMemo<FilterOption[]>(
    () => [
      { value: "all", label: t("allInsurance") },
      { value: "exists", label: tCar("exists") },
      { value: "not-exists", label: tCar("notExists") },
    ],
    [t, tCar]
  );

  return (
    <>
      <FilterSelect
        value={filters.type}
        onChange={handleTypeChange}
        options={typeOptions}
        label={t("type")}
      />
      <FilterSelect
        value={filters.auction}
        onChange={handleAuctionChange}
        options={auctionOptions}
        label={t("auction")}
      />
      <FilterSelect
        value={filters.carPaid}
        onChange={handleCarPaidChange}
        options={carPaidOptions}
        label={t("carPaid")}
      />
      <FilterSelect
        value={filters.shippingPaid}
        onChange={handleShippingPaidChange}
        options={shippingPaidOptions}
        label={t("shippingPaid")}
      />
      <FilterSelect
        value={filters.insurance}
        onChange={handleInsuranceChange}
        options={insuranceOptions}
        label={t("insuranceFilter")}
      />

      <DateRangePicker
        dateFrom={filters.purchaseDateFrom}
        dateTo={filters.purchaseDateTo}
        onDateFromChange={handlePurchaseDateFromChange}
        onDateToChange={handlePurchaseDateToChange}
        onClear={handlePurchaseDateClear}
        placeholder={t("purchaseDateRange")}
      />
    </>
  );
});

export const CarFilters = memo(function CarFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: CarFiltersProps) {
  const t = useTranslations("admin.filters");

  const filtersActive = useMemo(() => hasActiveFilters(filters), [filters]);

  const handleSearchChange = useCallback(
    (search: string) => onFiltersChange({ ...filters, search }),
    [filters, onFiltersChange]
  );

  return (
    <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchInput
            containerClassName="flex-1"
            placeholder={t("searchCars")}
            value={filters.search}
            onChange={handleSearchChange}
          />

          <Button
            type="button"
            variant="outline"
            onClick={onClearFilters}
            disabled={!filtersActive}
            className="h-10 px-4 whitespace-nowrap border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-400 dark:hover:border-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <X aria-hidden="true" className="h-4 w-4 mr-2" />
            {t("clearFilters")}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-3">
          <CarFilterFields filters={filters} onFiltersChange={onFiltersChange} />
        </div>
      </div>
    </div>
  );
});
