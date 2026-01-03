import Link from "next/link";

import { defaultLocale } from "@/i18n/config";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-black px-6 py-24 text-gray-900 dark:text-white">
      <div className="mx-auto max-w-xl">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
          404
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">
          This page could not be found
        </h1>
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            href={`/${defaultLocale}`}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#429de6] px-4 text-sm font-medium text-white hover:bg-[#3a8acc]"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}


