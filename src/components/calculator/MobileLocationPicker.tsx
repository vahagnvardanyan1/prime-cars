"use client";

import { useMemo, useState } from "react";

import { ChevronDown } from "lucide-react";

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

type MobileLocationPickerProps = {
  value: string;
  onChange: (value: string) => void;
  cities: string[];
  loading: boolean;
  placeholder: string;
  loadingLabel: string;
  title: string;
  searchPlaceholder: string;
  noResultsLabel: string;
  hasError?: boolean;
  ariaLabelledBy?: string;
  closeLabel: string;
};

export const MobileLocationPicker = ({
  value,
  onChange,
  cities,
  loading,
  placeholder,
  loadingLabel,
  title,
  searchPlaceholder,
  noResultsLabel,
  hasError = false,
  ariaLabelledBy,
  closeLabel,
}: MobileLocationPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCities = useMemo(
    () => cities.filter((c) => c.toLowerCase().includes(search.toLowerCase())),
    [cities, search],
  );

  const handleOpenChange = (next: boolean) => {
    setIsOpen(next);
    if (!next) setSearch("");
  };

  const handleSelect = (city: string) => {
    // Blur first so iOS's keyboard-dismiss animation starts in the same frame
    // as the drawer close. Otherwise vaul (repositionInputs: true by default)
    // animates the drawer to its keyboard-less rest position once the keyboard
    // hides, *then* slides off — reads as a two-step close on iOS.
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    onChange(city);
    setSearch("");
    setIsOpen(false);
  };

  const borderClass = hasError
    ? "border-red-500 dark:border-red-500"
    : "border-gray-300 dark:border-gray-700";

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        <button
          type="button"
          disabled={loading}
          aria-labelledby={ariaLabelledBy}
          className={`md:hidden flex w-full h-12 items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-base text-left text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed ${borderClass}`}
        >
          <span className={`line-clamp-1 ${value ? "" : "text-gray-400"}`}>
            {value || (loading ? `${loadingLabel}…` : placeholder)}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" aria-hidden="true" />
        </button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[85vh] border-gray-200 bg-white dark:border-white/10 dark:bg-[#0b0f14]">
        <DrawerHeader className="border-b border-gray-200 dark:border-white/10">
          <DrawerTitle className="text-base font-semibold text-gray-900 dark:text-white">
            {title}
          </DrawerTitle>
        </DrawerHeader>

        <div className="border-b border-gray-200 px-4 py-3 dark:border-white/10">
          <input
            role="presentation"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            autoCorrect="off"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            name="search-no-autofill"
            enterKeyHint="search"
            inputMode="search"
            className="w-full rounded-md border border-gray-200 bg-transparent py-2.5 pl-3 pr-3 text-base leading-6 text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#429de6] focus:ring-1 focus:ring-[#429de6]/30 dark:border-white/10 dark:text-white"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          {filteredCities.length > 0 ? (
            filteredCities.map((city) => {
              const isSelected = city === value;
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleSelect(city)}
                  className={`w-full rounded-md px-3 py-3 text-left text-base text-gray-900 transition-colors active:bg-[#429de6]/20 dark:text-white ${
                    isSelected
                      ? "bg-[#429de6]/15 font-medium text-[#429de6] dark:bg-[#429de6]/25 dark:text-[#5db3f0]"
                      : ""
                  }`}
                >
                  {city}
                </button>
              );
            })
          ) : (
            <p className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
              {noResultsLabel}
            </p>
          )}
        </div>

        <DrawerFooter className="border-t border-gray-200 dark:border-white/10">
          <DrawerClose asChild>
            <Button
              type="button"
              className="w-full min-h-[44px] bg-[#429de6] text-white hover:bg-[#3a8acc]"
            >
              {closeLabel}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
