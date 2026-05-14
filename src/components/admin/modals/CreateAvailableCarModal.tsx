"use client";

import { useEffect, useMemo, useState } from "react";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

// Helper to sanitize numeric input (removes leading zeros, non-numeric chars)
const sanitizeNumericInput = (value: string): string => {
  // Remove non-numeric characters except for empty string
  const numericOnly = value.replace(/[^0-9]/g, "");
  // Remove leading zeros (but keep "0" if that's all there is)
  if (numericOnly === "") return "";
  return String(parseInt(numericOnly, 10));
};

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
import { FormSelect, type FormSelectOption } from "@/components/ui/form-select";
import type { CarCategory } from "@/lib/cars/types";
import { Transmission } from "@/lib/cars/types";
import { usePhotoUploads } from "@/hooks/admin/usePhotoUploads";
import { PhotoUploadGrid } from "@/components/admin/modals/PhotoUploadGrid";
import { EngineType } from "@/lib/admin/types";
import { availableCarSchema } from "@/lib/admin/schemas/availableCar.schema";
import { useCreateAvailableCar } from "@/hooks/admin/useAvailableCars";
import type { z } from "zod";

type AvailableCarFormData = z.infer<typeof availableCarSchema>;

const CAR_CATEGORY_VALUES = ["AVAILABLE", "ONROAD", "TRANSIT"] as const;
const CAR_CATEGORY_TRANSLATION_KEYS: Record<(typeof CAR_CATEGORY_VALUES)[number], string> = {
  AVAILABLE: "categoryAvailable",
  ONROAD: "categoryOnRoad",
  TRANSIT: "categoryTransit",
};

const ENGINE_TYPE_VALUES = [
  EngineType.GASOLINE,
  EngineType.DIESEL,
  EngineType.ELECTRIC,
  EngineType.HYBRID,
] as const;
const ENGINE_TYPE_TRANSLATION_KEYS: Record<(typeof ENGINE_TYPE_VALUES)[number], string> = {
  [EngineType.GASOLINE]: "engineTypeGasoline",
  [EngineType.DIESEL]: "engineTypeDiesel",
  [EngineType.ELECTRIC]: "engineTypeElectric",
  [EngineType.HYBRID]: "engineTypeHybrid",
};

