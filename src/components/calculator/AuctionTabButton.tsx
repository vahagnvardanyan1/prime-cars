import { type ReactNode } from "react";

import { cn } from "@/components/ui/utils";

type AuctionTabButtonProps = {
  isActive: boolean;
  onClick: () => void;
  children: ReactNode;
};

// One auction-source tab in the calculator's top strip (Copart/IAA/Manheim/Other).
// Active state lifts to white with a blue underline; inactive recedes to gray with
// a hover step. Dark mode keeps the strip black and uses opacity to dim inactive
// tabs (logos are designed for dark backgrounds, dimming reads as "not selected").
export const AuctionTabButton = ({ isActive, onClick, children }: AuctionTabButtonProps) => (
  <button
    type="button"
    role="tab"
    aria-selected={isActive}
    aria-controls="calculator-form"
    onClick={onClick}
    className={cn(
      "flex-1 min-w-[140px] py-6 px-4 sm:px-8 transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#429de6] focus-visible:ring-inset",
      isActive
        ? "bg-white dark:bg-black border-b-2 border-[#429de6]"
        : "bg-gray-100 hover:bg-gray-200 dark:bg-black dark:opacity-60 dark:hover:opacity-80",
    )}
  >
    {children}
  </button>
);
