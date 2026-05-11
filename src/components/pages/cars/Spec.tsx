import type { ReactNode } from "react";

import type { LucideIcon } from "lucide-react";

// One row in the car detail Specifications card. Tuned for tight surfaces —
// mobile renders these 2-up at ~165px wide, so the value column truncates
// rather than wrapping. Icon tile uses the brand blue so each spec reads at a
// glance against either light or dark surfaces.
export const Spec = ({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
}) => (
  <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
    <div className="p-2 sm:p-2.5 bg-white dark:bg-[#429de6]/10 ring-1 ring-gray-200 dark:ring-white/5 rounded-lg flex-shrink-0">
      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#429de6]" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] sm:text-[11px] uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
        {value}
      </p>
    </div>
  </div>
);
