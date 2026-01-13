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
  const [errors, setErrors] = useState<{ city?: string; shipping?: string; auction?: string }>({});

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
    setErrors({});
    onClose();
  };

  const validateForm = () => {
    const newErrors: { city?: string; shipping?: string; auction?: string } = {};

    if (!city.trim()) {
      newErrors.city = "City is required";
    } else if (city.trim().length < 2) {
      newErrors.city = "City must be at least 2 characters";
    }

    if (!shipping.trim()) {
      newErrors.shipping = "Shipping price is required";
    } else if (isNaN(Number(shipping)) || Number(shipping) <= 0) {
      newErrors.shipping = "Shipping price must be greater than 0";
    }

    if (!auction) {
      newErrors.auction = "Auction category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

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
                onChange={(e) => {
                  setCity(e.target.value);
                  if (errors.city) {
                    setErrors({ ...errors, city: undefined });
                  }
                }}
                placeholder={t("admin.modals.addShipping.cityPlaceholder")}
                disabled={isSubmitting}
                className={`h-11 rounded-xl bg-white text-gray-900 focus-visible:ring-2 dark:bg-black dark:text-white ${
                  errors.city
                    ? "border-red-500 dark:border-red-500 focus-visible:ring-red-500"
                    : "border-gray-300 dark:border-white/20 focus-visible:ring-[#429de6]"
                }`}
              />
              {errors.city && (
                <p className="text-sm text-red-500 dark:text-red-400">{errors.city}</p>
              )}
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
                onValueChange={(value) => {
                  setAuction(value as Auction);
                  if (errors.auction) {
                    setErrors({ ...errors, auction: undefined });
                  }
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger className={`h-11 rounded-xl bg-white text-gray-900 focus-visible:ring-2 dark:bg-black dark:text-white ${
                  errors.auction
                    ? "border-red-500 dark:border-red-500 focus-visible:ring-red-500"
                    : "border-gray-300 dark:border-white/20 focus-visible:ring-[#429de6]"
                }`}>
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
              {errors.auction && (
                <p className="text-sm text-red-500 dark:text-red-400">{errors.auction}</p>
              )}
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
                onChange={(e) => {
                  setShipping(e.target.value);
                  if (errors.shipping) {
                    setErrors({ ...errors, shipping: undefined });
                  }
                }}
                placeholder={t("admin.modals.addShipping.shippingPlaceholder")}
                disabled={isSubmitting}
                className={`h-11 rounded-xl bg-white text-gray-900 focus-visible:ring-2 dark:bg-black dark:text-white ${
                  errors.shipping
                    ? "border-red-500 dark:border-red-500 focus-visible:ring-red-500"
                    : "border-gray-300 dark:border-white/20 focus-visible:ring-[#429de6]"
                }`}
              />
              {errors.shipping && (
                <p className="text-sm text-red-500 dark:text-red-400">{errors.shipping}</p>
              )}
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

