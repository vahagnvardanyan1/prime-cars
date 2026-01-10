"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Calendar } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";

type DateRangePickerProps = {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
  onClear?: () => void;
  placeholder?: string;
};

export const DateRangePicker = ({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onClear,
  placeholder = "Select date range",
}: DateRangePickerProps) => {
  const t = useTranslations("admin.filters.dateRangePicker");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Format display text with useMemo to ensure it updates when props change
  const displayText = useMemo(() => {
    if (!dateFrom && !dateTo) {
      return "";
    }
    
    const formatDate = (dateStr: string) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (dateFrom && dateTo) {
      return `${formatDate(dateFrom)} - ${formatDate(dateTo)}`;
    } else if (dateFrom) {
      return `${t("from")} ${formatDate(dateFrom)}`;
    } else if (dateTo) {
      return `${t("to")} ${formatDate(dateTo)}`;
    }
    return "";
  }, [dateFrom, dateTo, t]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onClear) {
      onClear();
    } else {
      onDateFromChange("");
      onDateToChange("");
    }
    
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full min-w-[200px]">
      {/* Trigger Input */}
      <div
        className="relative cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <Input
          type="text"
          value={displayText}
          placeholder={placeholder}
          readOnly
          className="pl-10 h-10 bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10 focus-visible:ring-[#429de6] cursor-pointer"
        />
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-[9999] bg-white dark:bg-[#0b0f14] border border-gray-200 dark:border-white/10 rounded-lg shadow-2xl p-4 space-y-4">
          {/* From Date */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              {t("from")}
            </label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="w-full h-9 bg-white dark:bg-[#161b22] border-gray-300 dark:border-white/10 focus-visible:ring-[#429de6]"
            />
          </div>

          {/* To Date */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              {t("to")}
            </label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="w-full h-9 bg-white dark:bg-[#161b22] border-gray-300 dark:border-white/10 focus-visible:ring-[#429de6]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md transition-colors"
            >
              {t("clear")}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-3 py-2 text-xs font-medium text-white bg-[#429de6] hover:bg-[#3a8acc] rounded-md transition-colors"
            >
              {t("apply")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
