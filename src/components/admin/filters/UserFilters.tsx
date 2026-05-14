"use client";

import { useMemo } from "react";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormSelect, type FormSelectOption } from "@/components/ui/form-select";

export type UserFiltersState = {
  search: string;
  country: string;
};

type UserFiltersProps = {
  filters: UserFiltersState;
  onFiltersChange: (filters: UserFiltersState) => void;
  onClearFilters: () => void;
};

const COUNTRY_KEYS = ["armenia", "usa", "georgia", "russia", "other"] as const;

export const UserFilters = ({ filters, onFiltersChange, onClearFilters }: UserFiltersProps) => {
  const t = useTranslations("admin.filters");
  const tCountries = useTranslations("admin.modals.createUser.countries");

  const hasActiveFilters = filters.search !== "" || filters.country !== "all";

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search });
  };

  const handleCountryChange = (country: string) => {
    onFiltersChange({ ...filters, country });
  };

  const countryOptions = useMemo<FormSelectOption[]>(
    () => [
      { value: "all", label: t("allCountries") },
      ...COUNTRY_KEYS.map((countryKey) => ({
        value: tCountries(countryKey),
        label: tCountries(countryKey),
      })),
    ],
    [t, tCountries]
  );

  return (
    <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t("searchUsers")}
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 h-10 bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10 focus-visible:ring-[#429de6]"
            />
          </div>

          {/* Country Filter */}
          <FormSelect
            value={filters.country}
            onValueChange={handleCountryChange}
            options={countryOptions}
            placeholder={t("country")}
            className="w-full sm:w-[180px]"
          />

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              onClick={onClearFilters}
              className="h-10 px-4 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <X aria-hidden="true" className="h-4 w-4 mr-2" />
              {t("clearFilters")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
