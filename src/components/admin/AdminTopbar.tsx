"use client";

import type { ReactNode } from "react";

type AdminTopbarProps = {
  left?: ReactNode;
  right?: ReactNode;
};

export const AdminTopbar = ({ left, right }: AdminTopbarProps) => {
  return (
    <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-[#0a0a0a]/70">
      <div className="px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6">
          <div className="min-w-0">{left}</div>
          <div className="flex items-center gap-4">
            {right ? <div className="shrink-0">{right}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
};


