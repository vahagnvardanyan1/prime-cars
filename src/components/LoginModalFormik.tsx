"use client";

import { useTranslations } from "next-intl";
import { Formik, Form, Field } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";

import { loginSchema, type LoginFormValues } from "@/lib/validation/schemas";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/lib/react-query/hooks/useAuth";

type LoginModalFormikProps = {
  open: boolean;
  onOpenChange: ({ open }: { open: boolean }) => void;
  onLoginSuccess?: () => void;
};

export const LoginModalFormik = ({ open, onOpenChange, onLoginSuccess }: LoginModalFormikProps) => {
  const t = useTranslations();
  const loginMutation = useLogin();

  const close = () => {
    onOpenChange({ open: false });
  };

  const initialValues: LoginFormValues = {
    email: "",
    password: "",
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => onOpenChange({ open: nextOpen })}>
      <DialogContent className="w-[calc(100vw-24px)] max-w-[440px] overflow-hidden rounded-3xl border-gray-200 bg-white p-0 dark:border-white/10 dark:bg-[#0a0a0a]">
        <Formik
          initialValues={initialValues}
          validationSchema={toFormikValidationSchema(loginSchema)}
          onSubmit={async (values, { setSubmitting }) => {
            loginMutation.mutate(values, {
              onSuccess: () => {
                if (onLoginSuccess) onLoginSuccess();
                close();
              },
              onSettled: () => {
                setSubmitting(false);
              },
            });
          }}
        >
          {({ errors, touched, isSubmitting, isValid }) => (
            <Form className="flex flex-col">
              <div className="px-8 py-6 border-b border-gray-200 dark:border-white/10">
                <DialogHeader className="space-y-2">
                  <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                    {t("auth.welcomeBack")}
                  </DialogTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    {t("auth.subtitle")}
                  </p>
                </DialogHeader>
              </div>

              <div className="px-8 py-6 space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("auth.email")} <span className="text-red-500">*</span>
                  </Label>
                  <Field
                    name="email"
                    type="email"
                    placeholder={t("admin.modals.createUser.emailPlaceholder")}
                    autoComplete="email"
                    className={`h-11 w-full rounded-xl bg-white text-gray-900 focus-visible:ring-2 dark:bg-black dark:text-white px-4 ${
                      touched.email && errors.email
                        ? "border-red-500 dark:border-red-500 focus-visible:ring-red-500"
                        : "border-gray-300 dark:border-white/20 focus-visible:ring-[#429de6]"
                    }`}
                  />
                  {touched.email && errors.email && (
                    <p className="text-sm text-red-500 dark:text-red-400">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("auth.password")} <span className="text-red-500">*</span>
                  </Label>
                  <Field
                    name="password"
                    type="password"
                    placeholder={t("auth.passwordPlaceholder")}
                    autoComplete="current-password"
                    className={`h-11 w-full rounded-xl bg-white text-gray-900 focus-visible:ring-2 dark:bg-black dark:text-white px-4 ${
                      touched.password && errors.password
                        ? "border-red-500 dark:border-red-500 focus-visible:ring-red-500"
                        : "border-gray-300 dark:border-white/20 focus-visible:ring-[#429de6]"
                    }`}
                  />
                  {touched.password && errors.password && (
                    <p className="text-sm text-red-500 dark:text-red-400">{errors.password}</p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 px-8 py-5 dark:border-white/10 bg-gray-50 dark:bg-[#0a0a0a]">
                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-[#429de6] text-white hover:bg-[#3a8acc] disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-blue-500/20"
                  disabled={!isValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{t("auth.signingIn")}</span>
                    </div>
                  ) : (
                    t("auth.signIn")
                  )}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};
