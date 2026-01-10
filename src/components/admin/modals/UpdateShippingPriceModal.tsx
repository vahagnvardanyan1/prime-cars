"use client";

import { useMemo, useState } from "react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ShippingCity } from "@/lib/admin/types";
import { updateShipping } from "@/lib/admin/updateShipping";

type UpdateShippingPriceModalProps = {
  open: boolean;
  city: ShippingCity | null;
  onOpenChange: ({ open }: { open: boolean }) => void;
  onConfirm: ({ cityId, nextShippingUsd }: { cityId: string; nextShippingUsd: number }) => void;
  onSuccess?: () => void;
};

export const UpdateShippingPriceModal = ({
  open,
  city,
  onOpenChange,
  onConfirm,
  onSuccess,
}: UpdateShippingPriceModalProps) => {
  const t = useTranslations();
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isConfirmEnabled = useMemo(() => {
    return value.trim().length > 0 && Number.isFinite(Number(value));
  }, [value]);

  const close = () => {
    onOpenChange({ open: false });
    setValue("");
  };

  const confirm = async () => {
    if (!city || !isConfirmEnabled || isSubmitting) return;
    
    const nextShippingUsd = Math.max(0, Number(value));
    
    setIsSubmitting(true);
    try {
      const result = await updateShipping({
        id: city.id,
        city: city.city,
        shipping: nextShippingUsd,
      });

      if (result.success) {
        toast.success("Shipping price updated", {
          description: `${city.city} shipping price updated to $${nextShippingUsd}.`,
        });
        // Update local state
        onConfirm({ cityId: city.id, nextShippingUsd });
        // Trigger refresh callback
        onSuccess?.();
        close();
      } else {
        toast.error("Failed to update shipping price", {
          description: result.error || "Could not update the price.",
        });
      }
    } catch (error) {
      toast.error("Failed to update shipping price", {
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => onOpenChange({ open: nextOpen })}>
      <DialogContent className="sm:max-w-[520px] rounded-2xl border-gray-200 bg-white p-0 dark:border-white/10 dark:bg-[#0b0f14]">
        <div className="px-7 py-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-gray-900 dark:text-white">
              {t("admin.modals.updateShipping.title")}
            </DialogTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {city ? (
                <>
                  {t("admin.modals.updateShipping.setFor", { city: city.city })}
                </>
              ) : (
                t("admin.modals.updateShipping.selectCity")
              )}
            </p>
          </DialogHeader>

          <div className="mt-6 space-y-2">
            <div className="text-xs font-medium uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
              {t("admin.modals.updateShipping.fieldLabel")}
            </div>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              inputMode="numeric"
              placeholder={city ? `${city.shippingUsd}` : "0"}
              disabled={isSubmitting}
              className="h-11 rounded-xl border-gray-200 bg-white text-gray-900 focus-visible:ring-[#429de6]/30 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 px-7 py-5 dark:border-white/10">
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white dark:hover:bg-white/5"
              onClick={close}
              disabled={isSubmitting}
            >
              {t("admin.modals.updateShipping.cancel")}
            </Button>
            <Button
              type="button"
              className="h-10 rounded-xl bg-[#429de6] text-white hover:bg-[#3a8acc] disabled:opacity-60 min-w-[100px]"
              disabled={!isConfirmEnabled || !city || isSubmitting}
              onClick={confirm}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Updating...</span>
                </div>
              ) : (
                t("admin.modals.updateShipping.confirm")
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};




