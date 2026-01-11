"use client";

import { useState, useEffect } from "react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

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
import { usePhotoUploads } from "@/hooks/admin/usePhotoUploads";
import { PhotoUploadGrid } from "@/components/admin/modals/PhotoUploadGrid";
import { updateAvailableCar } from "@/lib/admin/updateAvailableCar";

type UpdateAvailableCarModalProps = {
  isOpen: boolean;
  onClose: () => void;
  car: Car;
  onSuccess: () => void;
};

type FormData = {
  brand: string;
  model: string;
  year: number;
  priceUsd: number;
  category: CarCategory;
  location?: string;
  engine?: string;
  horsepower?: number;
  fuelType?: string;
  transmission?: string;
  estimatedArrival?: string;
  shippingProgress?: number;
};

export const UpdateAvailableCarModal = ({
  isOpen,
  onClose,
  car,
  onSuccess,
}: UpdateAvailableCarModalProps) => {
  const t = useTranslations("admin.modals.updateAvailableCar");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    brand: car.brand,
    model: car.model,
    year: car.year,
    priceUsd: car.priceUsd,
    category: car.category,
    location: car.location || "",
    engine: car.engine || "",
    horsepower: car.horsepower || 0,
    fuelType: car.fuelType || "",
    transmission: car.transmission || "",
    estimatedArrival: car.estimatedArrival || "",
    shippingProgress: car.shippingProgress || 0,
  });

  // Photo management
  const { files, previews: newPreviews, setFileAt, removeFileAt, clearAll, addMultipleFiles } = usePhotoUploads({ 
    maxFiles: 50, 
    initialSlots: 1 
  });
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        brand: car.brand,
        model: car.model,
        year: car.year,
        priceUsd: car.priceUsd,
        category: car.category,
        location: car.location || "",
        engine: car.engine || "",
        horsepower: car.horsepower || 0,
        fuelType: car.fuelType || "",
        transmission: car.transmission || "",
        estimatedArrival: car.estimatedArrival || "",
        shippingProgress: car.shippingProgress || 0,
      });
      
      // Initialize photos
      const carPhotos = car.photos || [];
      console.log("🖼️ Initializing modal with photos:", carPhotos);
      setExistingPhotos(carPhotos);
      setPhotosToDelete([]);
      clearAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, car.id]);

  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Filter out null files to get only new photos
      const newPhotoFiles = files.filter((file): file is File => file !== null);
      
      // Map form data to backend expected format
      const updateData = {
        carModel: `${formData.brand} ${formData.model}`.trim(),
        carYear: formData.year,
        carVin: car.vin || "", // Keep original VIN
        carPrice: formData.priceUsd,
        carCategory: formData.category,
        engineType: formData.fuelType || "",
        engineHp: formData.horsepower || 0,
        engineSize: parseFloat(formData.engine || "0") || 0,
        boughtPlace: formData.location || "",
        transmission: formData.transmission || "",
      };

      const response = await updateAvailableCar({ 
        id: car.id, 
        data: updateData,
        photosToDelete,
        newPhotos: newPhotoFiles
      });

      if (response.success) {
        // Call onSuccess first to trigger data reload in parent
        onSuccess();
        // Then close the modal
        onClose();
      } else {
        // Ensure error is always a string
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : "An unexpected error occurred";
        
        console.error("Update failed:", response.error);
        toast.error("Failed to Update Car", { 
          description: errorMessage
        });
      }
    } catch (error) {
      console.error("Error updating car:", error);
      toast.error("Failed to Update Car", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
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

        <form onSubmit={handleSubmit} className="space-y-0">
          <div className="px-4 sm:px-8 lg:px-16 py-5 sm:py-6 lg:py-8 space-y-4 sm:space-y-5 lg:space-y-6 bg-gray-50/50 dark:bg-[#0b0f14]">
          {/* Car Photos */}
          <div className="space-y-3">
            <Label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
              Existing Car Photos {existingPhotos.length > 0 && `(${existingPhotos.length})`}
            </Label>
            
            {/* Existing Photos - Readonly, can only be deleted */}
            {existingPhotos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {existingPhotos.map((photoUrl, index) => (
                  <div key={`existing-${index}`} className="group relative h-[140px] sm:h-[160px] overflow-hidden rounded-2xl border border-solid border-gray-200 dark:border-white/10">
                    <img
                      src={photoUrl}
                      alt={`Car photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0 opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-1 text-[11px] font-medium text-gray-900 opacity-0 transition-opacity group-hover:opacity-100">
                      Photo {index + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const photoUrl = existingPhotos[index];
                        if (photoUrl) {
                          setPhotosToDelete((prev) => [...prev, photoUrl]);
                          setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
                        }
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
                Add New Photos
              </Label>
              <PhotoUploadGrid
                label=""
                previews={newPreviews}
                onPickFile={setFileAt}
                onRemoveFile={removeFileAt}
                onPickMultipleFiles={addMultipleFiles}
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
          </div>

          {/* Basic Information */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-gray-700 dark:text-white/80">
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
              <div className="space-y-2">
                <Label htmlFor="brand" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide whitespace-nowrap">
                  Brand <span className="text-red-500 dark:text-red-400">*</span>
                </Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleChange("brand", e.target.value)}
                  required
                  className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  Model <span className="text-red-500 dark:text-red-400">*</span>
                </Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleChange("model", e.target.value)}
                  required
                  className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  Year <span className="text-red-500 dark:text-red-400">*</span>
                </Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleChange("year", parseInt(e.target.value))}
                  required
                  className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceUsd" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  Price (USD) <span className="text-red-500 dark:text-red-400">*</span>
                </Label>
                <Input
                  id="priceUsd"
                  type="number"
                  value={formData.priceUsd}
                  onChange={(e) => handleChange("priceUsd", parseFloat(e.target.value))}
                  required
                  className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  Category <span className="text-red-500 dark:text-red-400">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange("category", value as CarCategory)}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Engine & Performance */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-gray-700 dark:text-white/80">
              Engine & Performance
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
              <div className="space-y-2">
                <Label htmlFor="engine" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  Engine
                </Label>
                <Input
                  id="engine"
                  value={formData.engine}
                  onChange={(e) => handleChange("engine", e.target.value)}
                  placeholder="e.g., 2.0L Turbo"
                  className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="horsepower" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  Horsepower
                </Label>
                <Input
                  id="horsepower"
                  type="number"
                  value={formData.horsepower}
                  onChange={(e) => handleChange("horsepower", parseInt(e.target.value) || 0)}
                  className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuelType" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  Fuel Type
                </Label>
                <Input
                  id="fuelType"
                  value={formData.fuelType}
                  onChange={(e) => handleChange("fuelType", e.target.value)}
                  placeholder="e.g., Gasoline, Diesel"
                  className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transmission" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                  Transmission
                </Label>
                <Input
                  id="transmission"
                  value={formData.transmission}
                  onChange={(e) => handleChange("transmission", e.target.value)}
                  placeholder="e.g., Automatic, Manual"
                  className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Shipping Information (for ONROAD category) */}
          {formData.category === "ONROAD" && (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-gray-700 dark:text-white/80">
                Shipping Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                <div className="space-y-2">
                  <Label htmlFor="estimatedArrival" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                    Estimated Arrival
                  </Label>
                  <Input
                    id="estimatedArrival"
                    type="date"
                    value={formData.estimatedArrival}
                    onChange={(e) => handleChange("estimatedArrival", e.target.value)}
                    className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingProgress" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                    Shipping Progress (%)
                  </Label>
                  <Input
                    id="shippingProgress"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.shippingProgress}
                    onChange={(e) => handleChange("shippingProgress", parseInt(e.target.value) || 0)}
                    className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          )}
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
