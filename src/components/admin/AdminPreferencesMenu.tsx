"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import { LogOut, Moon, SlidersHorizontal, Sun } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ThemeContext";
import type { Locale } from "@/i18n/config";
import { usePathname, useRouter } from "@/i18n/routing";
import { getLocaleOptions } from "@/i18n/localeOptions";
import { logout } from "@/lib/admin/logout";
import { useUser } from "@/contexts/UserContext";

export const AdminPreferencesMenu = () => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = useLocale() as Locale;
  const { theme, setTheme } = useTheme();
  const { clearUser } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const onSelectLocale = ({ nextLocale }: { nextLocale: Locale }) => {
    router.replace(
      // @ts-expect-error -- next-intl validates that only known params are used
      { pathname, params },
      { locale: nextLocale },
    );
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      const result = await logout();
      
      clearUser();
      
      if (result.success) {
        toast.success("Logged out successfully");
      } else {
        toast.warning("Logged out locally");
      }
    } catch (error) {
      console.error("Logout error:", error);
      
      clearUser();
      toast.warning("Logged out locally");
    } finally {
      setIsLoggingOut(false);
      
        window.location.href = "/";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-10 rounded-xl border-gray-200 bg-white p-0 text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-[#0b0f14] dark:text-white dark:hover:bg-white/5"
          aria-label={t("admin.topbar.preferencesAria")}
        >
          <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[260px] rounded-2xl border-gray-200 bg-white p-2 shadow-lg dark:border-white/10 dark:bg-[#0b0f14]"
      >
        <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
          {t("admin.topbar.languageLabel")}
        </DropdownMenuLabel>

        {getLocaleOptions().map((option) => {
          const isActive = option.locale === locale;

          return (
            <DropdownMenuItem
              key={option.locale}
              onSelect={() => onSelectLocale({ nextLocale: option.locale })}
              className="cursor-pointer rounded-xl px-2 py-2 focus:bg-gray-50 dark:focus:bg-white/5"
            >
              <span className="text-base leading-none">{option.flag}</span>
              <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                {option.label}
              </span>
              {isActive ? (
                <span className="ml-auto text-[11px] font-medium text-[#429de6]">
                  {t("admin.topbar.activeLabel")}
                </span>
              ) : null}
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-white/10" />

        <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
          {t("admin.topbar.themeLabel")}
        </DropdownMenuLabel>

        <DropdownMenuItem
          onSelect={() => setTheme({ theme: "light" })}
          className="cursor-pointer rounded-xl px-2 py-2 focus:bg-gray-50 dark:focus:bg-white/5"
        >
          <Sun aria-hidden="true" className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
            {t("admin.topbar.lightMode")}
          </span>
          {theme === "light" ? (
            <span className="ml-auto text-[11px] font-medium text-[#429de6]">
              {t("admin.topbar.activeLabel")}
            </span>
          ) : null}
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => setTheme({ theme: "dark" })}
          className="cursor-pointer rounded-xl px-2 py-2 focus:bg-gray-50 dark:focus:bg-white/5"
        >
          <Moon aria-hidden="true" className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
            {t("admin.topbar.darkMode")}
          </span>
          {theme === "dark" ? (
            <span className="ml-auto text-[11px] font-medium text-[#429de6]">
              {t("admin.topbar.activeLabel")}
            </span>
          ) : null}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-white/10" />

        <DropdownMenuItem
          onSelect={handleLogout}
          disabled={isLoggingOut}
          className="cursor-pointer rounded-xl px-2 py-2 text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-700 dark:focus:text-red-300"
        >
          <LogOut aria-hidden="true" className="h-4 w-4" />
          <span className="ml-2 text-sm font-medium">
            {isLoggingOut ? t("admin.topbar.loggingOut") : t("admin.topbar.logout")}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


