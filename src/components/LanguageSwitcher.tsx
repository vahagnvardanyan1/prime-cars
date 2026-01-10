"use client";

import { useMemo } from "react";

import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/components/ui/utils";
import type { Locale } from "@/i18n/config";
import { usePathname, useRouter } from "@/i18n/routing";
import type { LocaleOption } from "@/i18n/localeOptions";
import { getLocaleOptions } from "@/i18n/localeOptions";

type LanguageSwitcherProps = {
  className?: string;
  align?: "start" | "end";
  variant?: "ghost" | "outline";
};

export const LanguageSwitcher = ({
  className,
  align = "end",
  variant = "ghost",
}: LanguageSwitcherProps) => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = useLocale() as Locale;

  const current = useMemo(() => {
    return getLocaleOptions().find((o) => o.locale === locale) ?? {
      locale,
      label: String(locale),
      flag: "🌐",
    };
  }, [locale]);

  const onSelect = ({ nextLocale }: { nextLocale: Locale }) => {
    router.replace(
      // @ts-expect-error -- next-intl validates that only known params are used
      { pathname, params },
      { locale: nextLocale },
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant={variant}
          className={cn(
            "h-10 gap-2 rounded-xl text-gray-900 hover:bg-black/10 dark:text-white dark:hover:bg-white/10",
            variant === "outline"
              ? "border-gray-200 bg-white dark:border-white/10 dark:bg-[#0b0f14]"
              : "",
            className,
          )}
          aria-label={t("header.changeLanguageAria")}
        >
          <span className="text-lg leading-none">{current.flag}</span>
          <Globe className="h-5 w-5 opacity-70" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        className="min-w-[220px] rounded-xl border-gray-200 bg-white p-1 shadow-lg dark:border-white/10 dark:bg-[#0b0f14]"
      >
        {getLocaleOptions().map((option: LocaleOption) => {
          const isActive = option.locale === locale;

          return (
            <DropdownMenuItem
              key={option.locale}
              onSelect={() => onSelect({ nextLocale: option.locale })}
              className={cn(
                "cursor-pointer rounded-lg px-2.5 py-2 focus:bg-gray-50 dark:focus:bg-white/5",
                isActive ? "bg-[#429de6]/10" : "",
              )}
            >
              <span className="text-base leading-none">{option.flag}</span>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {option.label}
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


