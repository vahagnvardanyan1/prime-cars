import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Reusable empty state component for displaying when no data is available
 * Provides consistent styling across the application
 */
export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
    {icon && (
      <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4 text-gray-400 dark:text-gray-500">
        {icon}
      </div>
    )}
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      {title}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-md">
      {description}
    </p>
    {action && (
      <button
        onClick={action.onClick}
        className="mt-6 px-6 py-2.5 bg-[#429de6] hover:bg-[#3a8acc] text-white font-medium rounded-lg transition-all hover:shadow-lg"
      >
        {action.label}
      </button>
    )}
  </div>
);
