/**
 * Single card skeleton for loading states
 * Matches the visual structure of CarCard component
 */
export const CardSkeleton = () => (
  <div className="bg-white dark:bg-[#111111] rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 animate-pulse">
    <div className="aspect-[16/10] bg-gray-200 dark:bg-gray-800" />
    <div className="p-6 space-y-3">
      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-16" />
      <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
      <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex justify-between">
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-20" />
        <div className="h-9 bg-gray-200 dark:bg-gray-800 rounded w-24" />
      </div>
    </div>
  </div>
);
