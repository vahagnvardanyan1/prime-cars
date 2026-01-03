"use client";

import type { AdminNavKey } from "@/hooks/admin/useAdminDashboardState";
import { AdminSidebarContent } from "@/components/admin/AdminSidebarContent";

type AdminSidebarProps = {
  activeNav: AdminNavKey;
  onNavChange: ({ next }: { next: AdminNavKey }) => void;
  onAddCar: () => void;
  onCreateUser: () => void;
};

export const AdminSidebar = ({
  activeNav,
  onNavChange,
  onAddCar,
  onCreateUser,
}: AdminSidebarProps) => {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-full w-[280px] border-r border-gray-200 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b0f14]/85 md:block">
      <AdminSidebarContent
        activeNav={activeNav}
        onNavChange={onNavChange}
        onAddCar={onAddCar}
        onCreateUser={onCreateUser}
      />
    </aside>
  );
};


