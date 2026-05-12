"use client";

type InvalidPhotoAlertProps = {
  files: File[];
  title: string;
  dismissLabel: string;
  onDismiss: () => void;
};

export const InvalidPhotoAlert = ({
  files,
  title,
  dismissLabel,
  onDismiss,
}: InvalidPhotoAlertProps) => {
  if (files.length === 0) return null;

  return (
    <div
      role="alert"
      className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 dark:border-red-900/50 dark:bg-red-950/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs font-semibold text-red-700 dark:text-red-300">
            {title}
          </p>
          <ul className="space-y-0.5">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="break-all text-xs text-red-600 dark:text-red-400"
              >
                {file.name}
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel}
          className="flex-shrink-0 rounded p-1 text-red-600 transition-colors hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/40"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
