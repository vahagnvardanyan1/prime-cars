import type { ReactNode } from "react";

interface ErrorMessageProps {
  message: string;
  icon?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * Reusable error message component for displaying errors to users
 * Provides consistent styling and optional retry functionality
 */
export const ErrorMessage = ({
  message,
  icon,
  onRetry,
  retryLabel = "Try again",
}: ErrorMessageProps) => (
  <div
    role="alert"
    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
  >
    <div className="flex items-start gap-3">
      {icon && (
        <div className="flex-shrink-0 text-red-500 dark:text-red-400">
          {icon}
        </div>
      )}
      <div className="flex-1">
        <p className="text-red-600 dark:text-red-400">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline underline-offset-2 transition-colors"
          >
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  </div>
);
