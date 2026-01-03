"use client";

import { useMemo, useState } from "react";

import { useTranslations } from "next-intl";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhotoUploadGrid } from "@/components/admin/modals/PhotoUploadGrid";
import { usePhotoUploads } from "@/hooks/admin/usePhotoUploads";

type AddCarModalProps = {
  open: boolean;
  onOpenChange: ({ open }: { open: boolean }) => void;
};

export const AddCarModal = ({ open, onOpenChange }: AddCarModalProps) => {
  const t = useTranslations();
  const { previews, setFileAt, clearAll } = usePhotoUploads({ maxFiles: 2 });

  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [priceUsd, setPriceUsd] = useState("");
  const [status, setStatus] = useState<"Active" | "Draft" | "Pending Review">(
    "Pending Review",
  );

  const isSubmitEnabled = useMemo(() => {
    return model.trim().length > 0 && year.trim().length > 0 && priceUsd.trim().length > 0;
  }, [model, priceUsd, year]);

  const close = () => {
    onOpenChange({ open: false });
  };

  const onSubmit = () => {
    // Visual-only: no backend.
    close();
    clearAll();
    setModel("");
    setYear("");
    setPriceUsd("");
    setStatus("Pending Review");
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => onOpenChange({ open: nextOpen })}>
      <DialogContent className="sm:max-w-[720px] rounded-2xl border-gray-200 p-0 dark:border-white/10 dark:bg-[#0b0f14]">
        <div className="px-7 py-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-gray-900 dark:text-white">
              {t("admin.modals.addCar.title")}
            </DialogTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("admin.modals.addCar.subtitle")}
            </p>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            <PhotoUploadGrid
              label={t("admin.modals.addCar.photosLabel")}
              maxFiles={2}
              previews={previews}
              onPickFile={setFileAt}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white">{t("admin.modals.addCar.model")}</Label>
                <Input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder={t("admin.modals.addCar.modelPlaceholder")}
                  className="h-11 rounded-xl border-gray-200 bg-white text-gray-900 focus-visible:ring-[#429de6]/30 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white">{t("admin.modals.addCar.year")}</Label>
                <Input
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  inputMode="numeric"
                  placeholder={t("admin.modals.addCar.yearPlaceholder")}
                  className="h-11 rounded-xl border-gray-200 bg-white text-gray-900 focus-visible:ring-[#429de6]/30 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white">{t("admin.modals.addCar.price")}</Label>
                <Input
                  value={priceUsd}
                  onChange={(e) => setPriceUsd(e.target.value)}
                  inputMode="numeric"
                  placeholder={t("admin.modals.addCar.pricePlaceholder")}
                  className="h-11 rounded-xl border-gray-200 bg-white text-gray-900 focus-visible:ring-[#429de6]/30 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white">{t("admin.modals.addCar.status")}</Label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "Active" | "Draft" | "Pending Review")
                  }
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#429de6]/30 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                >
                  <option value="Pending Review">{t("admin.modals.addCar.statusPending")}</option>
                  <option value="Active">{t("admin.modals.addCar.statusActive")}</option>
                  <option value="Draft">{t("admin.modals.addCar.statusDraft")}</option>
                </select>
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
              {t("admin.modals.addCar.cancel")}
            </Button>
            <Button
              type="button"
              className="h-10 rounded-xl bg-[#429de6] text-white hover:bg-[#3a8acc] disabled:opacity-60"
              disabled={!isSubmitEnabled}
              onClick={onSubmit}
            >
              {t("admin.modals.addCar.submit")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};



