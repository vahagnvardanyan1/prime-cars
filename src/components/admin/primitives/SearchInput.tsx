"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/components/ui/utils";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  "aria-label"?: string;
};

export const SearchInput = ({
  value,
  onChange,
  placeholder,
  className,
  containerClassName,
  "aria-label": ariaLabel,
}: SearchInputProps) => {
  return (
    <div className={cn("relative", containerClassName)}>
      <Search
        aria-hidden="true"
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className={cn(
          "pl-10 h-10 bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10 focus-visible:ring-[#429de6]",
          className,
        )}
      />
    </div>
  );
};
