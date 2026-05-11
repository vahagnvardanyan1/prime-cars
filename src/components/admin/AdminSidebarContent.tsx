"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import { Calculator, CarFront, Settings, Users, Bell, Car, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { logout } from "@/lib/admin/logout";
import { useUser } from "@/contexts/UserContext";

import { cn } from "@/components/ui/utils";
import { Link } from "@/i18n/routing";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type AdminNavKey = "cars" | "availableCars" | "users" | "settings" | "calculator" | "notifications";

type AdminSidebarContentProps = {
  onRequestClose?: () => void;
  isAdmin: boolean;
  isCollapsed?: boolean;
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
  isCollapsed = false,
}: AdminSidebarContentProps) => {
  const t = useTranslations();
  const { user, clearUser } = useUser();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      clearUser();
      toast.success(t("auth.toasts.loggedOutSuccess"));
    } catch {
      clearUser();
      toast.warning(t("auth.toasts.loggedOutLocally"));
    } finally {
      setIsLoggingOut(false);
      window.location.href = "/";
    }
  };

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
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header — hidden when collapsed */}
      {!isCollapsed && (
        <div className="flex items-center gap-3 px-6 py-5">
          <div className="min-w-0 flex-1">
            <div className="text-lg font-semibold tracking-[-0.01em] text-gray-900 dark:text-white truncate">
              {companyName}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {t("admin.sidebar.consoleLabel")}
            </div>
          </div>
        </div>
      )}

      {/* Collapsed: top spacing */}
      {isCollapsed && <div className="py-4" />}

      <nav className={cn("px-3", isCollapsed ? "mt-2" : "mt-6")}>
        {!isCollapsed && (
          <div className="px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
            {t("admin.sidebar.navigation")}
          </div>
        )}
        <div className="mt-2 grid gap-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === activeNav;

            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => onRequestClose?.()}
                title={isCollapsed ? t(`admin.sidebar.nav.${item.key}`) : undefined}
                className={cn(
                  "group flex items-center rounded-xl transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#429de6]/40",
                  isCollapsed ? "justify-center px-0 py-1.5" : "gap-3 px-3 py-2.5 text-sm",
                  isActive
                    ? "bg-[#429de6]/10 text-gray-900 dark:text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg ring-1 ring-inset transition-colors flex-shrink-0",
                    isActive
                      ? "bg-white text-[#429de6] ring-gray-200 dark:bg-[#0b0f14] dark:ring-white/10"
                      : "bg-white text-gray-500 ring-gray-200 group-hover:text-gray-700 dark:bg-[#0b0f14] dark:text-gray-400 dark:ring-white/10",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>

                {!isCollapsed && (
                  <>
                    <span className="min-w-0 truncate">{t(`admin.sidebar.nav.${item.key}`)}</span>
                    <span
                      className={cn(
                        "ml-auto h-6 w-1 rounded-full transition-colors",
                        isActive ? "bg-[#429de6]" : "bg-transparent",
                      )}
                    />
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout button — pinned to bottom */}
      <div className={cn("mt-auto px-3 pb-4", isCollapsed ? "flex justify-center" : "")}>
        <button
          onClick={() => setIsLogoutDialogOpen(true)}
          disabled={isLoggingOut}
          title={isCollapsed ? t("admin.preferences.logout") : undefined}
          className={cn(
            "group flex items-center rounded-xl transition-colors outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 disabled:opacity-50",
            isCollapsed ? "justify-center px-0 py-1.5 w-full" : "gap-3 px-3 py-2.5 text-sm w-full",
            "text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30",
          )}
        >
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ring-1 ring-inset bg-white ring-gray-200 dark:bg-[#0b0f14] dark:ring-white/10 text-red-500 dark:text-red-400">
            <LogOut className="h-4 w-4" />
          </span>
          {!isCollapsed && (
            <span className="min-w-0 truncate">
              {isLoggingOut ? "..." : t("admin.preferences.logout")}
            </span>
          )}
        </button>
      </div>

      {/* Logout confirmation dialog */}
      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">
              {t("admin.logout.title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              {t("admin.logout.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isLoggingOut}
              className="border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-[#161b22] dark:text-white dark:hover:bg-white/5"
            >
              {t("admin.logout.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              {isLoggingOut ? "..." : t("admin.logout.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};




