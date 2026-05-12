"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export const ApplyPage = () => {
  const t = useTranslations("applyPage");
  const tCommon = useTranslations("common");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    carsPerMonth: "",
    fullName: "",
    email: "",
    phone: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/registration-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        toast.error(t("errorTitle"), {
          description: data?.error || t("errorDescription"),
        });
        return;
      }

      toast.success(t("successTitle"), { description: t("successDescription") });
      setFormData({ carsPerMonth: "", fullName: "", email: "", phone: "" });
    } catch (error) {
      toast.error(t("errorTitle"), {
        description: error instanceof Error ? error.message : tCommon("unexpectedError"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const carsOptions = [
    { value: "upTo5", label: t("carsOptions.upTo5") },
    { value: "5to20", label: t("carsOptions.5to20") },
    { value: "moreThan20", label: t("carsOptions.moreThan20") },
  ];

  return (
    <div className="pt-20 min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <div className="grid lg:grid-cols-2 min-h-[calc(100vh-5rem)]">
        {/* Left: Image */}
        <div className="relative hidden lg:block">
          <Image
            src="/login.jpg"
            alt="Prime Cars"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Right: Form */}
        <div className="flex items-center justify-center px-6 py-16 lg:px-16">
          <div className="w-full max-w-lg">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {t("pageTitle")}
            </h1>
            <div className="w-16 h-1 bg-[#429de6] rounded-full mb-6" />
            <p className="text-gray-600 dark:text-gray-400 mb-10">
              {t("subtitle")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Cars per month */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {t("carsPerMonth")}
                </label>
                <select
                  name="carsPerMonth"
                  value={formData.carsPerMonth}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-base md:text-sm rounded-lg border border-gray-300 dark:border-white/20 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-[#429de6] dark:focus:border-[#429de6] transition-colors appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22%239ca3af%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20d%3D%22M4.646%206.646a.5.5%200%200%201%20.708%200L8%209.293l2.646-2.647a.5.5%200%200%201%20.708.708l-3%203a.5.5%200%200%201-.708%200l-3-3a.5.5%200%200%201%200-.708z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
                >
                  <option value="" disabled>
                    —
                  </option>
                  {carsOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="text-gray-900">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Full name */}
              <input
                type="text"
                name="fullName"
                placeholder={`${t("fullName")} *`}
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-base md:text-sm rounded-lg border border-gray-300 dark:border-white/20 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#429de6] dark:focus:border-[#429de6] transition-colors"
              />

              {/* Email */}
              <input
                type="email"
                name="email"
                placeholder={t("email")}
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base md:text-sm rounded-lg border border-gray-300 dark:border-white/20 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#429de6] dark:focus:border-[#429de6] transition-colors"
              />

              {/* Phone */}
              <input
                type="tel"
                name="phone"
                placeholder={`${t("phone")} *`}
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-base md:text-sm rounded-lg border border-gray-300 dark:border-white/20 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#429de6] dark:focus:border-[#429de6] transition-colors"
              />

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-10 py-3.5 bg-[#429de6] text-white rounded-lg hover:bg-[#3a8acc] transition-all hover:shadow-lg hover:shadow-blue-500/20 font-semibold uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      aria-hidden="true"
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>{t("submit")}</span>
                  </div>
                ) : (
                  t("submit")
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
