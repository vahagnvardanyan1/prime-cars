"use client";

type ResultRowVariant = "default" | "muted" | "highlight" | "blurred";

type ResultRowProps = {
  label: string;
  value: string;
  variant?: ResultRowVariant;
};

const VALUE_CLASS: Record<ResultRowVariant, string> = {
  default: "text-[#429de6] dark:text-[#5db3f0] font-semibold",
  muted: "text-gray-400 dark:text-gray-600",
  highlight: "text-[#429de6] dark:text-[#5db3f0] font-bold",
  blurred: "text-gray-400 dark:text-gray-500 opacity-60 blur-[3px] select-none",
};

export const ResultRow = ({ label, value, variant = "default" }: ResultRowProps) => {
  const wrapperClass =
    variant === "highlight"
      ? "flex items-center justify-between gap-3 px-4 py-2.5 bg-[#429de6]/10 dark:bg-[#429de6]/20 border-t border-b border-[#429de6]/30"
      : "flex items-center justify-between gap-3 px-4 py-2";

  const labelClass =
    variant === "highlight"
      ? "text-lg font-bold text-gray-900 dark:text-white"
      : "text-base text-gray-800 dark:text-white/85";

  const valueSize = variant === "highlight" ? "text-lg" : "text-base";

  return (
    <div className={wrapperClass}>
      <span className={labelClass}>{label}</span>
      <span className={`${valueSize} whitespace-nowrap ${VALUE_CLASS[variant]}`}>{value}</span>
    </div>
  );
};
