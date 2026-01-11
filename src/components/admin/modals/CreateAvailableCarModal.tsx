"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CarCategory } from "@/lib/cars/types";
import { createAvailableCar } from "@/lib/admin/createAvailableCar";
import { usePhotoUploads } from "@/hooks/admin/usePhotoUploads";
import { PhotoUploadGrid } from "@/components/admin/modals/PhotoUploadGrid";
import { EngineType } from "@/lib/admin/types";

type CreateAvailableCarModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

type FormData = {
  carModel: string;
  carYear: number;
  carVin: string;
  carPrice: number;
  carCategory: CarCategory;
  carDescription: string;
  engineType: EngineType | "";
  engineHp: number;
  engineSize: number;
  boughtPlace: string;
  transmission: string;
};

const initialFormData: FormData = {
  carModel: "",
  carYear: new Date().getFullYear(),
  carVin: "",
  carPrice: 0,
  carCategory: "AVAILABLE",
  carDescription: "",
  engineType: "",
  engineHp: 0,
  engineSize: 0,
  boughtPlace: "",
  transmission: "",
};

export const CreateAvailableCarModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateAvailableCarModalProps) => {
  const t = useTranslations("admin.modals.createAvailableCar");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const { files, previews, setFileAt, removeFileAt, clearAll, addMultipleFiles } = usePhotoUploads({ 
    maxFiles: 50, 
    initialSlots: 1 
  });

  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClose = () => {
    setFormData(initialFormData);
    clearAll();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Filter out null files
      const photoFiles = files.filter((file): file is File => file !== null);
      
      const result = await createAvailableCar({ 
        data: formData,
        photos: photoFiles,
      });
      
      if (result.success) {
        toast.success(t("successTitle"), {
          description: t("successDescription"),
        });
        onSuccess();
        handleClose();
      } else {
        toast.error(t("errorTitle"), {
          description: result.error || t("errorDescription"),
        });
      }
    } catch (error) {
      console.error("Error creating available car:", error);
      toast.error(t("errorTitle"), {
        description: error instanceof Error ? error.message : t("networkError"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.carModel.trim() !== "" &&
    formData.carYear > 1900 &&
    formData.carVin.trim() !== "" &&
    formData.carPrice > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-[calc(100vw-20px)] sm:w-[calc(100vw-40px)] lg:w-[95vw] lg:min-w-[1400px] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0b0f14] border border-gray-200 dark:border-white/10 shadow-2xl rounded-2xl sm:rounded-3xl p-0">
        <DialogHeader className="px-4 sm:px-8 lg:px-16 pt-5 sm:pt-6 lg:pt-7 pb-4 sm:pb-5 border-b border-gray-200 dark:border-white/10">
          <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            {t("title")}
          </DialogTitle>
          <p className="text-sm sm:text-base text-gray-500 dark:text-white/60 mt-1 sm:mt-2">
            {t("subtitle")}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-0">
          <div className="px-4 sm:px-8 lg:px-16 py-5 sm:py-6 lg:py-8 space-y-4 sm:space-y-5 lg:space-y-6 bg-gray-50/50 dark:bg-[#0b0f14]">
            {/* Car Photos */}
            <div className="space-y-3">
              <Label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                {t("carPhotos")}
              </Label>
              <PhotoUploadGrid
                label=""
                previews={previews}
                onPickFile={setFileAt}
                onRemoveFile={removeFileAt}
                onPickMultipleFiles={addMultipleFiles}
                tileClassName="h-[140px] sm:h-[160px]"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("uploadHelp")}
              </p>
            </div>

            {/* Row 1: Model, Year, VIN, Price, Category, Bought Place */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
              <div className="space-y-2">
                <Label htmlFor="model" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  {t("carModel")} *
                </Label>
                <Input
                  id="model"
                  value={formData.carModel}
                  onChange={(e) => handleChange("carModel", e.target.value)}
                  placeholder="BMW X5"
                  required
                  className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  {t("year")} *
                </Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.carYear}
                  onChange={(e) => handleChange("carYear", parseInt(e.target.value) || 0)}
                  placeholder="2024"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  required
                  className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vin" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  {t("vin")} *
                </Label>
                <Input
                  id="vin"
                  value={formData.carVin}
                  onChange={(e) => handleChange("carVin", e.target.value.toUpperCase())}
                  placeholder={t("vinPlaceholder")}
                  maxLength={17}
                  required
                  className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  {t("priceUsd")} *
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.carPrice}
                  onChange={(e) => handleChange("carPrice", parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  step="1"
                  required
                  className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  {t("category")} *
                </Label>
                <Select
                  value={formData.carCategory}
                  onValueChange={(value) => handleChange("carCategory", value as CarCategory)}
                >
                  <SelectTrigger id="category" className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#161b22] border-gray-200 dark:border-white/10 shadow-xl">
                    <SelectItem value="AVAILABLE" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 rounded-md">{t("categoryAvailable")}</SelectItem>
                    <SelectItem value="ONROAD" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 rounded-md">{t("categoryOnRoad")}</SelectItem>
                    <SelectItem value="TRANSIT" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 rounded-md">{t("categoryTransit")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="boughtPlace" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  {t("boughtPlace")}
                </Label>
                <Input
                  id="boughtPlace"
                  value={formData.boughtPlace}
                  onChange={(e) => handleChange("boughtPlace", e.target.value)}
                  placeholder={t("boughtPlacePlaceholder")}
                  className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
              </div>
            </div>

            {/* Row 2: Engine Type, Horsepower, Engine Size, Transmission */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              <div className="space-y-2">
                <Label htmlFor="engineType" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  {t("engineType")}
                </Label>
                <Select
                  value={formData.engineType || "none"}
                  onValueChange={(value) => handleChange("engineType", value === "none" ? "" : value)}
                >
                  <SelectTrigger id="engineType" className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 transition-all duration-200">
                    <SelectValue placeholder={t("selectEngine")} />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#161b22] border-gray-200 dark:border-white/10 shadow-xl">
                    <SelectItem value="none" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 rounded-md">None</SelectItem>
                    <SelectItem value={EngineType.GASOLINE} className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 rounded-md">{t("engineTypeGasoline")}</SelectItem>
                    <SelectItem value={EngineType.DIESEL} className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 rounded-md">{t("engineTypeDiesel")}</SelectItem>
                    <SelectItem value={EngineType.ELECTRIC} className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 rounded-md">{t("engineTypeElectric")}</SelectItem>
                    <SelectItem value={EngineType.HYBRID} className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 rounded-md">{t("engineTypeHybrid")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="engineHp" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  {t("engineHp")}
                </Label>
                <Input
                  id="engineHp"
                  type="number"
                  value={formData.engineHp || ""}
                  onChange={(e) => handleChange("engineHp", parseInt(e.target.value) || 0)}
                  placeholder="HP"
                  min="0"
                  className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="engineSize" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  {t("engineSize")}
                </Label>
                <Input
                  id="engineSize"
                  type="number"
                  value={formData.engineSize || ""}
                  onChange={(e) => handleChange("engineSize", parseFloat(e.target.value) || 0)}
                  placeholder="L"
                  min="0"
                  step="0.1"
                  className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transmission" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  {t("transmission")}
                </Label>
                <Input
                  id="transmission"
                  value={formData.transmission}
                  onChange={(e) => handleChange("transmission", e.target.value)}
                  placeholder={t("transmissionPlaceholder")}
                  className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
              </div>
            </div>

            {/* Row 3: Description */}
            <div className="space-y-2 pt-1 sm:pt-2">
              <Label htmlFor="description" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                {t("description")}
              </Label>
              <Textarea
                id="description"
                value={formData.carDescription}
                onChange={(e) => handleChange("carDescription", e.target.value)}
                placeholder={t("descriptionPlaceholder")}
                rows={3}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 resize-none bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 px-4 sm:px-8 lg:px-16 py-5 sm:py-6 lg:py-7 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b0f14]">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto sm:min-w-[140px] lg:min-w-[150px] h-11 sm:h-12 text-[15px] sm:text-[16px] font-medium border-2 border-gray-300 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 hover:dark:border-white/20 text-gray-900 dark:text-white rounded-lg transition-all duration-200"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="w-full sm:w-auto sm:min-w-[140px] lg:min-w-[150px] h-11 sm:h-12 text-[15px] sm:text-[16px] bg-gradient-to-r from-[#429de6] to-[#3b8ed4] hover:from-[#3a8acc] hover:to-[#3280bb] text-white font-semibold rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t("submitting")}</span>
                </div>
              ) : (
                t("submit")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
