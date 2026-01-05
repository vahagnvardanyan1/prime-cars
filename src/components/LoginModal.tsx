"use client";

import { useEffect } from "react";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const t = useTranslations();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-[scale-in_0.2s_ease-out] transition-colors duration-300">
        {/* Header */}
        <div className="relative px-12 pt-12 pb-8">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all"
            aria-label={t("auth.closeAria")}
            type="button"
          >
            <X className="w-6 h-6 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
          </button>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white text-center uppercase tracking-wider mb-2">
            {t("auth.signIn")}
          </h2>
        </div>

        {/* Body */}
        <div className="px-12 pb-12">
          {/* Form */}
          <form className="space-y-8">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                {t("auth.username")}
              </label>
              <input
                type="email"
                placeholder=""
                className="w-full px-6 py-4 bg-transparent border-2 border-gray-300 dark:border-white/20 rounded-xl focus:outline-none focus:border-[#429de6] dark:focus:border-[#429de6] transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-lg"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                {t("auth.password")}
              </label>
              <input
                type="password"
                placeholder=""
                className="w-full px-6 py-4 bg-transparent border-2 border-gray-300 dark:border-white/20 rounded-xl focus:outline-none focus:border-[#429de6] dark:focus:border-[#429de6] transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#429de6] text-white rounded-xl hover:bg-[#3a8acc] transition-all hover:shadow-xl hover:shadow-blue-500/30 font-semibold text-lg uppercase tracking-wider mt-6"
            >
              {t("auth.signIn")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
