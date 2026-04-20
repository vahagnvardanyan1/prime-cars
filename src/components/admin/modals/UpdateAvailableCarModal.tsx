"use client";

import { useState, useEffect, useCallback } from "react";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

// Helper to sanitize numeric input (removes leading zeros, non-numeric chars)
const sanitizeNumericInput = (value: string): string => {
  // Remove non-numeric characters except for empty string
  const numericOnly = value.replace(/[^0-9]/g, "");
  // Remove leading zeros (but keep "0" if that's all there is)
  if (numericOnly === "") return "";
  return String(parseInt(numericOnly, 10));
};

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { Car, CarCategory } from "@/lib/cars/types";
import { Transmission } from "@/lib/cars/types";
import { EngineType } from "@/lib/admin/types";
import { usePhotoUploads } from "@/hooks/admin/usePhotoUploads";
import { PhotoUploadGrid } from "@/components/admin/modals/PhotoUploadGrid";
import type { UpdateAvailableCarFormData } from "@/lib/admin/schemas/availableCar.schema";
import { useUpdateAvailableCar } from "@/hooks/admin/useAvailableCars";

type UpdateAvailableCarModalProps = {
  isOpen: boolean;
  onClose: () => void;
  car: Car;
  onSuccess: () => void;
};

// Constants to avoid hydration issues
const CURRENT_YEAR = 2026;
const MAX_YEAR = CURRENT_YEAR + 2;

// Create a form-specific schema that matches the UI structure
const updateFormSchema = z.object({
  model: z.string().min(1, "Model is required").optional().or(z.literal("")),
  year: z.number({ message: "Year must be a number" }).min(1900).max(MAX_YEAR).optional(),
  priceUsd: z.number({ message: "Price must be a number" }).positive("Price must be greater than 0").optional(),
  category: z.enum(["AVAILABLE", "ONROAD", "TRANSIT"]).optional(),
  location: z.string().optional().or(z.literal("")),
  engine: z.string().optional().or(z.literal("")),
  horsepower: z.number({ message: "Horsepower must be a number" }).optional().or(z.literal(0)),
  fuelType: z.enum([EngineType.GASOLINE, EngineType.DIESEL, EngineType.ELECTRIC, EngineType.HYBRID]).optional().or(z.literal("")),
  transmission: z.enum([Transmission.AUTOMATIC, Transmission.MECHANIC, Transmission.VARIATOR, Transmission.ROBOT]).optional().or(z.literal("")),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional().or(z.literal("")),
});

type FormData = z.infer<typeof updateFormSchema>;

