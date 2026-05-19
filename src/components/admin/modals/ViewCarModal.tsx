"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";

import type { AdminCar } from "@/lib/admin/types";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ViewCarModalProps = {
  open: boolean;
  car: AdminCar | null;
  onOpenChange: ({ open }: { open: boolean }) => void;
};

const FIELD_INPUT_CLASS =
  "w-full h-11 sm:h-10 px-3 sm:px-4 bg-white dark:bg-[#161b22] border border-gray-300 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 cursor-default focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:border-gray-300 dark:focus-visible:border-white/10";

const FIELD_LABEL_CLASS =
  "block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide";

const toDateInputValue = (value?: string): string =>
  value ? value.split("T")[0] : "";

export const ViewCarModal = ({ open, car, onOpenChange }: ViewCarModalProps) => {
  const t = useTranslations("admin.modals.updateCar");
  const tAddCar = useTranslations("admin.modals.addCar");
  const tActions = useTranslations("admin.actions");

  if (!car) return null;

  const photos = car.photos ?? [];
  const vehiclePdfUrl = car.details?.vehiclePdf || car.vehiclePdf;
  const shippingPdfUrl = car.details?.shippingPdf || car.shippingPdf;
  const insurancePdfUrl = car.details?.insurancePdf || car.insurancePdf;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => onOpenChange({ open: isOpen })}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="flex flex-col gap-0 top-0 left-0 translate-x-0 translate-y-0 sm:top-[50%] sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] w-screen sm:w-[calc(100vw-40px)] max-w-none sm:max-w-[1400px] h-[100dvh] sm:h-auto max-h-none sm:max-h-[90vh] overflow-hidden rounded-none sm:rounded-3xl bg-white dark:bg-[#0b0f14] border-0 sm:border sm:border-gray-200 sm:dark:border-white/10 shadow-2xl p-0"
      >
        <DialogHeader className="flex-shrink-0 px-4 sm:px-8 lg:px-16 pt-[max(env(safe-area-inset-top),1.25rem)] sm:pt-6 lg:pt-7 pb-4 sm:pb-5 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b0f14]">
          <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            {t("viewTitle")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-8 lg:px-16 py-5 sm:py-6 lg:py-8 space-y-4 sm:space-y-5 lg:space-y-6 bg-gray-50/50 dark:bg-[#0b0f14]">
          {photos.length > 0 && (
            <div className="space-y-3">
              <Label className={FIELD_LABEL_CLASS}>
                {t("existingPhotos")} ({photos.length})
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {photos.map((photoUrl, index) => (
                  <div
                    key={`${photoUrl}-${index}`}
                    className="relative h-[100px] sm:h-[160px] overflow-hidden rounded-2xl border border-solid border-gray-200 dark:border-white/10"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoUrl}
                      alt={`${car.year} ${car.model} — ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="space-y-2">
              <Label htmlFor="view-model" className={FIELD_LABEL_CLASS}>{t("model")}</Label>
              <Input id="view-model" value={car.model || ""} readOnly className={FIELD_INPUT_CLASS} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="view-year" className={FIELD_LABEL_CLASS}>{t("year")}</Label>
              <Input id="view-year" value={car.year ?? ""} readOnly className={FIELD_INPUT_CLASS} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="view-price" className={FIELD_LABEL_CLASS}>{t("priceUsd")}</Label>
              <Input id="view-price" value={car.priceUsd ?? ""} readOnly className={FIELD_INPUT_CLASS} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="view-type" className={FIELD_LABEL_CLASS}>{t("vehicleType")}</Label>
              <Input id="view-type" value={car.details?.type || ""} readOnly className={FIELD_INPUT_CLASS} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="view-auction" className={FIELD_LABEL_CLASS}>{t("auction")}</Label>
              <Input id="view-auction" value={car.details?.auction || ""} readOnly className={FIELD_INPUT_CLASS} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="space-y-2">
              <Label htmlFor="view-purchaseDate" className={FIELD_LABEL_CLASS}>{t("purchaseDate")}</Label>
              <Input
                id="view-purchaseDate"
                type="date"
                value={toDateInputValue(car.details?.purchaseDate)}
                readOnly
                className={`${FIELD_INPUT_CLASS} [color-scheme:dark] appearance-none`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="view-city" className={FIELD_LABEL_CLASS}>{t("city")}</Label>
              <Input id="view-city" value={car.details?.city || ""} readOnly className={FIELD_INPUT_CLASS} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="view-lot" className={FIELD_LABEL_CLASS}>{t("lotNumber")}</Label>
              <Input id="view-lot" value={car.details?.lot || ""} readOnly className={FIELD_INPUT_CLASS} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="view-vin" className={FIELD_LABEL_CLASS}>{t("vin")}</Label>
              <Input id="view-vin" value={car.details?.vin || ""} readOnly className={FIELD_INPUT_CLASS} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="view-client" className={FIELD_LABEL_CLASS}>{t("client")}</Label>
              <Input id="view-client" value={car.client || ""} readOnly className={FIELD_INPUT_CLASS} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="space-y-2">
              <Label htmlFor="view-containerNumberBooking" className={FIELD_LABEL_CLASS}>{t("containerNumberBooking")}</Label>
              <Input
                id="view-containerNumberBooking"
                value={car.details?.containerNumberBooking || ""}
                readOnly
                className={FIELD_INPUT_CLASS}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="view-promisedPickUpDate" className={FIELD_LABEL_CLASS}>{t("promisedPickUpDate")}</Label>
              <Input
                id="view-promisedPickUpDate"
                type="date"
                value={toDateInputValue(car.details?.promisedPickUpDate)}
                readOnly
                className={`${FIELD_INPUT_CLASS} [color-scheme:dark] appearance-none`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="view-deliveredWarehouse" className={FIELD_LABEL_CLASS}>{t("deliveredWarehouse")}</Label>
              <Input
                id="view-deliveredWarehouse"
                type="date"
                value={toDateInputValue(car.details?.deliveredWarehouse)}
                readOnly
                className={`${FIELD_INPUT_CLASS} [color-scheme:dark] appearance-none`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="view-destinationPort" className={FIELD_LABEL_CLASS}>{tAddCar("destinationPort")}</Label>
              <Input
                id="view-destinationPort"
                value={car.details?.destinationPort || ""}
                readOnly
                className={FIELD_INPUT_CLASS}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="view-receiverName" className={FIELD_LABEL_CLASS}>{tAddCar("receiverName")}</Label>
              <Input
                id="view-receiverName"
                value={car.details?.receiverName || ""}
                readOnly
                className={FIELD_INPUT_CLASS}
              />
            </div>
          </div>

          <div className="pt-1 sm:pt-2 space-y-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {t("paymentsAndDocuments")}
            </h3>

            <ViewStatusCard
              accent={car.carPaid ? "green" : "orange"}
              icon={car.carPaid ? "check" : "x"}
              label={t("carPaid")}
              statusLabel={car.carPaid ? t("paid") : t("notPaid")}
              pdfUrl={vehiclePdfUrl}
              pdfLabel={t("vehiclePdfLabel")}
              viewLabel={t("viewInvoice")}
            />

            <ViewStatusCard
              accent={car.shippingPaid ? "green" : "orange"}
              icon={car.shippingPaid ? "check" : "x"}
              label={t("shippingPaid")}
              statusLabel={car.shippingPaid ? t("paid") : t("notPaid")}
              pdfUrl={shippingPdfUrl}
              pdfLabel={t("shippingPdfLabel")}
              viewLabel={t("viewInvoice")}
            />

            <ViewStatusCard
              accent={car.insurance ? "blue" : "gray"}
              icon={car.insurance ? "check" : "x"}
              label={t("insurance")}
              statusLabel={car.insurance ? t("exists") : t("notExists")}
              pdfUrl={insurancePdfUrl}
              pdfLabel={t("insurancePdfLabel")}
              viewLabel={t("viewInvoice")}
            />
          </div>

          {car.details?.customerNotes && (
            <div className="pt-1 sm:pt-2">
              <div className="space-y-2">
                <Label htmlFor="view-notes" className={FIELD_LABEL_CLASS}>{t("customerNotes")}</Label>
                <Textarea
                  id="view-notes"
                  value={car.details.customerNotes}
                  readOnly
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 resize-none bg-white dark:bg-[#161b22] border border-gray-300 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white cursor-default focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:border-gray-300 dark:focus-visible:border-white/10"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 px-4 sm:px-8 lg:px-16 pt-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] sm:pt-6 sm:pb-6 lg:pt-7 lg:pb-7 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b0f14]">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange({ open: false })}
            className="w-full sm:w-auto sm:min-w-[140px] lg:min-w-[150px] h-11 sm:h-12 text-sm font-medium border-2 border-gray-300 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 hover:dark:border-white/20 text-gray-900 dark:text-white rounded-lg transition-all duration-200"
          >
            {tActions("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

type ViewStatusCardProps = {
  accent: "green" | "orange" | "blue" | "gray";
  icon: "check" | "x";
  label: string;
  statusLabel: string;
  pdfUrl?: string;
  pdfLabel: string;
  viewLabel: string;
};

const ACCENT_BORDER: Record<ViewStatusCardProps["accent"], string> = {
  green: "bg-green-50/80 border-green-300 dark:bg-green-950/30 dark:border-green-800/50",
  orange: "bg-orange-50/80 border-orange-300 dark:bg-orange-950/30 dark:border-orange-800/50",
  blue: "bg-blue-50/80 border-blue-300 dark:bg-blue-950/30 dark:border-blue-800/50",
  gray: "bg-gray-50/80 border-gray-300 dark:bg-gray-800/30 dark:border-gray-700/50",
};

const ACCENT_BADGE: Record<ViewStatusCardProps["accent"], string> = {
  green: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
  orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  gray: "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300",
};

const ACCENT_DIVIDER: Record<ViewStatusCardProps["accent"], string> = {
  green: "border-green-200/50 dark:border-green-800/30",
  orange: "border-orange-200/50 dark:border-orange-800/30",
  blue: "border-blue-200/50 dark:border-blue-800/30",
  gray: "border-gray-200/50 dark:border-gray-700/30",
};

const ACCENT_ICON: Record<ViewStatusCardProps["accent"], string> = {
  green: "text-green-600 dark:text-green-400",
  orange: "text-orange-600 dark:text-orange-400",
  blue: "text-blue-600 dark:text-blue-400",
  gray: "text-gray-600 dark:text-gray-400",
};

const ViewStatusCard = ({
  accent,
  icon,
  label,
  statusLabel,
  pdfUrl,
  pdfLabel,
  viewLabel,
}: ViewStatusCardProps) => {
  const Icon = icon === "check" ? CheckCircle2 : XCircle;
  return (
    <div className={`relative overflow-hidden rounded-xl border-2 ${ACCENT_BORDER[accent]}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <Icon className={`h-5 w-5 flex-shrink-0 ${ACCENT_ICON[accent]}`} />
              <span className="text-base font-bold text-gray-900 dark:text-white">{label}</span>
            </div>
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold ${ACCENT_BADGE[accent]}`}
            >
              {statusLabel}
            </div>
          </div>
        </div>
      </div>
      <div className={`px-4 pb-4 pt-2 border-t ${ACCENT_DIVIDER[accent]}`}>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-gray-700 dark:text-white/80">{pdfLabel}</span>
          {pdfUrl ? (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {viewLabel}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <span className="text-sm text-gray-400 dark:text-white/40">—</span>
          )}
        </div>
      </div>
    </div>
  );
};
