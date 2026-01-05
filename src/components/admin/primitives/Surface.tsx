"use client";

import type { ReactNode } from "react";

import { cn } from "@/components/ui/utils";

type SurfaceProps = {
  children: ReactNode;
  className?: string;
};

export const Surface = ({ children, className }: SurfaceProps) => {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-[#0b0f14]",
        className,
      )}
    >
      {children}
    </div>
  );
};





