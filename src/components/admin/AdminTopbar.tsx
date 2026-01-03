"use client";

import type { ReactNode } from "react";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

type AdminTopbarProps = {
  left?: ReactNode;
  right?: ReactNode;
};

export const AdminTopbar = ({ left, right }: AdminTopbarProps) => {
  return (
    <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-[#0a0a0a]/70">
      <div className="mx-auto max-w-[1240px] px-8 py-4">
        <div className="flex items-center justify-between gap-6">
          <div className="min-w-0">{left}</div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search (visual only)"
                  className="h-10 w-[320px] rounded-xl border-gray-200 bg-white pl-10 text-gray-900 shadow-none focus-visible:ring-[#429de6]/30 dark:border-white/10 dark:bg-[#0b0f14] dark:text-white"
                />
              </div>
            </div>

            {right ? <div className="shrink-0">{right}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
};


