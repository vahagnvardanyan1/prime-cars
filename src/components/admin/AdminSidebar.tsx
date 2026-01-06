"use client";

import { AdminSidebarContent } from "@/components/admin/AdminSidebarContent";

type AdminSidebarProps = {
  isAdmin: boolean;
};

export const AdminSidebar = ({ isAdmin }: AdminSidebarProps) => {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-full w-[280px] border-r border-gray-200 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b0f14]/85 md:block">
      <AdminSidebarContent isAdmin={isAdmin} />
    </aside>
  );
};


