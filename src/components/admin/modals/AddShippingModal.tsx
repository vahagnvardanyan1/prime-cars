"use client";

import { useMemo, useState } from "react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createShipping } from "@/lib/admin/createShipping";

type AddShippingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onShippingCreated?: () => void;
};

export const AddShippingModal = ({
  isOpen,
  onClose,
  onShippingCreated,
}: AddShippingModalProps) => {
  const t = useTranslations();
  const [city, setCity] = useState("");
  const [shipping, setShipping] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSubmitEnabled = useMemo(() => {
    return (
      city.trim().length > 0 &&
      shipping.trim().length > 0 &&
      !isNaN(Number(shipping)) &&
      Number(shipping) >= 0 &&
      !isSubmitting
    );
  }, [city, shipping, isSubmitting]);

  const handleClose = () => {
    if (isSubmitting) return;
    setCity("");
    setShipping("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmitEnabled) return;

    setIsSubmitting(true);

    try {
      const result = await createShipping({
        city: city.trim(),
        shipping: Number(shipping),
      });

      if (result.success) {
        toast.success(t("admin.modals.addShipping.successMessage"));
        handleClose();
        onShippingCreated?.();
      } else {
        toast.error(
          result.error || t("admin.modals.addShipping.errorMessage")
        );
      }
    } catch (error) {
      console.error("Error creating shipping:", error);
      toast.error(t("admin.modals.addShipping.errorMessage"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl border-gray-200 bg-white dark:border-white/10 dark:bg-[#0b0f14]">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">
            {t("admin.modals.addShipping.title")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* City Name */}
            <div className="space-y-2">
              <Label
                htmlFor="city"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("admin.modals.addShipping.cityName")}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t("admin.modals.addShipping.cityPlaceholder")}
                disabled={isSubmitting}
                className="h-11 rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white"
              />
            </div>

            {/* Shipping Price */}
            <div className="space-y-2">
              <Label
                htmlFor="shipping"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("admin.modals.addShipping.shippingPrice")}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="shipping"
                type="number"
                step="0.01"
                min="0"
                value={shipping}
                onChange={(e) => setShipping(e.target.value)}
                placeholder={t("admin.modals.addShipping.shippingPlaceholder")}
                disabled={isSubmitting}
                className="h-11 rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-11 rounded-xl"
            >
              {t("admin.modals.addShipping.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={!isSubmitEnabled}
              className="h-11 rounded-xl bg-[#429de6] text-white hover:bg-[#3a8acc] disabled:opacity-50"
            >
              {isSubmitting
                ? t("admin.modals.addShipping.submitting")
                : t("admin.modals.addShipping.submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

