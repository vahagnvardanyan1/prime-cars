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
  highlight: "text-[#429de6] dark:text-[#5db3f0] font-bold text-base",
  blurred: "text-gray-400 dark:text-gray-500 opacity-60 blur-[3px] select-none",
};

export const ResultRow = ({ label, value, variant = "default" }: ResultRowProps) => {
  const wrapperClass =
    variant === "highlight"
      ? "flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-[#429de6]/10 dark:bg-[#429de6]/20 border border-[#429de6]/30"
      : "flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/[0.03]";

  const labelClass =
    variant === "highlight"
      ? "text-sm font-bold text-gray-900 dark:text-white"
      : "text-sm text-gray-700 dark:text-white/80";

  return (
    <div className={wrapperClass}>
      <span className={labelClass}>{label}</span>
      <span className={`text-sm whitespace-nowrap ${VALUE_CLASS[variant]}`}>{value}</span>
    </div>
  );
};
