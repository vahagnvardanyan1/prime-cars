"use client";

import { Check, X } from "lucide-react";

type PaymentStatusProps = {
  paid: boolean;
  label: string;
  size?: "sm" | "md";
};

export const PaymentStatus = ({ paid, label, size = "md" }: PaymentStatusProps) => {
  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
  };

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 rounded-lg font-medium transition-all
        ${sizeClasses[size]}
        ${
          paid
            ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/50"
            : "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50"
        }
      `}
    >
      {paid ? (
        <Check className={iconSizes[size]} />
      ) : (
        <X className={iconSizes[size]} />
      )}
      <span>{label}</span>
    </div>
  );
};
