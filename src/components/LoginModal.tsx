"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { PasswordInput } from "@/components/ui/password-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLogin } from "@/lib/react-query/hooks/useAuth";
import { useUser } from "@/contexts/UserContext";
import { loginSchema, type LoginFormValues } from "@/lib/validation/schemas";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
}

export const LoginModal = ({ isOpen, onClose, onSuccess }: LoginModalProps) => {
  const t = useTranslations();
  const login = useLogin();
  const { refreshUser } = useUser();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login.mutateAsync(values);
      await refreshUser();
      await onSuccess?.();
    } catch {
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        overlayClassName="bg-black/90 backdrop-blur-md"
        className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl sm:max-w-lg p-0 gap-0 overflow-hidden"
      >
        <DialogHeader className="px-12 pt-12 pb-8">
          <DialogTitle className="text-4xl font-bold text-gray-900 dark:text-white text-center uppercase tracking-wider">
            {t("auth.signIn")}
          </DialogTitle>
        </DialogHeader>

        <div className="px-12 pb-12">
          <form className="space-y-8" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-2">
              <label
                htmlFor="login-username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider"
              >
                {t("auth.username")}
              </label>
              <input
                id="login-username"
                type="text"
                placeholder={t("auth.usernamePlaceholder")}
                autoComplete="username"
                aria-required="true"
                aria-invalid={!!errors.username}
                aria-describedby={errors.username ? "username-error" : undefined}
                disabled={login.isPending}
                {...register("username")}
                className={`w-full px-6 py-4 bg-transparent border-2 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#429de6] focus-visible:ring-offset-2 transition-colors text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.username
                    ? "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500"
                    : "border-gray-300 dark:border-white/20 focus:border-[#429de6] dark:focus:border-[#429de6]"
                }`}
              />
              {errors.username?.message && (
                <p id="username-error" role="alert" className="text-sm text-red-500 dark:text-red-400 mt-1">
                  {t(errors.username.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider"
              >
                {t("auth.password")}
              </label>
              <PasswordInput
                id="login-password"
                placeholder={t("auth.passwordPlaceholder")}
                autoComplete="current-password"
                aria-required="true"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                disabled={login.isPending}
                {...register("password")}
                className={`w-full px-6 py-4 bg-transparent border-2 rounded-xl focus:outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 text-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.password
                    ? "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500"
                    : "border-gray-300 dark:border-white/20 focus:border-[#429de6] dark:focus:border-[#429de6]"
                }`}
              />
              {errors.password?.message && (
                <p id="password-error" role="alert" className="text-sm text-red-500 dark:text-red-400 mt-1">
                  {t(errors.password.message)}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={login.isPending}
              className="w-full py-4 bg-[#429de6] text-white rounded-xl hover:bg-[#3a8acc] transition-all hover:shadow-xl hover:shadow-blue-500/30 font-semibold text-lg uppercase tracking-wider mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {login.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <svg aria-hidden="true" className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
      </DialogContent>
    </Dialog>
  );
};
