"use client";

import { X } from "lucide-react";
import type { IncomeTaxBracket } from "@/lib/admin/types";

type IncomeTaxBracketRowProps = {
  bracket: IncomeTaxBracket;
  index: number;
  onChange: (index: number, updated: IncomeTaxBracket) => void;
  onRemove: (index: number) => void;
};

export const IncomeTaxBracketRow = ({
  bracket,
  index,
  onChange,
  onRemove,
}: IncomeTaxBracketRowProps) => {
  const handleFieldChange = (field: keyof IncomeTaxBracket, value: string) => {
    if (field === "isPercent") {
      onChange(index, { ...bracket, isPercent: value === "true" });
      return;
    }
    if (field === "max" && value === "") {
      onChange(index, { ...bracket, max: null });
      return;
    }
    const numValue = Number(value);
    if (value !== "" && value !== "-" && !Number.isFinite(numValue)) return;
    onChange(index, { ...bracket, [field]: value === "" ? 0 : numValue });
  };

  return (
    <tr>
      <td className="py-0.5 pr-0.5">
        <input
          type="number"
          value={bracket.min}
          onChange={(e) => handleFieldChange("min", e.target.value)}
          className="w-full h-8 text-xs text-center rounded border border-gray-200 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-[#429de6] px-1"
        />
      </td>
      <td className="py-0.5 px-0.5">
        <input
          type="number"
          value={bracket.max ?? ""}
          onChange={(e) => handleFieldChange("max", e.target.value)}
          placeholder="∞"
          className="w-full h-8 text-xs text-center rounded border border-gray-200 dark:border-white/10 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#429de6] px-1"
        />
      </td>
      <td className="py-0.5 px-0.5">
        <input
          type="number"
          value={bracket.tax}
          onChange={(e) => handleFieldChange("tax", e.target.value)}
          className="w-full h-8 text-xs text-center rounded border border-gray-200 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-[#429de6] px-1"
        />
      </td>
      <td className="py-0.5 px-0.5 w-10">
        <button
          type="button"
          onClick={() => onChange(index, { ...bracket, isPercent: !bracket.isPercent })}
          className={`h-8 w-full text-xs font-medium rounded border transition-colors ${
            bracket.isPercent
              ? "bg-[#429de6]/10 border-[#429de6]/30 text-[#429de6]"
              : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400"
          }`}
        >
          {bracket.isPercent ? "%" : "$"}
        </button>
      </td>
      <td className="py-0.5 pl-0.5 w-6">
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="h-6 w-6 flex items-center justify-center rounded text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </td>
    </tr>
  );
};
