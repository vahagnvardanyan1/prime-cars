"use client";

import { useTranslations } from "next-intl";

export function ApplySection() {
  const t = useTranslations();

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h2 className="mb-4 !text-white">{t("home.apply.title")}</h2>
      <p className="mb-8 text-white/80">{t("home.apply.description")}</p>

      <form
        className="flex flex-col sm:flex-row gap-3"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          type="text"
          placeholder={t("home.apply.namePlaceholder")}
          className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
        />
        <input
          type="tel"
          placeholder={t("home.apply.phonePlaceholder")}
          className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
        />
        <button
          type="submit"
          className="px-8 py-3 bg-white text-[#429de6] rounded-lg font-medium hover:bg-white/90 transition-all"
        >
          {t("home.apply.submit")}
        </button>
      </form>
    </div>
  );
}
