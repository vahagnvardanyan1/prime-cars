"use client";

import { useTranslations } from "next-intl";
import { Formik, Form, Field } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";

import { createUserSchema, type CreateUserFormValues } from "@/lib/validation/schemas";
import { Country } from "@/lib/admin/types";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCreateUser } from "@/lib/react-query/hooks/useUsers";

type CreateUserModalFormikProps = {
  open: boolean;
  onOpenChange: ({ open }: { open: boolean }) => void;
  onUserCreated?: () => void;
};

export const CreateUserModalFormik = ({ open, onOpenChange, onUserCreated }: CreateUserModalFormikProps) => {
  const t = useTranslations();
  const createUserMutation = useCreateUser();

  const close = () => {
    onOpenChange({ open: false });
  };

  const initialValues: CreateUserFormValues = {
    firstName: "",
    lastName: "",
    email: "",
    login: "",
    password: "",
    phone: "",
    country: "",
    companyName: "",
    passportNumber: "",
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => onOpenChange({ open: nextOpen })}>
      <DialogContent className="w-[calc(100vw-24px)] max-w-[600px] overflow-hidden rounded-3xl border-gray-200 bg-white p-0 dark:border-white/10 dark:bg-[#0a0a0a]">
        <Formik
          initialValues={initialValues}
          validationSchema={toFormikValidationSchema(createUserSchema)}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            createUserMutation.mutate(values, {
              onSuccess: () => {
                resetForm();
                if (onUserCreated) onUserCreated();
                close();
              },
              onSettled: () => {
                setSubmitting(false);
              },
            });
          }}
        >
          {({ errors, touched, isSubmitting, isValid }) => (
            <Form className="flex max-h-[85vh] flex-col">
              <div className="px-8 py-6 border-b border-gray-200 dark:border-white/10">
                <DialogHeader className="space-y-2">
                  <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t("admin.modals.createUser.title")}
                  </DialogTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("admin.modals.createUser.subtitle")}
                  </p>
                </DialogHeader>
              </div>

              <div className="px-8 py-6 max-h-[calc(85vh-180px)] space-y-4 overflow-y-auto">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* First Name */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("admin.modals.createUser.firstName")} <span className="text-red-500">*</span>
                    </Label>
                    <Field
                      name="firstName"
                      placeholder={t("admin.modals.createUser.firstNamePlaceholder")}
                      className={`h-11 w-full rounded-xl bg-white text-gray-900 focus-visible:ring-2 dark:bg-black dark:text-white px-4 ${
                        touched.firstName && errors.firstName
                          ? "border-red-500 dark:border-red-500 focus-visible:ring-red-500"
                          : "border-gray-300 dark:border-white/20 focus-visible:ring-[#429de6]"
                      }`}
                    />
                    {touched.firstName && errors.firstName && (
                      <p className="text-sm text-red-500 dark:text-red-400">{errors.firstName}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("admin.modals.createUser.lastName")} <span className="text-red-500">*</span>
                    </Label>
                    <Field
                      name="lastName"
                      placeholder={t("admin.modals.createUser.lastNamePlaceholder")}
                      className={`h-11 w-full rounded-xl bg-white text-gray-900 focus-visible:ring-2 dark:bg-black dark:text-white px-4 ${
                        touched.lastName && errors.lastName
                          ? "border-red-500 dark:border-red-500 focus-visible:ring-red-500"
                          : "border-gray-300 dark:border-white/20 focus-visible:ring-[#429de6]"
                      }`}
                    />
                    {touched.lastName && errors.lastName && (
                      <p className="text-sm text-red-500 dark:text-red-400">{errors.lastName}</p>
                    )}
                  </div>

                  {/* Login */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("admin.modals.createUser.login")} <span className="text-red-500">*</span>
                    </Label>
                    <Field
                      name="login"
                      placeholder={t("admin.modals.createUser.loginPlaceholder")}
                      className={`h-11 w-full rounded-xl bg-white text-gray-900 focus-visible:ring-2 dark:bg-black dark:text-white px-4 ${
                        touched.login && errors.login
                          ? "border-red-500 dark:border-red-500 focus-visible:ring-red-500"
                          : "border-gray-300 dark:border-white/20 focus-visible:ring-[#429de6]"
                      }`}
                    />
                    {touched.login && errors.login && (
                      <p className="text-sm text-red-500 dark:text-red-400">{errors.login}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("admin.modals.createUser.password")} <span className="text-red-500">*</span>
                    </Label>
                    <Field
                      name="password"
                      type="password"
                      placeholder={t("passwordPlaceholder")}
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

                  {/* Email */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("admin.modals.createUser.email")}
                    </Label>
                    <Field
                      name="email"
                      type="email"
                      placeholder={t("admin.modals.createUser.emailPlaceholder")}
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

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("admin.modals.createUser.phone")}
                    </Label>
                    <Field
                      name="phone"
                      type="tel"
                      placeholder={t("admin.modals.createUser.phonePlaceholder")}
                      className="h-11 w-full rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white px-4"
                    />
                  </div>

                  {/* Country */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("admin.modals.createUser.country")}
                    </Label>
                    <Field
                      as="select"
                      name="country"
                      className="h-11 w-full rounded-xl border border-gray-300 dark:border-white/20 bg-white pl-4 pr-10 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#429de6] dark:bg-black dark:text-white appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==')] bg-[length:16px_16px] bg-[center_right_0.75rem] bg-no-repeat"
                    >
                      <option value="">{t("admin.modals.createUser.selectCountry")}</option>
                      {Object.values(Country).map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </Field>
                  </div>

                  {/* Company Name */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("admin.modals.createUser.companyName")}
                    </Label>
                    <Field
                      name="companyName"
                      placeholder={t("admin.modals.createUser.companyNamePlaceholder")}
                      className="h-11 w-full rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white px-4"
                    />
                  </div>

                  {/* Passport Number */}
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("admin.modals.createUser.passportNumber")}
                    </Label>
                    <Field
                      name="passportNumber"
                      placeholder={t("admin.modals.createUser.passportPlaceholder")}
                      className="h-11 w-full rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white px-4"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 px-8 py-5 dark:border-white/10 bg-gray-50 dark:bg-[#0a0a0a]">
                <DialogFooter className="gap-3 sm:gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 px-6 rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 hover:bg-gray-100 dark:bg-black dark:text-white dark:hover:bg-white/5 font-medium"
                    onClick={close}
                  >
                    {t("admin.modals.createUser.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    className="h-11 px-6 rounded-xl bg-[#429de6] text-white hover:bg-[#3a8acc] disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-blue-500/20"
                    disabled={!isValid || isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>{t("admin.modals.createUser.submitting")}</span>
                      </div>
                    ) : (
                      t("admin.modals.createUser.submit")
                    )}
                  </Button>
                </DialogFooter>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};
