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
  const { previews, setFileAt, clearAll } = usePhotoUploads({ maxFiles: 3 });

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const isSubmitEnabled = useMemo(() => {
    return login.trim().length > 0 && password.trim().length > 0;
  }, [login, password]);

  const close = () => {
    onOpenChange({ open: false });
  };

  const onSubmit = () => {
    // Visual-only: no backend.
    close();
    clearAll();
    setLogin("");
    setPassword("");
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => onOpenChange({ open: nextOpen })}>
      <DialogContent className="sm:max-w-[720px] rounded-2xl border-gray-200 p-0 dark:border-white/10 dark:bg-[#0b0f14]">
        <div className="px-7 py-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-gray-900 dark:text-white">
              {t("admin.modals.createUser.title")}
            </DialogTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("admin.modals.createUser.subtitle")}
            </p>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            <PhotoUploadGrid
              label={t("admin.modals.createUser.photosLabel")}
              maxFiles={3}
              previews={previews}
              onPickFile={setFileAt}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white">{t("admin.modals.createUser.login")}</Label>
                <Input
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder={t("admin.modals.createUser.loginPlaceholder")}
                  className="h-11 rounded-xl border-gray-200 bg-white text-gray-900 focus-visible:ring-[#429de6]/30 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white">{t("admin.modals.createUser.password")}</Label>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  className="h-11 rounded-xl border-gray-200 bg-white text-gray-900 focus-visible:ring-[#429de6]/30 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-7 py-5 dark:border-white/10">
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white dark:hover:bg-white/5"
              onClick={close}
            >
              {t("admin.modals.createUser.cancel")}
            </Button>
            <Button
              type="button"
              className="h-10 rounded-xl bg-[#429de6] text-white hover:bg-[#3a8acc] disabled:opacity-60"
              disabled={!isSubmitEnabled}
              onClick={onSubmit}
            >
              {t("admin.modals.createUser.submit")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};




