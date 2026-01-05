"use client";

import { useTranslations } from "next-intl";

import type { AdminCar } from "@/lib/admin/types";
import { createAdminCar } from "@/lib/admin/createAdminCar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhotoUploadGrid } from "@/components/admin/modals/PhotoUploadGrid";
import { useAddCarForm } from "@/hooks/admin/useAddCarForm";
import { usePhotoUploads } from "@/hooks/admin/usePhotoUploads";

type AddCarModalProps = {
  open: boolean;
  onOpenChange: ({ open }: { open: boolean }) => void;
  onCreateCar: ({ car }: { car: AdminCar }) => void;
};

export const AddCarModal = ({ open, onOpenChange, onCreateCar }: AddCarModalProps) => {
  const t = useTranslations();
  const { previews, setFileAt, clearAll } = usePhotoUploads({ maxFiles: 2 });
  const form = useAddCarForm();

  const close = () => {
    onOpenChange({ open: false });
  };

  const onSubmit = () => {
    const parsed = form.derived.parsed;
    if (!parsed) return;

    const car = createAdminCar({
      imageUrl: previews[0] ?? null,
      model: form.fields.model,
      year: parsed.year,
      priceUsd: parsed.priceUsd,
      status: form.fields.status,
      details: parsed.details,
    });

    onCreateCar({ car });
    close();
    clearAll();
    form.actions.reset();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => onOpenChange({ open: nextOpen })}>
      <DialogContent className="w-[calc(100vw-24px)] max-w-[980px] overflow-hidden rounded-2xl border-gray-200 p-0 dark:border-white/10 dark:bg-[#0b0f14] lg:max-w-[1100px]">
        <div className="flex max-h-[85vh] flex-col">
          <div className="px-5 py-4">
            <DialogHeader className="space-y-1">
            <DialogTitle className="text-gray-900 dark:text-white">
              {t("admin.modals.addCar.title")}
            </DialogTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("admin.modals.addCar.subtitle")}
            </p>
          </DialogHeader>

          <div className="mt-4 max-h-[calc(85vh-132px)] space-y-4 overflow-y-auto pr-1">
            <PhotoUploadGrid
              label={t("admin.modals.addCar.photosLabel")}
              maxFiles={2}
              previews={previews}
              onPickFile={setFileAt}
              tileClassName="h-[92px]"
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white">
                  {t("admin.modals.addCar.purchaseDate")}
                </Label>
                <Input
                  value={form.fields.purchaseDate}
                  onChange={(e) => form.actions.setPurchaseDate({ value: e.target.value })}
                  type="date"
                  className="h-10 rounded-xl border-gray-200 bg-white text-gray-900 focus-visible:ring-[#429de6]/30 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white">
                  {t("admin.modals.addCar.type")}
                </Label>
                <Input
                  value={form.fields.type}
                  onChange={(e) => form.actions.setType({ value: e.target.value })}
                  placeholder={t("admin.modals.addCar.typePlaceholder")}
                  className="h-10 rounded-xl border-gray-200 bg-white text-gray-900 focus-visible:ring-[#429de6]/30 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white">{t("admin.modals.addCar.model")}</Label>
                <Input
                  value={form.fields.model}
                  onChange={(e) => form.actions.setModel({ value: e.target.value })}
                  placeholder={t("admin.modals.addCar.modelPlaceholder")}
                  className="h-10 rounded-xl border-gray-200 bg-white text-gray-900 focus-visible:ring-[#429de6]/30 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white">{t("admin.modals.addCar.year")}</Label>
                <Input
                  value={form.fields.year}
                  onChange={(e) => form.actions.setYear({ value: e.target.value })}
                  inputMode="numeric"
                  placeholder={t("admin.modals.addCar.yearPlaceholder")}
                  className="h-10 rounded-xl border-gray-200 bg-white text-gray-900 focus-visible:ring-[#429de6]/30 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white">{t("admin.modals.addCar.auction")}</Label>
                <Input
                  value={form.fields.auction}
                  onChange={(e) => form.actions.setAuction({ value: e.target.value })}
                  placeholder={t("admin.modals.addCar.auctionPlaceholder")}
                  className="h-10 rounded-xl border-gray-200 bg-white text-gray-900 focus-visible:ring-[#429de6]/30 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white">{t("admin.modals.addCar.city")}</Label>
                <Input
                  value={form.fields.city}
                  onChange={(e) => form.actions.setCity({ value: e.target.value })}
                  placeholder={t("admin.modals.addCar.cityPlaceholder")}
                  className="h-10 rounded-xl border-gray-200 bg-white text-gray-900 focus-visible:ring-[#429de6]/30 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white">{t("admin.modals.addCar.lot")}</Label>
                <Input
                  value={form.fields.lot}
                  onChange={(e) => form.actions.setLot({ value: e.target.value })}
                  placeholder={t("admin.modals.addCar.lotPlaceholder")}
                  className="h-10 rounded-xl border-gray-200 bg-white text-gray-900 focus-visible:ring-[#429de6]/30 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white">
                  {t("admin.modals.addCar.paymentToAuction")}
                </Label>
                <Input
                  value={form.fields.paymentToAuctionUsd}
                  onChange={(e) => form.actions.setPaymentToAuctionUsd({ value: e.target.value })}
                  inputMode="numeric"
                  placeholder={t("admin.modals.addCar.paymentToAuctionPlaceholder")}
                  className="h-10 rounded-xl border-gray-200 bg-white text-gray-900 focus-visible:ring-[#429de6]/30 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white">{t("admin.modals.addCar.vin")}</Label>
                <Input
                  value={form.fields.vin}
                  onChange={(e) => form.actions.setVin({ value: e.target.value })}
                  placeholder={t("admin.modals.addCar.vinPlaceholder")}
                  className="h-10 rounded-xl border-gray-200 bg-white text-gray-900 focus-visible:ring-[#429de6]/30 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white">{t("admin.modals.addCar.price")}</Label>
                <Input
                  value={form.fields.priceUsd}
                  onChange={(e) => form.actions.setPriceUsd({ value: e.target.value })}
                  inputMode="numeric"
                  placeholder={t("admin.modals.addCar.pricePlaceholder")}
                  className="h-10 rounded-xl border-gray-200 bg-white text-gray-900 focus-visible:ring-[#429de6]/30 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white">{t("admin.modals.addCar.status")}</Label>
                <select
                  value={form.fields.status}
                  onChange={(e) =>
                    form.actions.setStatus({
                      value: e.target.value as "Active" | "Draft" | "Pending Review",
                    })
                  }
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#429de6]/30 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                >
                  <option value="Pending Review">{t("admin.modals.addCar.statusPending")}</option>
                  <option value="Active">{t("admin.modals.addCar.statusActive")}</option>
                  <option value="Draft">{t("admin.modals.addCar.statusDraft")}</option>
                </select>
              </div>

              <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                <Label className="text-gray-900 dark:text-white">{t("admin.modals.addCar.customerNotes")}</Label>
                <Textarea
                  value={form.fields.customerNotes}
                  onChange={(e) => form.actions.setCustomerNotes({ value: e.target.value })}
                  placeholder={t("admin.modals.addCar.customerNotesPlaceholder")}
                  className="min-h-[90px] rounded-xl border-gray-200 bg-white text-gray-900 focus-visible:ring-[#429de6]/30 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                />
              </div>
            </div>
          </div>
          </div>

          <div className="border-t border-gray-200 px-5 py-4 dark:border-white/10">
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
              disabled={!form.derived.isSubmitEnabled}
              onClick={onSubmit}
            >
              {t("admin.modals.addCar.submit")}
            </Button>
          </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};



