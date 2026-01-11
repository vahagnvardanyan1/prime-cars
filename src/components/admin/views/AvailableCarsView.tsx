"use client";

import { useState, useEffect } from "react";

import Image from "next/image";
import { Pencil, Plus, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslations } from "next-intl";

import type { Car } from "@/lib/cars/types";
import { Surface } from "@/components/admin/primitives/Surface";
import { RefreshButton } from "@/components/admin/primitives/RefreshButton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AvailableCarsViewProps = {
  cars: Car[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onAddCar?: () => void;
  onUpdateCar?: (car: Car) => void;
  onDeleteCar?: (car: Car) => void;
  isAdmin?: boolean;
  currentPage?: number;
  pageSize?: number;
};

export const AvailableCarsView = ({ 
  cars, 
  isLoading = false, 
  onRefresh,
  onAddCar, 
  onUpdateCar, 
  onDeleteCar, 
  isAdmin = false,
  currentPage = 1,
  pageSize = 25,
}: AvailableCarsViewProps) => {
  const t = useTranslations("admin.availableCars");
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [selectedCarPhotos, setSelectedCarPhotos] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);

  const handlePhotoClick = (photos: string[] | undefined, e: React.MouseEvent) => {
    e.stopPropagation();
    if (photos && photos.length > 0) {
      setSelectedCarPhotos(photos);
      setCurrentPhotoIndex(0);
      setImageLoading(true);
      setCarouselOpen(true);
    }
  };

  const handleNextPhoto = () => {
    setImageLoading(true);
    setCurrentPhotoIndex((prev) => 
      prev < selectedCarPhotos.length - 1 ? prev + 1 : 0
    );
  };

  const handlePrevPhoto = () => {
    setImageLoading(true);
    setCurrentPhotoIndex((prev) => 
      prev > 0 ? prev - 1 : selectedCarPhotos.length - 1
    );
  };

  // Keyboard navigation for carousel
  useEffect(() => {
    if (!carouselOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevPhoto();
      } else if (e.key === 'ArrowRight') {
        handleNextPhoto();
      } else if (e.key === 'Escape') {
        setCarouselOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [carouselOpen, selectedCarPhotos.length]);

  // Preload ALL images when carousel opens for instant navigation
  useEffect(() => {
    if (!carouselOpen || selectedCarPhotos.length === 0) return;

    // Preload all images at once
    selectedCarPhotos.forEach((photoUrl) => {
      const img = new window.Image();
      img.src = photoUrl;
    });
  }, [carouselOpen, selectedCarPhotos]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <Surface>
        <div className="px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">
              Available Cars
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {t("showing", { count: cars?.length || 0 })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && onAddCar && (
              <Button
                type="button"
                onClick={onAddCar}
                className="h-9 rounded-xl bg-[#429de6] text-white hover:bg-[#3a8acc] flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Car</span>
              </Button>
            )}
            {onRefresh && (
              <RefreshButton onClick={onRefresh} isLoading={isLoading} />
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 dark:border-white/10">
                <TableHead className="text-center w-16">{t("table.number")}</TableHead>
                <TableHead className="min-w-[100px]">{t("table.photo")}</TableHead>
                <TableHead className="min-w-[200px]">{t("table.model")}</TableHead>
                <TableHead className="min-w-[100px]">{t("table.year")}</TableHead>
                <TableHead className="min-w-[160px]">{t("table.vin")}</TableHead>
                <TableHead className="min-w-[140px]">{t("table.price")}</TableHead>
                <TableHead className="min-w-[120px]">{t("table.category")}</TableHead>
                <TableHead className="min-w-[140px]">{t("table.location")}</TableHead>
                <TableHead className="min-w-[120px]">{t("table.engine")}</TableHead>
                <TableHead className="min-w-[100px]">{t("table.hp")}</TableHead>
                <TableHead className="min-w-[140px]">{t("table.transmission")}</TableHead>
                {isAdmin && <TableHead className="text-center min-w-[160px]">{t("table.actions")}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 12 : 11} className="py-12">
                    <div className="flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#429de6]" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : !cars || cars.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 12 : 11} className="py-12">
                    <div className="flex items-center justify-center text-center text-sm text-gray-600 dark:text-gray-400">
                      {t("noCarsFound")}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                cars.map((car, index) => (
                  <TableRow key={car.id} className="hover:bg-gray-50/70 dark:hover:bg-white/5">
                    {/* Row Number */}
                    <TableCell className="px-4 py-6 text-center">
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {(currentPage - 1) * pageSize + index}
                      </div>
                    </TableCell>
                    
                    {/* Photo (Clickable) */}
                    <TableCell className="px-4 py-6">
                      {car.imageUrl && (
                        <button
                          onClick={(e) => handlePhotoClick(car.photos, e)}
                          className="relative h-16 w-20 overflow-hidden rounded-xl ring-1 ring-gray-200 dark:ring-white/10 flex-shrink-0 hover:ring-2 hover:ring-[#429de6] transition-all cursor-pointer"
                        >
                          <Image
                            src={car.imageUrl}
                            alt={car.model}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                          {car.photos && car.photos.length > 1 && (
                            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                              +{car.photos.length - 1}
                            </div>
                          )}
                        </button>
                      )}
                    </TableCell>

                    {/* Model */}
                    <TableCell className="px-4 py-6">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {car.model}
                      </div>
                    </TableCell>
                    
                    {/* Year */}
                    <TableCell className="px-4 py-6">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {car.year}
                      </div>
                    </TableCell>
                    
                    {/* VIN */}
                    <TableCell className="px-4 py-6">
                      <div className="text-sm text-gray-900 dark:text-white font-mono">
                        {car.vin || "-"}
                      </div>
                    </TableCell>
                    
                    {/* Price */}
                    <TableCell className="px-4 py-6">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatPrice(car.priceUsd)}
                      </div>
                    </TableCell>
                    
                    {/* Category */}
                    <TableCell className="px-4 py-6">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        car.category === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                        car.category === 'ONROAD' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                      }`}>
                        {car.category}
                      </span>
                    </TableCell>
                    
                    {/* Location */}
                    <TableCell className="px-4 py-6">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {car.location || "-"}
                      </div>
                    </TableCell>
                    
                    {/* Engine */}
                    <TableCell className="px-4 py-6">
                      <div className="text-sm text-gray-900 dark:text-white capitalize">
                        {car.engine?.toLowerCase() || "-"}
                      </div>
                    </TableCell>
                    
                    {/* Horsepower */}
                    <TableCell className="px-4 py-6">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {car.horsepower ? `${car.horsepower} HP` : "-"}
                      </div>
                    </TableCell>
                    
                    {/* Transmission */}
                    <TableCell className="px-4 py-6">
                      <div className="text-sm text-gray-900 dark:text-white capitalize">
                        {car.transmission?.toLowerCase() || "-"}
                      </div>
                    </TableCell>
                    
                    {/* Actions */}
                    {isAdmin && (
                      <TableCell className="px-4 py-6 text-center pr-6 sm:pr-8">
                        <div className="flex items-center justify-center gap-2">
                          {onUpdateCar && (
                            <Button
                              onClick={() => onUpdateCar(car)}
                              variant="outline"
                              size="sm"
                              className="h-9 px-3 gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:border-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-950/50 dark:hover:border-blue-800 dark:hover:text-blue-300 transition-all"
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="hidden sm:inline">{t("table.update")}</span>
                            </Button>
                          )}
                          {onDeleteCar && (
                            <Button
                              onClick={() => onDeleteCar(car)}
                              variant="outline"
                              size="sm"
                              className="h-9 px-3 gap-2 border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-400 hover:text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50 dark:hover:border-red-700 dark:hover:text-red-300 transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="hidden sm:inline">{t("table.delete")}</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Surface>

      {/* Photo Lightbox Modal */}
      {carouselOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          {/* Close Button */}
          <button
            onClick={() => setCarouselOpen(false)}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-all z-20"
            aria-label="Close"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>

          {/* Previous Button */}
          {selectedCarPhotos.length > 1 && (
            <button
              onClick={handlePrevPhoto}
              className="absolute left-2 sm:left-4 p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all z-20"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
          )}

          {/* Main Image */}
          <div className="relative w-full max-w-7xl h-[85vh] sm:h-[90vh] flex items-center justify-center">
            {/* Loading Spinner */}
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
              </div>
            )}
            
            {selectedCarPhotos.length > 0 && (
              <img
                src={selectedCarPhotos[currentPhotoIndex]}
                alt={`Photo ${currentPhotoIndex + 1}`}
                className={`max-w-full max-h-full object-contain transition-opacity duration-200 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={() => setImageLoading(false)}
              />
            )}
          </div>

          {/* Next Button */}
          {selectedCarPhotos.length > 1 && (
            <button
              onClick={handleNextPhoto}
              className="absolute right-2 sm:right-4 p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all z-20"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
          )}

          {/* Photo Counter */}
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm rounded-full">
            <span className="text-white text-xs sm:text-sm font-medium">
              {currentPhotoIndex + 1} / {selectedCarPhotos.length}
            </span>
          </div>
        </div>
      )}
    </>
  );
};