const TRANSMISSION_VALUES = [
  Transmission.AUTOMATIC,
  Transmission.MECHANIC,
  Transmission.VARIATOR,
  Transmission.ROBOT,
] as const;
const TRANSMISSION_TRANSLATION_KEYS: Record<(typeof TRANSMISSION_VALUES)[number], string> = {
  [Transmission.AUTOMATIC]: "transmissionAutomatic",
  [Transmission.MECHANIC]: "transmissionMechanic",
  [Transmission.VARIATOR]: "transmissionVariator",
  [Transmission.ROBOT]: "transmissionRobot",
};

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

  const categoryOptions = useMemo<FormSelectOption[]>(
    () => CAR_CATEGORY_VALUES.map((value) => ({ value, label: t(CAR_CATEGORY_TRANSLATION_KEYS[value]) })),
    [t]
  );

  const engineTypeOptions = useMemo<FormSelectOption[]>(
    () => ENGINE_TYPE_VALUES.map((value) => ({ value, label: t(ENGINE_TYPE_TRANSLATION_KEYS[value]) })),
    [t]
  );

  const transmissionOptions = useMemo<FormSelectOption[]>(
    () => TRANSMISSION_VALUES.map((value) => ({ value, label: t(TRANSMISSION_TRANSLATION_KEYS[value]) })),
    [t]
  );
  const [photoError, setPhotoError] = useState(false);
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
      driveType: "",
      mileage: 0,
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
          driveType: "",
          mileage: 0,
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
      setPhotoError(false);
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
        driveType: "",
        mileage: 0,
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
    setPhotoError(false);
    onClose();
  };

  const onSubmit = async (data: AvailableCarFormData) => {
    // Check if at least one photo is uploaded
    const photoFiles = files.filter((file): file is File => file !== null);
    
    if (photoFiles.length === 0) {
      setPhotoError(true);
      toast.error(t("errorTitle"), {
        description: t("photoRequired"),
      });
      return;
    }
    
    setPhotoError(false);

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
      <DialogContent className="top-0 left-0 translate-x-0 translate-y-0 sm:top-[50%] sm:left-[50%] sm:-translate-x-1/2 sm:-translate-y-1/2 w-screen h-dvh max-w-none sm:w-[calc(100vw-40px)] sm:h-auto sm:max-h-[90dvh] sm:max-w-lg lg:w-[95vw] lg:min-w-[1400px] flex flex-col bg-white dark:bg-[#0b0f14] border border-gray-200 dark:border-white/10 shadow-2xl rounded-none sm:rounded-3xl p-0">
        <DialogHeader className="flex-shrink-0 px-4 sm:px-8 lg:px-16 pt-5 sm:pt-6 lg:pt-7 pb-4 sm:pb-5 border-b border-gray-200 dark:border-white/10">
          <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            {t("title")}
          </DialogTitle>
          <p className="text-sm sm:text-base text-gray-500 dark:text-white/60 mt-1 sm:mt-2">
            {t("subtitle")}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 lg:px-16 py-5 sm:py-6 lg:py-8 space-y-4 sm:space-y-5 lg:space-y-6 bg-gray-50/50 dark:bg-[#0b0f14]">
            {/* Car Photos */}
            <div className="space-y-3">
              <Label className={`block text-xs sm:text-sm font-semibold uppercase tracking-wide ${photoError ? 'text-red-500 dark:text-red-400' : 'text-gray-700 dark:text-white/90'}`}>
                {t("carPhotos")} <span className="text-red-500">*</span>
              </Label>
              <div className={`rounded-xl transition-all duration-200 ${photoError ? 'ring-2 ring-red-500 dark:ring-red-400 p-3 bg-red-50/50 dark:bg-red-950/20' : ''}`}>
                <PhotoUploadGrid
                  label=""
                  previews={previews}
                  onPickFile={(args) => {
                    setFileAt(args);
                    if (args.file) setPhotoError(false);
                  }}
                  onRemoveFile={removeFileAt}
                  onPickMultipleFiles={(files) => {
                    addMultipleFiles(files);
                    if (files.length > 0) setPhotoError(false);
                  }}
                  onReorder={reorderFiles}
                  tileClassName="h-[140px] sm:h-[160px]"
                />
              </div>
              <p className={`text-xs ${photoError ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {t("uploadHelp")}
              </p>
              {photoError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-lg">
                  <svg className="h-4 w-4 text-red-500 dark:text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">{t("photoRequired")}</p>
                </div>
              )}
            </div>

            {/* Row 1: Model, Year, VIN, Price, Category, Bought Place */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <div className="space-y-2">
                <Label htmlFor="model" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  {t("carModel")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="model"
                  {...register("carModel")}
                  placeholder={t("modelPlaceholder")}
                  className="w-full h-11 sm:h-10 px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
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
                  type="text"
                  inputMode="numeric"
                  value={formValues.carYear === 0 ? "" : formValues.carYear?.toString() || ""}
                  onChange={(e) => {
                    const sanitized = sanitizeNumericInput(e.target.value);
                    setValue("carYear", sanitized ? parseInt(sanitized, 10) : 0, { shouldValidate: true, shouldDirty: true });
                  }}
                  placeholder={t("yearPlaceholder")}
                  className="w-full h-11 sm:h-10 px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
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
                  className="w-full h-11 sm:h-10 px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200 font-mono uppercase"
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
                  type="text"
                  inputMode="numeric"
                  value={formValues.carPrice === 0 ? "" : formValues.carPrice?.toString() || ""}
                  onChange={(e) => {
                    const sanitized = sanitizeNumericInput(e.target.value);
                    setValue("carPrice", sanitized ? parseInt(sanitized, 10) : 0, { shouldValidate: true, shouldDirty: true });
                  }}
                  placeholder={t("pricePlaceholder")}
                  className="w-full h-11 sm:h-10 px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
                {isSubmitted && errors.carPrice && (
                  <p className="text-xs text-red-500 mt-1">{errors.carPrice.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <FormSelect
                  id="category"
                  value={formValues.carCategory}
                  onValueChange={(value) => setValue("carCategory", value as CarCategory, { shouldValidate: true, shouldDirty: true })}
                  options={categoryOptions}
                  label={<>{t("category")} <span className="text-red-500">*</span></>}
                  labelClassName="text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="boughtPlace" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  {t("boughtPlace")}
                </Label>
                <Input
                  id="boughtPlace"
                  {...register("boughtPlace")}
                  placeholder={t("boughtPlacePlaceholder")}
                  className="w-full h-11 sm:h-10 px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
              </div>
            </div>

            {/* Row 2: Engine Type, Horsepower, Engine Size, Transmission, Drive Type, Mileage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <div className="space-y-2">
                <FormSelect
                  id="engineType"
                  value={formValues.engineType}
                  onValueChange={(value) => setValue("engineType", value as typeof EngineType[keyof typeof EngineType], { shouldValidate: true, shouldDirty: true })}
                  options={engineTypeOptions}
                  placeholder={t("selectEngine")}
                  invalid={isSubmitted && !!errors.engineType}
                  label={<>{t("engineType")} <span className="text-red-500">*</span></>}
                  labelClassName="text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide"
                  className="w-full"
                />
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
                  type="text"
                  inputMode="numeric"
                  value={formValues.engineHp === 0 ? "" : formValues.engineHp?.toString() || ""}
                  onChange={(e) => {
                    const sanitized = sanitizeNumericInput(e.target.value);
                    setValue("engineHp", sanitized ? parseInt(sanitized, 10) : 0, { shouldValidate: true, shouldDirty: true });
                  }}
                  placeholder={t("hpPlaceholder")}
                  className="w-full h-11 sm:h-10 px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
                {isSubmitted && errors.engineHp && (
                  <p className="text-xs text-red-500 mt-1">{errors.engineHp.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="engineSize" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  {t("engineSize")}
                </Label>
                <Input
                  id="engineSize"
                  type="text"
                  inputMode="numeric"
                  value={formValues.engineSize === 0 ? "" : formValues.engineSize?.toString() || ""}
                  onChange={(e) => {
                    const sanitized = sanitizeNumericInput(e.target.value);
                    setValue("engineSize", sanitized ? parseInt(sanitized, 10) : 0, { shouldValidate: true, shouldDirty: true });
                  }}
                  className="w-full h-11 sm:h-10 px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
                {isSubmitted && errors.engineSize && (
                  <p className="text-xs text-red-500 mt-1">{errors.engineSize.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <FormSelect
                  id="transmission"
                  value={formValues.transmission}
                  onValueChange={(value) => setValue("transmission", value as typeof Transmission[keyof typeof Transmission], { shouldValidate: true, shouldDirty: true })}
                  options={transmissionOptions}
                  placeholder={t("transmissionPlaceholder")}
                  invalid={isSubmitted && !!errors.transmission}
                  label={t("transmission")}
                  labelClassName="text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide"
                  className="w-full"
                />
                {isSubmitted && errors.transmission && (
                  <p className="text-xs text-red-500 mt-1">{errors.transmission.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="driveType" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  {t("driveType")}
                </Label>
                <Input
                  id="driveType"
                  {...register("driveType")}
                  className="w-full h-11 sm:h-10 px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
                {isSubmitted && errors.driveType && (
                  <p className="text-xs text-red-500 mt-1">{errors.driveType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mileage" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  {t("mileage")}
                </Label>
                <Input
                  id="mileage"
                  type="text"
                  inputMode="numeric"
                  value={formValues.mileage === 0 ? "" : formValues.mileage?.toString() || ""}
                  onChange={(e) => {
                    const sanitized = sanitizeNumericInput(e.target.value);
                    setValue("mileage", sanitized ? parseInt(sanitized, 10) : 0, { shouldValidate: true, shouldDirty: true });
                  }}
                  className="w-full h-11 sm:h-10 px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
                {isSubmitted && errors.mileage && (
                  <p className="text-xs text-red-500 mt-1">{errors.mileage.message}</p>
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
                rows={3}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 resize-none bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
              />
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 px-4 sm:px-8 lg:px-16 py-5 sm:py-6 lg:py-7 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b0f14]">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto sm:min-w-[140px] lg:min-w-[150px] h-11 sm:h-12 text-sm font-medium border-2 border-gray-300 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 hover:dark:border-white/20 text-gray-900 dark:text-white rounded-lg transition-all duration-200"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitDisabled}
              className="w-full sm:w-auto sm:min-w-[140px] lg:min-w-[150px] h-11 sm:h-12 text-sm bg-gradient-to-r from-[#429de6] to-[#3b8ed4] hover:from-[#3a8acc] hover:to-[#3280bb] text-white font-semibold rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
