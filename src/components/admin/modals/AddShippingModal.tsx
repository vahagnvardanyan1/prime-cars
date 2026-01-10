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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createShipping } from "@/lib/admin/createShipping";
import { Auction } from "@/lib/admin/types";

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
  const [auction, setAuction] = useState<Auction | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSubmitEnabled = useMemo(() => {
    return (
      city.trim().length > 0 &&
      shipping.trim().length > 0 &&
      !isNaN(Number(shipping)) &&
      Number(shipping) >= 0 &&
      auction !== "" &&
      !isSubmitting
    );
  }, [city, shipping, auction, isSubmitting]);

  const handleClose = () => {
    if (isSubmitting) return;
    setCity("");
    setShipping("");
    setAuction("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmitEnabled || auction === "") return;

    setIsSubmitting(true);

    try {
      const result = await createShipping({
        city: city.trim(),
        shipping: Number(shipping),
        category: auction as Auction,
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

            {/* Auction Category */}
            <div className="space-y-2">
              <Label
                htmlFor="auction"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("admin.modals.addShipping.auctionCategory")}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Select
                value={auction}
                onValueChange={(value) => setAuction(value as Auction)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-11 rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white">
                  <SelectValue placeholder={t("admin.modals.addShipping.selectAuction")} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10">
                  {Object.values(Auction).map((auctionOption) => (
                    <SelectItem
                      key={auctionOption}
                      value={auctionOption}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5"
                    >
                      {auctionOption.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

