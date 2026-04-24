import Link from "next/link";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#429de6]/8 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 text-center px-6">
        <span className="text-[140px] sm:text-[180px] md:text-[220px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#429de6]/60 via-[#429de6]/25 to-transparent select-none">
          404
        </span>

        <h1 className="text-lg sm:text-xl font-medium text-white/90 -mt-6 sm:-mt-10 mb-3 tracking-wide">
          {t("title")}
        </h1>
        <p className="text-sm text-white/40 max-w-xs mx-auto mb-10">
          {t("description")}
        </p>

        <Link
          href="/"
          className="group relative inline-flex h-12 items-center gap-2.5 rounded-full bg-[#429de6]/10 border border-[#429de6]/20 px-8 text-sm font-medium text-[#429de6] hover:text-white hover:bg-[#429de6] hover:border-[#429de6] transition-all duration-300 hover:shadow-lg hover:shadow-[#429de6]/25"
        >
          <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t("backHome")}
        </Link>
      </div>
    </div>
  );
}
