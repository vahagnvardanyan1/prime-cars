"use client";

import { useEffect } from "react";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

// Constants to avoid hydration issues
const CURRENT_YEAR = 2026;

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
import { Transmission } from "@/lib/cars/types";
import { usePhotoUploads } from "@/hooks/admin/usePhotoUploads";
import { PhotoUploadGrid } from "@/components/admin/modals/PhotoUploadGrid";
import { EngineType } from "@/lib/admin/types";
import { availableCarSchema } from "@/lib/admin/schemas/availableCar.schema";
import { useCreateAvailableCar } from "@/hooks/admin/useAvailableCars";
import type { z } from "zod";

type AvailableCarFormData = z.infer<typeof availableCarSchema>;

type CreateAvailableCarModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export const CreateAvailableCarModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateAvailableCarModalProps) => {
  const t = useTranslations("admin.modals.createAvailableCar");
  const { files, previews, setFileAt, removeFileAt, clearAll, addMultipleFiles, reorderFiles } = usePhotoUploads({ 
    maxFiles: 50, 
    initialSlots: 1 
  });

  const form = useForm<AvailableCarFormData>({
    resolver: zodResolver(availableCarSchema),
    mode: "onChange", // Validate on change after first submit
    reValidateMode: "onChange",
    defaultValues: {
      carModel: "",
      carYear: CURRENT_YEAR,
      carVin: "",
      carPrice: 0,
      carCategory: "AVAILABLE",
      carDescription: "",
      engineType: EngineType.GASOLINE,
      engineHp: 0,
      engineSize: 0,
      boughtPlace: "",
      transmission: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors, isSubmitted },
    reset,
    setValue,
    watch,
  } = form;

  const createMutation = useCreateAvailableCar();

  // Watch all fields together for better performance
  const formValues = watch();

  // Simple check: enable button if basic required fields have any content
  // Let the validation schema handle detailed validation on submit
  // engineType defaults to GASOLINE so no need to check
  const hasBasicRequiredFields = 
    formValues.carModel && formValues.carModel.trim().length > 0 && 
    formValues.carVin && formValues.carVin.trim().length > 0 && 
    formValues.carPrice !== undefined && formValues.carPrice !== null &&
    formValues.carYear !== undefined && formValues.carYear !== null &&
    formValues.carCategory;

  const isSubmitDisabled = !hasBasicRequiredFields || isSubmitting;

  useEffect(() => {
    if (isOpen) {
      reset(
        {
          carModel: "",
          carYear: CURRENT_YEAR,
          carVin: "",
          carPrice: 0,
          carCategory: "AVAILABLE",
          carDescription: "",
          engineType: EngineType.GASOLINE,
          engineHp: 0,
          engineSize: 0,
          boughtPlace: "",
          transmission: "",
        },
        {
          keepErrors: false,
          keepDirty: false,
          keepIsSubmitted: false,
          keepTouched: false,
          keepIsValid: false,
          keepSubmitCount: false,
        }
      );
      clearAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleClose = () => {
    reset(
      {
        carModel: "",
        carYear: CURRENT_YEAR,
        carVin: "",
        carPrice: 0,
        carCategory: "AVAILABLE",
        carDescription: "",
        engineType: EngineType.GASOLINE,
        engineHp: 0,
        engineSize: 0,
        boughtPlace: "",
        transmission: "",
      },
      {
        keepErrors: false,
        keepDirty: false,
        keepIsSubmitted: false,
        keepTouched: false,
        keepIsValid: false,
        keepSubmitCount: false,
      }
    );
    clearAll();
    onClose();
  };

  const onSubmit = async (data: AvailableCarFormData) => {
    // Check if at least one photo is uploaded
    const photoFiles = files.filter((file): file is File => file !== null);
    
    if (photoFiles.length === 0) {
      toast.error(t("errorTitle"), {
        description: t("photoRequired"),
      });
      return;
    }

    // The Zod schema validation happens automatically via zodResolver
    // If we reach here, form validation has passed
    try {
      await createMutation.mutateAsync({
        data,
        photos: photoFiles,
      });

      toast.success(t("successTitle"), {
        description: t("successDescription"),
      });
      
      onSuccess();
      handleClose();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(t("errorTitle"), {
          description: error.message,
        });
      } else {
        toast.error(t("errorTitle"), {
          description: t("networkError"),
        });
      }
    }
  };

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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
          <div className="px-4 sm:px-8 lg:px-16 py-5 sm:py-6 lg:py-8 space-y-4 sm:space-y-5 lg:space-y-6 bg-gray-50/50 dark:bg-[#0b0f14]">
            {/* Car Photos */}
            <div className="space-y-3">
              <Label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                {t("carPhotos")} <span className="text-red-500">*</span>
              </Label>
              <PhotoUploadGrid
                label=""
                previews={previews}
                onPickFile={setFileAt}
                onRemoveFile={removeFileAt}
                onPickMultipleFiles={addMultipleFiles}
                onReorder={reorderFiles}
                tileClassName="h-[140px] sm:h-[160px]"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("uploadHelp")}
              </p>
              {isSubmitted && files.filter((file): file is File => file !== null).length === 0 && (
                <p className="text-xs text-red-500">{t("photoRequired")}</p>
              )}
            </div>

            {/* Row 1: Model, Year, VIN, Price, Category, Bought Place */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
              <div className="space-y-2">
                <Label htmlFor="model" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  {t("carModel")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="model"
                  {...register("carModel")}
                  placeholder={t("modelPlaceholder")}
                  className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
                {isSubmitted && errors.carModel && (
                  <p className="text-xs text-red-500 mt-1">{errors.carModel.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="year" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  {t("year")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="year"
                  type="number"
                  {...register("carYear", { valueAsNumber: true })}
                  placeholder={t("yearPlaceholder")}
                  className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
                {isSubmitted && errors.carYear && (
                  <p className="text-xs text-red-500 mt-1">{errors.carYear.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vin" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  {t("vin")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="vin"
                  {...register("carVin")}
                  placeholder={t("vinPlaceholder")}
                  maxLength={17}
                  className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200 font-mono uppercase"
                />
                {isSubmitted && errors.carVin && (
                  <p className="text-xs text-red-500 mt-1">{errors.carVin.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  {t("priceUsd")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register("carPrice", { valueAsNumber: true })}
                  placeholder={t("pricePlaceholder")}
                  className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
                {isSubmitted && errors.carPrice && (
                  <p className="text-xs text-red-500 mt-1">{errors.carPrice.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  {t("category")} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formValues.carCategory}
                  onValueChange={(value) => setValue("carCategory", value as CarCategory, { shouldValidate: true, shouldDirty: true })}
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
                  {...register("boughtPlace")}
                  placeholder={t("boughtPlacePlaceholder")}
                  className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
              </div>
            </div>

            {/* Row 2: Engine Type, Horsepower, Engine Size, Transmission */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              <div className="space-y-2">
                <Label htmlFor="engineType" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  {t("engineType")} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formValues.engineType}
                  onValueChange={(value) => setValue("engineType", value as typeof EngineType[keyof typeof EngineType], { shouldValidate: true, shouldDirty: true })}
                >
                  <SelectTrigger id="engineType" className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 transition-all duration-200">
                    <SelectValue placeholder={t("selectEngine")} />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#161b22] border-gray-200 dark:border-white/10 shadow-xl">
                    <SelectItem value={EngineType.GASOLINE} className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 rounded-md">{t("engineTypeGasoline")}</SelectItem>
                    <SelectItem value={EngineType.DIESEL} className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 rounded-md">{t("engineTypeDiesel")}</SelectItem>
                    <SelectItem value={EngineType.ELECTRIC} className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 rounded-md">{t("engineTypeElectric")}</SelectItem>
                    <SelectItem value={EngineType.HYBRID} className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 rounded-md">{t("engineTypeHybrid")}</SelectItem>
                  </SelectContent>
                </Select>
                {isSubmitted && errors.engineType && (
                  <p className="text-xs text-red-500 mt-1">{errors.engineType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="engineHp" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  {t("engineHp")}
                </Label>
                <Input
                  id="engineHp"
                  type="number"
                  {...register("engineHp", { valueAsNumber: true })}
                  placeholder={t("hpPlaceholder")}
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
                  step="0.1"
                  {...register("engineSize", { valueAsNumber: true })}
                  placeholder={t("enginePlaceholder")}
                  className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transmission" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  {t("transmission")}
                </Label>
                <Select
                  value={formValues.transmission}
                  onValueChange={(value) => setValue("transmission", value as typeof Transmission[keyof typeof Transmission], { shouldValidate: true, shouldDirty: true })}
                >
                  <SelectTrigger id="transmission" className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 transition-all duration-200">
                    <SelectValue placeholder={t("transmissionPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#161b22] border-gray-200 dark:border-white/10 shadow-xl">
                    <SelectItem value={Transmission.AUTOMATIC} className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 rounded-md">{t("transmissionAutomatic")}</SelectItem>
                    <SelectItem value={Transmission.MECHANIC} className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 rounded-md">{t("transmissionMechanic")}</SelectItem>
                    <SelectItem value={Transmission.VARIATOR} className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 rounded-md">{t("transmissionVariator")}</SelectItem>
                    <SelectItem value={Transmission.ROBOT} className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 rounded-md">{t("transmissionRobot")}</SelectItem>
                  </SelectContent>
                </Select>
                {isSubmitted && errors.transmission && (
                  <p className="text-xs text-red-500 mt-1">{errors.transmission.message}</p>
                )}
              </div>
            </div>

            {/* Row 3: Description */}
            <div className="space-y-2 pt-1 sm:pt-2">
              <Label htmlFor="description" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                {t("description")}
              </Label>
              <Textarea
                id="description"
                {...register("carDescription")}
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
              disabled={isSubmitDisabled}
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
