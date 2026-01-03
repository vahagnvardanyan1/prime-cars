"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { Menu, Moon, Sun, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTheme } from "@/components/ThemeContext";
import { Link, usePathname } from "@/i18n/routing";
import { siteNavItems } from "@/lib/site-nav";

const LOGO_LIGHT =
  "https://cdn-editing-temp.picsart.com/editing-temp-landings/63307d6e-bc4c-4b91-88ae-6004d88bc060.png";
const LOGO_DARK =
  "https://cdn-editing-temp.picsart.com/editing-temp-landings/bbe115cb-86cb-462a-9a9e-f7328eb356a4.png";

type HeaderProps = {
  onLoginClick: () => void;
};

export const Header = ({ onLoginClick }: HeaderProps) => {
  const t = useTranslations();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const isActiveHref = useMemo(() => {
    return (href: string) => {
      if (href === "/") return pathname === "/";
      return pathname.startsWith(href);
    };
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-white/10"
            : "bg-white/50 dark:bg-black/50 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src={LOGO_LIGHT}
                alt={t("header.logoAlt")}
                className="h-20 w-auto block dark:hidden"
                width={240}
                height={80}
                priority
              />
              <Image
                src={LOGO_DARK}
                alt={t("header.logoAlt")}
                className="h-20 w-auto hidden dark:block"
                width={240}
                height={80}
                priority
              />
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {siteNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg transition-all relative ${
                    isActiveHref(item.href)
                      ? "text-black dark:text-white"
                      : "text-gray-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  {t(`nav.${item.key}`)}
                  {isActiveHref(item.href) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#429de6] rounded-full" />
                  )}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher variant="outline" />
              <button
                onClick={toggleTheme}
                className="w-10 h-10 flex items-center justify-center text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-all"
                aria-label={t("header.toggleThemeAria")}
                type="button"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={onLoginClick}
                className="px-6 py-2.5 bg-transparent border border-black/20 dark:border-white/20 text-black dark:text-white rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-all"
                type="button"
              >
                {t("header.signUpNow")}
              </button>
            </div>

            <div className="md:hidden flex items-center">
              <LanguageSwitcher />
              <button
                onClick={toggleTheme}
                className="w-10 h-10 flex items-center justify-center text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-all"
                aria-label={t("header.toggleThemeAria")}
                type="button"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="w-10 h-10 flex items-center justify-center text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-all"
                aria-label={t("header.toggleMenuAria")}
                type="button"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <button
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          type="button"
          aria-label={t("header.closeMenuAria")}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-[#111111] border-l border-white/10 z-[210] md:hidden transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-white/10">
          <Link href="/" className="block">
            <Image
              src={LOGO_LIGHT}
              alt={t("header.logoAlt")}
              className="h-8 w-auto block dark:hidden"
              width={120}
              height={32}
            />
            <Image
              src={LOGO_DARK}
              alt={t("header.logoAlt")}
              className="h-8 w-auto hidden dark:block"
              width={120}
              height={32}
            />
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-lg transition-all"
            aria-label={t("header.closeMenuAria")}
            type="button"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="px-6 py-6 flex flex-col gap-2">
          {siteNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-3 rounded-lg transition-all text-left ${
                isActiveHref(item.href)
                  ? "text-white bg-white/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}

          <button
            onClick={() => {
              onLoginClick();
              setIsMobileMenuOpen(false);
            }}
            className="mt-4 px-4 py-3 bg-transparent border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all text-left"
            type="button"
          >
            {t("header.signUpNow")}
          </button>
        </nav>
      </div>
    </>
  );
};
