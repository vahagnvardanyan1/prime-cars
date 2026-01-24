"use client";

import { usePathname } from "next/navigation";

import { Calculator, CarFront, Settings, Users, Home, Bell, Car } from "lucide-react";
import { useTranslations } from "next-intl";

import type { AdminNavKey } from "@/hooks/admin/useAdminDashboardState";
import { cn } from "@/components/ui/utils";
import { useUser } from "@/contexts/UserContext";
import { Link } from "@/i18n/routing";

type AdminSidebarContentProps = {
  onRequestClose?: () => void;
  isAdmin: boolean;
};

type NavItem = {
  key: AdminNavKey;
  icon: typeof CarFront;
  href: string;
};

const NAV_ITEMS: NavItem[] = [
  { key: "cars", icon: CarFront, href: "/admin" },
  { key: "availableCars", icon: Car, href: "/admin/available-cars" },
  { key: "users", icon: Users, href: "/admin/users" },
  { key: "notifications", icon: Bell, href: "/admin/notifications" },
  { key: "calculator", icon: Calculator, href: "/admin/calculator" },
  { key: "settings", icon: Settings, href: "/admin/settings" },
];

export const AdminSidebarContent = ({
  onRequestClose,
  isAdmin,
}: AdminSidebarContentProps) => {
  const t = useTranslations();
  const { user } = useUser();
  const pathname = usePathname();

  // Determine active nav from pathname
  const getActiveNav = (): AdminNavKey => {
    if (pathname.includes("/admin/available-cars")) return "availableCars";
    if (pathname.includes("/admin/users")) return "users";
    if (pathname.includes("/admin/notifications")) return "notifications";
    if (pathname.includes("/admin/calculator")) return "calculator";
    if (pathname.includes("/admin/settings")) return "settings";
    return "cars";
  };

  const activeNav = getActiveNav();

  const visibleNavItems = NAV_ITEMS.filter(item => {
    // Only show "users" and "availableCars" if user is admin
    if (item.key === 'users' || item.key === 'availableCars') {
      return isAdmin;
    }
    return true;
  });

  const companyName = user?.companyName;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="min-w-0 flex-1">
          <div className="text-lg font-semibold tracking-[-0.01em] text-gray-900 dark:text-white">
            {companyName}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t("admin.sidebar.consoleLabel")}
          </div>
        </div>
        <Link
          href="/"
          className="hidden md:flex items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-200 group shrink-0"
          aria-label={t("admin.sidebar.goToHome")}
        >
          <Home aria-hidden="true" className="h-4 w-4 text-gray-700 dark:text-gray-300 group-hover:text-[#429de6] dark:group-hover:text-[#429de6] transition-colors" />
        </Link>
      </div>

      <nav className="mt-6 px-3">
        <div className="px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
          {t("admin.sidebar.navigation")}
        </div>
        <div className="mt-2 grid gap-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === activeNav;

            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => onRequestClose?.()}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#429de6]/40",
                  isActive
                    ? "bg-[#429de6]/10 text-gray-900 dark:text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white",
                )}
              >
                <span
                  aria-hidden="true"
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
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};




