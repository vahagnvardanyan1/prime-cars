"use client";

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
import type { AdminCarStatus } from "@/lib/admin/types";

export type CarFiltersState = {
  search: string;
  type: string;
  auction: string;
  status: AdminCarStatus | "all";
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
  "adesa",
  "other",
];

const STATUSES: Array<AdminCarStatus | "all"> = [
  "all",
  "Active",
  "Draft",
  "Pending Review",
  "Sold",
];

export const CarFilters = ({ filters, onFiltersChange, onClearFilters }: CarFiltersProps) => {
  const t = useTranslations("admin.filters");
  const tCar = useTranslations("admin.modals.addCar");

  const hasActiveFilters = 
    filters.search !== "" || 
    filters.type !== "all" || 
    filters.auction !== "all" || 
    filters.status !== "all";

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search });
  };

  const handleTypeChange = (type: string) => {
    onFiltersChange({ ...filters, type });
  };

  const handleAuctionChange = (auction: string) => {
    onFiltersChange({ ...filters, auction });
  };

  const handleStatusChange = (status: string) => {
    onFiltersChange({ ...filters, status: status as AdminCarStatus | "all" });
  };

  return (
    <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t("searchCars")}
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 h-10 bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10 focus-visible:ring-[#429de6]"
            />
          </div>

          {/* Type Filter */}
          <Select value={filters.type} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-full sm:w-[180px] h-10 bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10">
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
            <SelectTrigger className="w-full sm:w-[180px] h-10 bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10">
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

          {/* Status Filter */}
          <Select value={filters.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-[180px] h-10 bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10">
              <SelectValue placeholder={t("status")} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10">
              {STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status === "all" ? t("allStatuses") : status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              onClick={onClearFilters}
              className="h-10 px-4 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <X className="h-4 w-4 mr-2" />
              {t("clearFilters")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
