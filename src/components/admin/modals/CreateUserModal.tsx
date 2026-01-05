"use client";

import { useMemo, useState } from "react";

import { useTranslations } from "next-intl";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhotoUploadGrid } from "@/components/admin/modals/PhotoUploadGrid";
import { usePhotoUploads } from "@/hooks/admin/usePhotoUploads";

type CreateUserModalProps = {
  open: boolean;
  onOpenChange: ({ open }: { open: boolean }) => void;
};

export const CreateUserModal = ({ open, onOpenChange }: CreateUserModalProps) => {
  const t = useTranslations();
  const { previews, setFileAt, removeFileAt, clearAll } = usePhotoUploads({ maxFiles: 3, initialSlots: 1 });

  const [country, setCountry] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const isSubmitEnabled = useMemo(() => {
    return login.trim().length > 0 && password.trim().length > 0 && firstName.trim().length > 0 && lastName.trim().length > 0;
  }, [login, password, firstName, lastName]);

  const close = () => {
    onOpenChange({ open: false });
  };

  const onSubmit = () => {
    // Visual-only: no backend.
    close();
    clearAll();
    setCountry("");
    setFirstName("");
    setLastName("");
    setPassportNumber("");
    setPhone("");
    setEmail("");
    setLogin("");
    setPassword("");
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => onOpenChange({ open: nextOpen })}>
      <DialogContent className="w-[calc(100vw-24px)] max-w-[980px] overflow-hidden rounded-3xl border-gray-200 p-0 dark:border-white/10 dark:bg-[#0a0a0a] lg:max-w-[1100px]">
        <div className="flex max-h-[85vh] flex-col">
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

          <div className="px-8 py-6 max-h-[calc(85vh-180px)] space-y-6 overflow-y-auto">
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
                {t("admin.modals.createUser.photosLabel")}
              </Label>
            <PhotoUploadGrid
                label=""
              previews={previews}
              onPickFile={setFileAt}
                onRemoveFile={removeFileAt}
                tileClassName="h-[160px]"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("admin.modals.createUser.country")}
                </Label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="h-11 w-full rounded-xl border border-gray-300 dark:border-white/20 bg-white pl-4 pr-10 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#429de6] dark:bg-black dark:text-white appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iI0Q1RDdEQSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==')] bg-[length:16px_16px] bg-[center_right_0.75rem] bg-no-repeat [&>option]:py-1 [&>option]:px-2"
                >
                  <option value="">{t("admin.modals.createUser.selectCountry")}</option>
                  <option value="armenia">{t("admin.modals.createUser.countries.armenia")}</option>
                  <option value="russia">{t("admin.modals.createUser.countries.russia")}</option>
                  <option value="georgia">{t("admin.modals.createUser.countries.georgia")}</option>
                  <option value="usa">{t("admin.modals.createUser.countries.usa")}</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("admin.modals.createUser.firstName")}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t("admin.modals.createUser.firstNamePlaceholder")}
                  className="h-11 rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("admin.modals.createUser.lastName")}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t("admin.modals.createUser.lastNamePlaceholder")}
                  className="h-11 rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("admin.modals.createUser.passportNumber")}
                </Label>
                <Input
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value)}
                  placeholder={t("admin.modals.createUser.passportPlaceholder")}
                  className="h-11 rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("admin.modals.createUser.phone")}
                </Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  placeholder={t("admin.modals.createUser.phonePlaceholder")}
                  className="h-11 rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("admin.modals.createUser.email")}
                </Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder={t("admin.modals.createUser.emailPlaceholder")}
                  className="h-11 rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("admin.modals.createUser.login")}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder={t("admin.modals.createUser.loginPlaceholder")}
                  className="h-11 rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("admin.modals.createUser.password")}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  className="h-11 rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white"
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
              type="button"
                className="h-11 px-6 rounded-xl bg-[#429de6] text-white hover:bg-[#3a8acc] disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-blue-500/20"
              disabled={!isSubmitEnabled}
              onClick={onSubmit}
            >
              {t("admin.modals.createUser.submit")}
            </Button>
          </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};




