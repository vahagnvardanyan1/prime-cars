"use client";

import Image from "next/image";

import {
  CarFront,
  PlusCircle,
  Settings,
  Users,
  UserPlus,
} from "lucide-react";

import type { AdminNavKey } from "@/hooks/admin/useAdminDashboardState";
import { cn } from "@/components/ui/utils";
import { Button } from "@/components/ui/button";

type AdminSidebarProps = {
  activeNav: AdminNavKey;
  onNavChange: ({ next }: { next: AdminNavKey }) => void;
  onAddCar: () => void;
  onCreateUser: () => void;
};

const LOGO_URL =
  "https://cdn-cms-uploads.picsart.com/cms-uploads/044b4c85-6f4c-44cc-a53b-bc62b40af7a3.jpg";

type NavItem = {
  key: AdminNavKey;
  label: string;
  icon: typeof CarFront;
};

const NAV_ITEMS: NavItem[] = [
  { key: "cars", label: "Cars", icon: CarFront },
  { key: "users", label: "Users", icon: Users },
  { key: "settings", label: "Settings", icon: Settings },
];

export const AdminSidebar = ({
  activeNav,
  onNavChange,
  onAddCar,
  onCreateUser,
}: AdminSidebarProps) => {
  return (
    <aside className="fixed left-0 top-0 z-40 h-full w-[280px] border-r border-gray-200 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b0f14]/85">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 px-6 py-5">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl ring-1 ring-gray-200 dark:ring-white/10">
            <Image
              src={LOGO_URL}
              alt="Prime Cars"
              fill
              className="object-cover"
              sizes="40px"
              priority
            />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold tracking-[-0.01em] text-gray-900 dark:text-white">
              Prime Cars
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Admin Console
            </div>
          </div>
        </div>

        <div className="px-4">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-2 dark:border-white/10 dark:bg-white/5">
            <div className="grid gap-2">
              <Button
                type="button"
                className="h-10 justify-start rounded-xl bg-[#429de6] text-white hover:bg-[#3a8acc]"
                onClick={onAddCar}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Car
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 justify-start rounded-xl border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-[#0b0f14] dark:text-white dark:hover:bg-white/5"
                onClick={onCreateUser}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Create User
              </Button>
            </div>
          </div>
        </div>

        <nav className="mt-6 px-3">
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400 px-3">
            Navigation
          </div>
          <div className="mt-2 grid gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.key === activeNav;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onNavChange({ next: item.key })}
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
                  <span className="min-w-0 truncate">{item.label}</span>

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

        <div className="mt-auto px-6 py-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 text-xs text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
            <div className="font-medium text-gray-900 dark:text-white">
              Internal Admin
            </div>
            <div className="mt-1 leading-relaxed">
              Frontend-only prototype. All actions are local to the browser.
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};


