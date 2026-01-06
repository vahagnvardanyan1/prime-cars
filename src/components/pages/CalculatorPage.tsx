import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";

import { ImportCalculator } from "@/components/ImportCalculator";

export const CalculatorPage = () => {
  const t = useTranslations();

  return (
    <div className="pt-20 min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Header */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
        <ImportCalculator />
      </div>
    </div>
  );
};