export const UpdateAvailableCarModal = ({
  isOpen,
  onClose,
  car,
  onSuccess,
}: UpdateAvailableCarModalProps) => {
  const t = useTranslations("admin.modals.updateAvailableCar");
  
  // Photo management
  const { files, previews: newPreviews, setFileAt, removeFileAt, clearAll, addMultipleFiles, reorderFiles } = usePhotoUploads({ 
    maxFiles: 50, 
    initialSlots: 1 
  });
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitted },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(updateFormSchema),
    mode: "onChange",
    defaultValues: {
      model: "",
      year: 0,
      priceUsd: 0,
      category: "AVAILABLE",
      location: "",
      engine: "",
      horsepower: 0,
      fuelType: "",
      transmission: "",
      description: "",
    },
  });

  const updateMutation = useUpdateAvailableCar();

  const category = watch("category");
  const transmission = watch("transmission");
  const fuelType = watch("fuelType");
  const yearValue = watch("year");
  const priceUsdValue = watch("priceUsd");
  const horsepowerValue = watch("horsepower");

  useEffect(() => {
    if (isOpen) {
      reset({
        model: car.model,
        year: car.year,
        priceUsd: car.priceUsd,
        category: car.category,
        location: car.location || "",
        engine: car.engineSize?.toString() || "",
        horsepower: car.horsepower || 0,
        fuelType: (car.fuelType as typeof EngineType[keyof typeof EngineType]) || "",
        transmission: (car.transmission as typeof Transmission[keyof typeof Transmission]) || "",
        description: car.description || "",
      });
      
      // Initialize photos
      const carPhotos = car.photos || [];
      setExistingPhotos(carPhotos);
      setPhotosToDelete([]);
      setPhotoError("");
      clearAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, car.id]);

  const handleRemoveExistingPhoto = useCallback((index: number) => {
    const photoUrl = existingPhotos[index];
    if (photoUrl) {
      setPhotosToDelete((prev) => [...prev, photoUrl]);
      setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
    }
  }, [existingPhotos]);

  const handleReorderExistingPhotos = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    setExistingPhotos((prev) => {
      const updated = [...prev];
      const [movedPhoto] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedPhoto);
      return updated;
    });
  }, []);

  const onSubmit = async (formData: FormData) => {
    // Filter out null files to get only new photos
    const newPhotoFiles = files.filter((file): file is File => file !== null);
    
    // Validate at least one photo exists (existing or new)
    const totalPhotos = existingPhotos.length + newPhotoFiles.length;
    if (totalPhotos === 0) {
      const errorMsg = t("photoRequired");
      setPhotoError(errorMsg);
      toast.error(t("errorTitle"), {
        description: errorMsg,
      });
      return;
    }
    
    setPhotoError("");
    
    try {
      // Map form data to backend expected format
      const updateData: UpdateAvailableCarFormData = {
        carModel: formData.model?.trim() || "",
        carYear: formData.year,
        carVin: car.vin || "",
        carPrice: formData.priceUsd,
        carCategory: formData.category,
        carDescription: formData.description || "",
        engineType: (formData.fuelType as UpdateAvailableCarFormData['engineType']) || "",
        engineHp: formData.horsepower || 0,
        engineSize: parseFloat(formData.engine || "0") || 0,
        boughtPlace: formData.location || "",
        transmission: (formData.transmission as UpdateAvailableCarFormData['transmission']) || "",
      };

      await updateMutation.mutateAsync({
        id: car.id,
        data: updateData,
        existingPhotos,
        newPhotos: newPhotoFiles,
        photosToDelete,
      });

      toast.success("Car Updated Successfully", {
        description: "The car information has been updated.",
      });

      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to Update Car", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
              Existing Car Photos {existingPhotos.length > 0 && `(${existingPhotos.length})`}
            </Label>
            
            {/* Existing Photos - Reorderable and deletable */}
            {existingPhotos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {existingPhotos.map((photoUrl, index) => (
                  <div 
                    key={photoUrl}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', index.toString());
                      e.currentTarget.style.opacity = '0.5';
                    }}
                    onDragEnd={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                      if (!isNaN(fromIndex) && fromIndex !== index) {
                        handleReorderExistingPhotos(fromIndex, index);
                      }
                    }}
                    className="group relative h-[140px] sm:h-[160px] overflow-hidden rounded-2xl border border-solid border-gray-200 dark:border-white/10 cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-[#429de6] transition-all"
                  >
                    <img
                      src={photoUrl}
                      alt={`Car photo ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0 opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-1 text-[11px] font-medium text-gray-900 opacity-0 transition-opacity group-hover:opacity-100">
                      Photo {index + 1}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveExistingPhoto(index);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110"
                      aria-label="Remove photo"
                    >
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New Photos Upload */}
            <div className="space-y-2 pt-2">
              <Label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                {t("addNewPhotos")}
              </Label>
              <PhotoUploadGrid
                label=""
                previews={newPreviews}
                onPickFile={setFileAt}
                onRemoveFile={removeFileAt}
                onPickMultipleFiles={addMultipleFiles}
                onReorder={reorderFiles}
                tileClassName="h-[140px] sm:h-[160px]"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200 dark:border-white/10">
              <p className="text-gray-500 dark:text-gray-400">
                {existingPhotos.length} existing • {files.filter(f => f !== null).length} new • Up to 25 photos total
              </p>
              {photosToDelete.length > 0 && (
                <p className="text-amber-600 dark:text-amber-400 font-medium">
                  {photosToDelete.length} photo{photosToDelete.length > 1 ? 's' : ''} will be deleted
                </p>
              )}
            </div>
            {isSubmitted && photoError && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">{photoError}</p>
            )}
          </div>

          {/* Basic Information */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-gray-700 dark:text-white/80">
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
              <div className="space-y-2">
                <Label htmlFor="model" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  Model <span className="text-red-500 dark:text-red-400">*</span>
                </Label>
                <Input
                  id="model"
                  {...register("model")}
                  placeholder={t("modelPlaceholder")}
                  className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
                {errors.model && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.model.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="year" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  Year <span className="text-red-500 dark:text-red-400">*</span>
                </Label>
                <Input
                  id="year"
                  type="text"
                  inputMode="numeric"
                  value={yearValue === 0 ? "" : yearValue?.toString() || ""}
                  onChange={(e) => {
                    const sanitized = sanitizeNumericInput(e.target.value);
                    setValue("year", sanitized ? parseInt(sanitized, 10) : 0, { shouldValidate: true, shouldDirty: true });
                  }}
                  className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
                {errors.year && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.year.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceUsd" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  Price (USD) <span className="text-red-500 dark:text-red-400">*</span>
                </Label>
                <Input
                  id="priceUsd"
                  type="text"
                  inputMode="numeric"
                  value={priceUsdValue === 0 ? "" : priceUsdValue?.toString() || ""}
                  onChange={(e) => {
                    const sanitized = sanitizeNumericInput(e.target.value);
                    setValue("priceUsd", sanitized ? parseInt(sanitized, 10) : 0, { shouldValidate: true, shouldDirty: true });
                  }}
                  className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
                {errors.priceUsd && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.priceUsd.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  Category <span className="text-red-500 dark:text-red-400">*</span>
                </Label>
                <Select
                  value={category}
                  onValueChange={(value) => setValue("category", value as CarCategory)}
                >
                  <SelectTrigger className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-white/20">
                    <SelectItem value="AVAILABLE" className="text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10">Available</SelectItem>
                    <SelectItem value="ONROAD" className="text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10">On Road</SelectItem>
                    <SelectItem value="TRANSIT" className="text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10">Transit</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  Location
                </Label>
                <Input
                  id="location"
                  {...register("location")}
                  className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
                {errors.location && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.location.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Engine & Performance */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-gray-700 dark:text-white/80">
              Engine & Performance
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              <div className="space-y-2">
                <Label htmlFor="engine"  className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  Engine Size 
                </Label>
                <Input
                  id="engine"
                  {...register("engine")}
                  type="numeric"
                  placeholder={t("enginePlaceholder")}
                  className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
                {errors.engine && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.engine.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="horsepower" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  Horsepower (HP)
                </Label>
                <Input
                  id="horsepower"
                  type="text"
                  inputMode="numeric"
                  value={horsepowerValue === 0 ? "" : horsepowerValue?.toString() || ""}
                  onChange={(e) => {
                    const sanitized = sanitizeNumericInput(e.target.value);
                    setValue("horsepower", sanitized ? parseInt(sanitized, 10) : 0, { shouldValidate: true, shouldDirty: true });
                  }}
                  className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
                {errors.horsepower && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.horsepower.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuelType" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  Fuel Type
                </Label>
                <Select
                  value={fuelType}
                  onValueChange={(value) => setValue("fuelType", value as typeof EngineType[keyof typeof EngineType])}
                >
                  <SelectTrigger id="fuelType" className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 transition-all duration-200">
                    <SelectValue placeholder={t("fuelTypePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#161b22] border-gray-200 dark:border-white/10 shadow-xl">
                    <SelectItem value={EngineType.GASOLINE} className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 rounded-md">{t("engineTypeGasoline")}</SelectItem>
                    <SelectItem value={EngineType.DIESEL} className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 rounded-md">{t("engineTypeDiesel")}</SelectItem>
                    <SelectItem value={EngineType.ELECTRIC} className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 rounded-md">{t("engineTypeElectric")}</SelectItem>
                    <SelectItem value={EngineType.HYBRID} className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 rounded-md">{t("engineTypeHybrid")}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.fuelType && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.fuelType.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="transmission" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  Transmission
                </Label>
                <Select
                  value={transmission}
                  onValueChange={(value) => setValue("transmission", value as typeof Transmission[keyof typeof Transmission])}
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
                {errors.transmission && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.transmission.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                Car Description
              </Label>
              <textarea
                id="description"
                {...register("description")}
                placeholder={t("descriptionPlaceholder")}
                rows={4}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 resize-none bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
              />
              {errors.description && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 px-4 sm:px-8 lg:px-16 py-5 sm:py-6 lg:py-7 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b0f14]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto sm:min-w-[140px] lg:min-w-[150px] h-11 sm:h-12 text-[15px] sm:text-[16px] font-medium border-2 border-gray-300 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 hover:dark:border-white/20 text-gray-900 dark:text-white rounded-lg transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto sm:min-w-[140px] lg:min-w-[150px] h-11 sm:h-12 text-[15px] sm:text-[16px] bg-gradient-to-r from-[#429de6] to-[#3b8ed4] hover:from-[#3a8acc] hover:to-[#3280bb] text-white font-semibold rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Updating...</span>
                </div>
              ) : (
                "Update Car"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
