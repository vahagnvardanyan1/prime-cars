"use client";

import { useMemo, useState } from "react";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ShippingCity } from "@/lib/admin/types";

type UpdateShippingPriceModalProps = {
  open: boolean;
  city: ShippingCity | null;
  onOpenChange: ({ open }: { open: boolean }) => void;
  onConfirm: ({ cityId, nextShippingUsd }: { cityId: string; nextShippingUsd: number }) => void;
};

export const UpdateShippingPriceModal = ({
  open,
  city,
  onOpenChange,
  onConfirm,
}: UpdateShippingPriceModalProps) => {
  const [value, setValue] = useState("");

  const isConfirmEnabled = useMemo(() => {
    return value.trim().length > 0 && Number.isFinite(Number(value));
  }, [value]);

  const close = () => {
    onOpenChange({ open: false });
    setValue("");
  };

  const confirm = () => {
    if (!city) return;
    const next = Math.max(0, Number(value));
    onConfirm({ cityId: city.id, nextShippingUsd: next });
    close();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => onOpenChange({ open: nextOpen })}>
      <DialogContent className="sm:max-w-[520px] rounded-2xl border-gray-200 p-0 dark:border-white/10 dark:bg-[#0b0f14]">
        <div className="px-7 py-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-gray-900 dark:text-white">
              Update Shipping Price
            </DialogTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {city ? (
                <>
                  Set a new shipping price for <span className="font-medium text-gray-900 dark:text-white">{city.city}</span>.
                </>
              ) : (
                "Select a city to update."
              )}
            </p>
          </DialogHeader>

          <div className="mt-6 space-y-2">
            <div className="text-xs font-medium uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
              Shipping Price (USD)
            </div>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              inputMode="numeric"
              placeholder={city ? `${city.shippingUsd}` : "0"}
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
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-10 rounded-xl bg-[#429de6] text-white hover:bg-[#3a8acc] disabled:opacity-60"
              disabled={!isConfirmEnabled || !city}
              onClick={confirm}
            >
              Confirm
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};


