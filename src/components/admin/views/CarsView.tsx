"use client";

import { useState, useEffect } from "react";

import Image from "next/image";

import { Download, Pencil, Plus, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslations } from "next-intl";

import type { AdminCar } from "@/lib/admin/types";
import { formatUsd } from "@/lib/admin/format";
import { Surface } from "@/components/admin/primitives/Surface";
import { PaymentStatus } from "@/components/admin/primitives/PaymentStatus";
import { RefreshButton } from "@/components/admin/primitives/RefreshButton";
import { Pagination } from "@/components/admin/primitives/Pagination";
import { CarFilters, type CarFiltersState } from "@/components/admin/filters/CarFilters";
import { Button } from "@/components/ui/button";
import { DownloadImagesButton } from "@/components/ui/DownloadImagesButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CarsViewProps = {
  cars: AdminCar[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onAddCar?: () => void;
  onUpdateCar?: (car: AdminCar) => void;
  onDeleteCar?: (car: AdminCar) => void;
  isAdmin?: boolean;
  filters?: CarFiltersState;
  onFiltersChange?: (filters: CarFiltersState) => void;
  onClearFilters?: () => void;
  // Pagination
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
};

export const CarsView = ({ 
  cars, 
  isLoading = false, 
  onRefresh, 
  onAddCar, 
  onUpdateCar, 
  onDeleteCar, 
  isAdmin = false,
  filters,
  onFiltersChange,
  onClearFilters,
  // Pagination
  currentPage = 1,
  totalPages = 1,
  pageSize = 25,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
}: CarsViewProps) => {
  const t = useTranslations();
  const tTable = useTranslations("carsTable");
  
  // Photo carousel state
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "-";
    }
  };

  return (
    <>
    <Surface>
      <div className="px-6 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold text-gray-900 dark:text-white">
            {tTable("title")}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {tTable("showing")} {cars?.length || 0} {cars?.length === 1 ? tTable("carSingular") : tTable("cars")}
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
              <span className="hidden sm:inline">{tTable("addCar")}</span>
            </Button>
          )}
          {onRefresh && (
            <RefreshButton onClick={onRefresh} isLoading={isLoading} />
          )}
        </div>
      </div>

      {/* Filters */}
      {filters && onFiltersChange && onClearFilters && (
        <CarFilters
          filters={filters}
          onFiltersChange={onFiltersChange}
          onClearFilters={onClearFilters}
        />
      )}

      <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/70 hover:bg-gray-50/70 dark:bg-white/5">
            <TableHead className="px-4 py-4 text-center text-sm font-semibold w-[60px]">#</TableHead>
            <TableHead className="px-4 py-4 text-sm font-semibold min-w-[100px]">{tTable("photos")}</TableHead>
            <TableHead className="px-4 py-4 text-sm font-semibold min-w-[140px]">{tTable("purchaseDate")}</TableHead>
            <TableHead className="px-6 py-4 sm:px-8 text-sm font-semibold min-w-[200px]">{tTable("car")}</TableHead>
            <TableHead className="px-4 py-4 text-sm font-semibold min-w-[140px]">{tTable("lot")}</TableHead>
            <TableHead className="px-4 py-4 text-sm font-semibold min-w-[160px]">{tTable("vin")}</TableHead>
            <TableHead className="px-4 py-4 text-sm font-semibold min-w-[120px]">{tTable("auction")}</TableHead>
            <TableHead className="px-4 py-4 text-sm font-semibold min-w-[140px]">{tTable("client")}</TableHead>
            <TableHead className="px-4 py-4 text-sm font-semibold min-w-[140px]">{tTable("price")}</TableHead>
            <TableHead className="px-4 py-4 text-sm font-semibold min-w-[120px]">{tTable("type")}</TableHead>
            <TableHead className="px-4 py-4 text-sm font-semibold min-w-[140px]">{tTable("city")}</TableHead>
            <TableHead className="px-4 py-4 text-sm font-semibold min-w-[200px]">{tTable("notes")}</TableHead>
            <TableHead className="px-4 py-4 text-sm font-semibold min-w-[140px]">{tTable("carPaid")}</TableHead>
            <TableHead className="px-4 py-4 text-sm font-semibold min-w-[140px]">{tTable("shippingPaid")}</TableHead>
            <TableHead className="px-4 py-4 text-sm font-semibold min-w-[120px]">{tTable("insurance")}</TableHead>
            <TableHead className="px-4 py-4 text-sm font-semibold min-w-[140px]">{tTable("created")}</TableHead>
            <TableHead className="px-4 py-4 text-center text-sm font-semibold min-w-[120px]">{tTable("invoice")}</TableHead>
            <TableHead className="px-4 py-4 text-center pr-6 sm:pr-8 text-sm font-semibold min-w-[160px]">{tTable("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={18} className="py-12">
                <div className="flex flex-col items-center justify-center gap-3">
                  <svg className="animate-spin h-8 w-8 text-[#429de6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t("admin.carsView.loadingCars")}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ) : !cars || cars.length === 0 ? (
            <TableRow>
              <TableCell colSpan={18} className="py-12">
                <div className="flex items-center justify-center text-center text-sm text-gray-600 dark:text-gray-400">
                  {t("admin.carsView.noCarsFound")}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            cars.map((car, index) => (
            <TableRow key={car.id} className="hover:bg-gray-50/70 dark:hover:bg-white/5">
              {/* Row Number */}
              <TableCell className="px-4 py-6 text-center">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {(currentPage - 1) * pageSize + index + 1}
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
              
              {/* Purchase Date */}
              <TableCell className="px-4 py-6 min-w-[140px]">
                <div className="text-sm text-gray-900 dark:text-white whitespace-nowrap">
                  {formatDate(car.details?.purchaseDate)}
                </div>
              </TableCell>
              
              {/* Car (Model + Year) */}
              <TableCell className="px-6 py-6 sm:px-8 min-w-[200px]">
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold text-gray-900 dark:text-white">
                    {car.model}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {car.year}
                  </div>
                </div>
              </TableCell>
              
              {/* Lot */}
              <TableCell className="px-4 py-6 min-w-[140px]">
                <div className="text-sm text-gray-900 dark:text-white">
                  {car.details?.lot || "-"}
                </div>
              </TableCell>
              
              {/* VIN */}
              <TableCell className="px-4 py-6 min-w-[160px]">
                <div className="text-sm text-gray-900 dark:text-white font-mono">
                  {car.details?.vin || "-"}
                </div>
              </TableCell>
              
              {/* Auction */}
              <TableCell className="px-4 py-6 min-w-[120px]">
                <div className="text-sm text-gray-900 dark:text-white capitalize">
                  {car.details?.auction || "-"}
                </div>
              </TableCell>
              
              {/* Client */}
              <TableCell className="px-4 py-6 min-w-[140px]">
                <div className="text-sm text-gray-900 dark:text-white font-medium">
                  {car.client || "-"}
                </div>
              </TableCell>
              
              {/* Price */}
              <TableCell className="px-4 py-6 min-w-[140px]">
                <div className="text-base font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                  {formatUsd({ value: car.priceUsd })}
                </div>
              </TableCell>
              
              {/* Type */}
              <TableCell className="px-4 py-6 min-w-[120px]">
                <div className="text-sm text-gray-900 dark:text-white capitalize">
                  {car.details?.type || "-"}
                </div>
              </TableCell>
              
              {/* City */}
              <TableCell className="px-4 py-6 min-w-[140px]">
                <div className="text-sm text-gray-900 dark:text-white">
                  {car.details?.city || "-"}
                </div>
              </TableCell>
              
              {/* Notes */}
              <TableCell className="px-4 py-6 min-w-[200px]">
                <div className="text-sm text-gray-900 dark:text-white truncate">
                  {car.details?.customerNotes || "-"}
                </div>
              </TableCell>
              
              {/* Car Payment */}
              <TableCell className="px-4 py-6 min-w-[140px]">
                <PaymentStatus 
                  paid={car.carPaid} 
                  label={car.carPaid ? t("admin.modals.addCar.paid") : t("admin.modals.addCar.notPaid")}
                  size="sm"
                />
              </TableCell>
              
              {/* Shipping Payment */}
              <TableCell className="px-4 py-6 min-w-[140px]">
                <PaymentStatus 
                  paid={car.shippingPaid} 
                  label={car.shippingPaid ? t("admin.modals.addCar.paid") : t("admin.modals.addCar.notPaid")}
                  size="sm"
                />
              </TableCell>
              
              {/* Insurance */}
              <TableCell className="px-4 py-6 min-w-[120px]">
                <PaymentStatus 
                  paid={car.insurance} 
                  label={car.insurance ? t("admin.modals.addCar.exists") : t("admin.modals.addCar.notExists")}
                  size="sm"
                />
              </TableCell>
              
              {/* Created Date */}
              <TableCell className="px-4 py-6 min-w-[140px]">
                <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {formatDate(car.createdAt)}
                </div>
              </TableCell>
              
              {/* Invoice */}
              <TableCell className="px-4 py-6 text-center min-w-[120px]">
                {car.invoiceId ? (
                  <a
                    href={car.invoiceId}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 dark:border-white/10 dark:bg-[#161b22] dark:text-gray-300 dark:hover:bg-white/5 dark:hover:border-white/20 transition-all"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">{tTable("download")}</span>
                  </a>
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-600">-</span>
                )}
              </TableCell>
              
              {/* Actions */}
              <TableCell className="px-4 py-6 text-center pr-6 sm:pr-8 min-w-[160px]">
                <div className="flex items-center justify-center gap-2">
                  {car.photos && car.photos.length > 0 && (
                    <DownloadImagesButton
                      images={car.photos}
                      carName={`${car.model} ${car.year}`}
                      variant="outline"
                      size="sm"
                      useZip={true}
                      showCount={false}
                      compactText={true}
                      className="h-9 px-3 gap-2 border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400 hover:text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50 dark:hover:border-emerald-700 dark:hover:text-emerald-300 transition-all"
                    />
                  )}
                  {isAdmin && onUpdateCar && (
                    <Button
                      onClick={() => onUpdateCar(car)}
                      variant="outline"
                      size="sm"
                      className="h-9 px-3 gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:border-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-950/50 dark:hover:border-blue-800 dark:hover:text-blue-300 transition-all"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="hidden sm:inline">{t("admin.actions.update")}</span>
                    </Button>
                  )}
                  {isAdmin && onDeleteCar && (
                    <Button
                      onClick={() => onDeleteCar(car)}
                      variant="outline"
                      size="sm"
                      className="h-9 px-3 gap-2 border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:border-gray-400 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-900/30 dark:text-gray-400 dark:hover:bg-gray-900/50 dark:hover:border-gray-600 dark:hover:text-gray-300 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline">{t("admin.actions.delete")}</span>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>

      {/* Pagination */}
      {onPageChange && onPageSizeChange && totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
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
        {selectedCarPhotos.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
            {currentPhotoIndex + 1} / {selectedCarPhotos.length}
          </div>
        )}
      </div>
    )}
  </>
  );
};


