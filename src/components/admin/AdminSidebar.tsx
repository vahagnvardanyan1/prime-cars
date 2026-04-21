"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { AdminSidebarContent } from "@/components/admin/AdminSidebarContent";

type AdminSidebarProps = {
  isAdmin: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
};

export const AdminSidebar = ({ isAdmin, isCollapsed, onToggle }: AdminSidebarProps) => {
  return (
    <aside
      className={`fixed left-0 top-0 z-40 hidden h-full border-r border-gray-200 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b0f14]/85 md:block transition-[width] duration-300 overflow-visible ${isCollapsed ? "w-[72px]" : "w-[280px]"}`}
    >
      <AdminSidebarContent isAdmin={isAdmin} isCollapsed={isCollapsed} />

      {/* Toggle button — centered on the right edge */}
      <button
        onClick={onToggle}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-[#0b0f14] border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-[#429de6] dark:hover:text-[#429de6] shadow-sm transition-colors"
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
};


