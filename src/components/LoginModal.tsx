"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { API_BASE_URL } from "@/i18n/config";
import { setTokens } from "@/lib/auth/token";
import { PasswordInput } from "@/components/ui/password-input";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => Promise<void> | void;
}

export const LoginModal = ({ isOpen, onClose, onLoginSuccess }: LoginModalProps) => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      // Reset form when modal closes
      setUsername("");
      setPassword("");
      setIsSubmitting(false);
      setErrors({});
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      newErrors.username = t("auth.validation.usernameRequired");
    } else if (username.trim().length < 3) {
      newErrors.username = t("auth.validation.usernameMinLength");
    }

    if (!password.trim()) {
      newErrors.password = t("auth.validation.passwordRequired");
    } else if (password.trim().length < 6) {
      newErrors.password = t("auth.validation.passwordMinLength");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Login failed" }));
        toast.error("Login failed", {
          description: errorData.error || "Invalid username or password.",
        });
        setIsSubmitting(false);
        return;
      }

      const result = await response.json();

      // Tokens are nested in result.data
      const data = result.data || result;
      const accessToken = data.access_token;
      const refreshToken = data.refresh_token;

      // Store both access_token and refresh_token from backend
      if (accessToken && refreshToken) {
        setTokens({ 
          accessToken: accessToken,
          refreshToken: refreshToken
        });
      } else if (accessToken) {
        // Fallback
        setTokens({ 
          accessToken: accessToken,
          refreshToken: accessToken 
        });
      }

      toast.success("Login successful", {
        description: `Welcome back, ${username}!`,
      });

      setUsername("");
      setPassword("");
      setErrors({});
      
      if (onLoginSuccess) {
        await onLoginSuccess();
      }
      
      const isAdminPage = pathname.includes("/admin");
      
      // If not on admin page, redirect to admin
      if (!isAdminPage) {
        // Extract locale from pathname (e.g., /en/... or /hy/...)
        const pathParts = pathname.split("/").filter(Boolean);
        const locale = pathParts[0] || "en";
        router.push(`/${locale}/admin`);
      }
      
      setIsSubmitting(false);
    } catch (error) {
      toast.error("Login failed", {
        description: error instanceof Error ? error.message : "Network error occurred.",
      });
      setIsSubmitting(false);
    }
  };

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
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                {t("auth.username")}
              </label>
              <input
                type="text"
                placeholder=""
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username) {
                    setErrors({ ...errors, username: undefined });
                  }
                }}
                disabled={isSubmitting}
                className={`w-full px-6 py-4 bg-transparent border-2 rounded-xl focus:outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.username
                    ? 'border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500'
                    : 'border-gray-300 dark:border-white/20 focus:border-[#429de6] dark:focus:border-[#429de6]'
                }`}
              />
              {errors.username && (
                <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                  {errors.username}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                {t("auth.password")}
              </label>
              <PasswordInput
                placeholder=""
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors({ ...errors, password: undefined });
                  }
                }}
                disabled={isSubmitting}
                className={`w-full px-6 py-4 bg-transparent border-2 rounded-xl focus:outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.password
                    ? 'border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500'
                    : 'border-gray-300 dark:border-white/20 focus:border-[#429de6] dark:focus:border-[#429de6]'
                }`}
              />
              {errors.password && (
                <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#429de6] text-white rounded-xl hover:bg-[#3a8acc] transition-all hover:shadow-xl hover:shadow-blue-500/30 font-semibold text-lg uppercase tracking-wider mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t("auth.signingIn")}</span>
                </div>
              ) : (
                t("auth.signIn")
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
