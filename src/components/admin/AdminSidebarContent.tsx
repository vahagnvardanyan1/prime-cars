"use client";

import Image from "next/image";

import { CarFront, PlusCircle, Settings, Users, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";

import type { AdminNavKey } from "@/hooks/admin/useAdminDashboardState";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { useUser } from "@/contexts/UserContext";

type AdminSidebarContentProps = {
  activeNav: AdminNavKey;
  onNavChange: ({ next }: { next: AdminNavKey }) => void;
  onAddCar: () => void;
  onCreateUser: () => void;
  onRequestClose?: () => void;
  isAdmin: boolean;
};

const LOGO_URL =
  "https://cdn-cms-uploads.picsart.com/cms-uploads/044b4c85-6f4c-44cc-a53b-bc62b40af7a3.jpg";

type NavItem = {
  key: AdminNavKey;
  icon: typeof CarFront;
};

const NAV_ITEMS: NavItem[] = [
  { key: "cars", icon: CarFront },
  { key: "users", icon: Users },
  { key: "settings", icon: Settings },
];

export const AdminSidebarContent = ({
  activeNav,
  onNavChange,
  onAddCar,
  onCreateUser,
  onRequestClose,
  isAdmin,
}: AdminSidebarContentProps) => {
  const t = useTranslations();
  const { user } = useUser();

  const visibleNavItems = NAV_ITEMS.filter(item => {
    // Only show "users" if user is admin
    if (item.key === 'users') {
      return isAdmin;
    }
    return true;
  });

  const companyName = user?.companyName

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="min-w-0">
          <div className="text-sm font-semibold tracking-[-0.01em] text-gray-900 dark:text-white">
            {companyName}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t("admin.sidebar.consoleLabel")}
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="px-4">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-2 dark:border-white/10 dark:bg-white/5">
            <div className="grid gap-2">
              <Button
                type="button"
                className="h-10 justify-start rounded-xl bg-[#429de6] text-white hover:bg-[#3a8acc]"
                onClick={() => {
                  onAddCar();
                  onRequestClose?.();
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                {t("admin.sidebar.addCar")}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 justify-start rounded-xl border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-[#0b0f14] dark:text-white dark:hover:bg-white/5"
                onClick={() => {
                  onCreateUser();
                  onRequestClose?.();
                }}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {t("admin.sidebar.createUser")}
              </Button>
            </div>
          </div>
        </div>
      )}

      <nav className="mt-6 px-3">
        <div className="px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
          {t("admin.sidebar.navigation")}
        </div>
        <div className="mt-2 grid gap-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === activeNav;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onNavChange({ next: item.key });
                  onRequestClose?.();
                }}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#429de6]/40",
                  isActive
                    ? "bg-[#429de6]/10 text-gray-900 dark:text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg ring-1 ring-inset transition-colors",
                    isActive
                      ? "bg-white text-[#429de6] ring-gray-200 dark:bg-[#0b0f14] dark:ring-white/10"
                      : "bg-white text-gray-500 ring-gray-200 group-hover:text-gray-700 dark:bg-[#0b0f14] dark:text-gray-400 dark:ring-white/10",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 truncate">{t(`admin.sidebar.nav.${item.key}`)}</span>

                <span
                  className={cn(
                    "ml-auto h-6 w-1 rounded-full transition-colors",
                    isActive ? "bg-[#429de6]" : "bg-transparent",
                  )}
                />
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};




