"use client";

import type { ReactNode } from "react";

import { cn } from "@/components/ui/utils";

type Tone = "primary" | "success" | "warning" | "neutral";

type TonePillProps = {
  tone: Tone;
  children: ReactNode;
};

const getToneClassName = ({ tone }: { tone: Tone }) => {
  switch (tone) {
    case "primary":
      return "bg-[#429de6]/10 text-[#429de6] ring-[#429de6]/20";
    case "success":
      return "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20";
    case "warning":
      return "bg-amber-500/10 text-amber-400 ring-amber-500/20";
    case "neutral":
    default:
      return "bg-gray-500/10 text-gray-600 ring-gray-500/20 dark:text-gray-300";
  }
};

export const TonePill = ({ tone, children }: TonePillProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        getToneClassName({ tone }),
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
};


