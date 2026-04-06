"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { FiMenu, FiMoon, FiSun, FiX } from "react-icons/fi";
import { useTranslations } from "next-intl";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Container } from "@/components/layouts";
import { useTheme } from "@/components/ThemeContext";
import { Link, usePathname } from "@/i18n/routing";
import { siteNavItems } from "@/lib/site-nav";

const HEADER_HEIGHT = 80;

type HeaderProps = {
  onLoginClick: () => void;
};

export const Header = ({ onLoginClick }: HeaderProps) => {
  const t = useTranslations();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const { theme, toggleTheme } = useTheme();

  const isHomePage = pathname === "/" || pathname === "";

  const scrollToSection = useCallback((hash: string) => {
    const id = hash.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  const handleAnchorClick = useCallback(
    (e: React.MouseEvent, href: string) => {
      if (href.startsWith("#") && isHomePage) {
        e.preventDefault();
        scrollToSection(href);
        setIsMobileMenuOpen(false);
      }
    },
    [isHomePage, scrollToSection]
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);

      if (!isHomePage) return;

      const triggerPoint = window.innerHeight / 3;
      const anchorItems = siteNavItems.filter((i) => i.href.startsWith("#"));
      let found = "";

      for (let i = anchorItems.length - 1; i >= 0; i--) {
        const id = anchorItems[i].href.replace("#", "");
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= triggerPoint) {
            found = anchorItems[i].href;
            break;
          }
        }
      }
      setActiveHash(found);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

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

  const isActiveNav = (href: string) => {
    if (href.startsWith("#")) {
      return isHomePage && activeHash === href;
    }
    // Don't highlight "Home" when an anchor section is active
    if (href === "/" && isHomePage && activeHash) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const navLinkClasses = (href: string) =>
    `group px-3 py-2 text-sm transition-colors relative ${
      isActiveNav(href)
        ? "text-black dark:text-white"
        : "text-gray-400 hover:text-black dark:hover:text-white"
    }`;

  const navUnderline = (href: string) =>
    `absolute bottom-0 left-3 right-3 h-0.5 bg-[#429de6] origin-left transition-transform duration-300 ease-out ${
      isActiveNav(href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
    }`;

  const renderNavItem = (item: (typeof siteNavItems)[number]) => {
    if (item.href.startsWith("#")) {
      return (
        <a
          key={item.href}
          href={item.href}
          onClick={(e) => handleAnchorClick(e, item.href)}
          className={navLinkClasses(item.href)}
        >
          {t(`nav.${item.key}`)}
          <span className={navUnderline(item.href)} />
        </a>
      );
    }
    return (
      <Link
        key={item.href}
        href={item.href}
        className={navLinkClasses(item.href)}
      >
        {t(`nav.${item.key}`)}
        <span className={navUnderline(item.href)} />
      </Link>
    );
  };

  const renderMobileNavItem = (item: (typeof siteNavItems)[number]) => {
    const classes = `px-4 py-3 rounded-lg transition-all text-left ${
      isActiveNav(item.href)
        ? "text-gray-900 dark:text-white bg-black/10 dark:bg-white/10"
        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
    }`;

    if (item.href.startsWith("#")) {
      return (
        <a
          key={item.href}
          href={item.href}
          onClick={(e) => handleAnchorClick(e, item.href)}
          className={classes}
        >
          {t(`nav.${item.key}`)}
        </a>
      );
    }
    return (
      <Link key={item.href} href={item.href} className={classes}>
        {t(`nav.${item.key}`)}
      </Link>
    );
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-white/10"
            : "bg-white/50 dark:bg-black/50 backdrop-blur-sm"
        }`}
      >
        <Container>
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/logo.png"
                alt={t("header.logoAlt")}
                className="h-10 w-auto"
                width={240}
                height={40}
                priority
              />
            </Link>

            <nav className="hidden xl:flex items-center gap-0.5">
              {siteNavItems.map(renderNavItem)}
            </nav>

            <div className="hidden xl:flex items-center gap-2">
              <Link
                href="/apply"
                className="px-4 py-1.5 text-sm bg-[#429de6] text-white rounded-md hover:bg-[#3a8acc] transition-all hover:shadow-lg hover:shadow-blue-500/20 font-medium"
              >
                {t("header.applyNow")}
              </Link>
              <LanguageSwitcher variant="outline" />
              <button
                onClick={toggleTheme}
                className="w-10 h-10 flex items-center justify-center text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-all"
                aria-label={t("header.toggleThemeAria")}
                type="button"
              >
                {theme === "dark" ? (
                  <FiSun aria-hidden="true" className="w-5 h-5" />
                ) : (
                  <FiMoon aria-hidden="true" className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={onLoginClick}
                className="px-4 py-1.5 text-sm bg-transparent border border-black/20 dark:border-white/20 text-black dark:text-white rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-all"
                type="button"
              >
                {t("header.signInNow")}
              </button>
            </div>

            <div className="xl:hidden flex items-center gap-1">
              <Link
                href="/apply"
                className="px-3 py-1.5 text-xs bg-[#429de6] text-white rounded-md hover:bg-[#3a8acc] transition-all font-medium"
              >
                {t("header.applyNow")}
              </Link>
              <LanguageSwitcher />
              <button
                onClick={toggleTheme}
                className="w-9 h-9 flex items-center justify-center text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-all"
                aria-label={t("header.toggleThemeAria")}
                type="button"
              >
                {theme === "dark" ? (
                  <FiSun aria-hidden="true" className="w-4 h-4" />
                ) : (
                  <FiMoon aria-hidden="true" className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="w-10 h-10 flex items-center justify-center text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-all"
                aria-label={t("header.toggleMenuAria")}
                type="button"
              >
                {isMobileMenuOpen ? (
                  <FiX aria-hidden="true" className="w-6 h-6" />
                ) : (
                  <FiMenu aria-hidden="true" className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </Container>
      </header>

      {isMobileMenuOpen && (
        <button
          className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-[200] xl:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          type="button"
          aria-label={t("header.closeMenuAria")}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-white dark:bg-[#111111] border-l border-gray-200 dark:border-white/10 z-[210] xl:hidden transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200 dark:border-white/10">
          <Link href="/" className="block">
            <Image
              src="/logo.png"
              alt={t("header.logoAlt")}
              className="h-8 w-auto"
              width={120}
              height={32}
            />
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-10 h-10 flex items-center justify-center text-gray-900 dark:text-white hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-all"
            aria-label={t("header.closeMenuAria")}
            type="button"
          >
            <FiX aria-hidden="true" className="w-6 h-6" />
          </button>
        </div>

        <nav className="px-6 py-6 flex flex-col gap-2">
          {siteNavItems.map(renderMobileNavItem)}

          <Link
            href="/apply"
            className="mt-4 px-4 py-3 bg-[#429de6] text-white rounded-lg hover:bg-[#3a8acc] transition-all text-center font-medium"
          >
            {t("header.applyNow")}
          </Link>
        </nav>
      </div>
    </>
  );
};
