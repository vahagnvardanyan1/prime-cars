/**
 * Single list row skeleton for loading states
 * Matches the visual structure of CarListItem component
 */
export const ListItemSkeleton = () => (
  <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl p-4 animate-pulse">
    <div className="flex gap-6">
      <div className="flex-shrink-0 w-48 h-32 bg-gray-200 dark:bg-gray-800 rounded-lg" />
      <div className="flex-1 space-y-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
        <div className="flex gap-4">
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-20" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-20" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-20" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-24" />
          <div className="h-9 bg-gray-200 dark:bg-gray-800 rounded w-28" />
        </div>
      </div>
    </div>
  </div>
);
