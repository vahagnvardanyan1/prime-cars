import { Calculator } from 'lucide-react';
import { ImportCalculator } from '../ImportCalculator';

export function CalculatorPage() {
  return (
    <div className="pt-20 min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Header */}
      <div className="bg-gray-100 dark:bg-[#111111] border-b border-gray-300 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#429de6] rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-gray-900 dark:text-white">Import Cost Calculator</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
            Get an accurate estimate of all costs involved in importing your vehicle. Our calculator includes shipping, customs duties, inspection fees, and more.
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
        <ImportCalculator />
      </div>
    </div>
  );
}