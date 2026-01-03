"use client";

import type { ReactNode } from "react";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
};

export const SectionHeader = ({ title, subtitle, right }: SectionHeaderProps) => {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-[-0.01em] text-gray-900 dark:text-white">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
};


