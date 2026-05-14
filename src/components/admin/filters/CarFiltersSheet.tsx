"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  CarFilterFields,
  countActiveDropdownFilters,
  type CarFiltersState,
} from "@/components/admin/filters/CarFilters";

type CarFiltersSheetProps = {
  filters: CarFiltersState;
  onFiltersChange: (filters: CarFiltersState) => void;
  onClearFilters: () => void;
};

export const CarFiltersSheet = ({
  filters,
  onFiltersChange,
  onClearFilters,
}: CarFiltersSheetProps) => {
  const t = useTranslations("admin.filters");
  const [isOpen, setIsOpen] = useState(false);

  const activeCount = useMemo(() => countActiveDropdownFilters(filters), [filters]);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-10 px-4 gap-2 border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b0f14] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {t("mobileFilterTrigger")}
          {activeCount > 0 && (
            <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#429de6] px-1.5 text-[11px] font-semibold text-white">
              {activeCount}
            </span>
          )}
        </Button>
      </DrawerTrigger>

      <DrawerContent className="border-gray-200 bg-white dark:border-white/10 dark:bg-[#0b0f14]">
        <DrawerHeader className="border-b border-gray-200 dark:border-white/10">
          <DrawerTitle className="text-base text-gray-900 dark:text-white">
            {t("mobileFilterTitle")}
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col gap-3 overflow-y-auto px-4 py-4">
          <CarFilterFields filters={filters} onFiltersChange={onFiltersChange} />
        </div>

        <DrawerFooter className="border-t border-gray-200 dark:border-white/10 flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClearFilters}
            disabled={activeCount === 0}
            className="flex-1 min-h-[44px] border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-40"
          >
            <X aria-hidden="true" className="h-4 w-4 mr-2" />
            {t("clearFilters")}
          </Button>
          <DrawerClose asChild>
            <Button
              type="button"
              className="flex-1 min-h-[44px] bg-[#429de6] text-white hover:bg-[#3a8acc]"
            >
              {t("mobileFilterApply")}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
