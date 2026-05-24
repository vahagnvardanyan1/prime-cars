"use client";

import { useState, useEffect, useCallback, memo } from "react";
import Image from "next/image";
import { Pencil, Plus, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslations } from "next-intl";

import type { Car } from "@/lib/cars/types";
import { Surface } from "@/components/admin/primitives/Surface";
import { RefreshButton } from "@/components/admin/primitives/RefreshButton";
import { Pagination } from "@/components/admin/primitives/Pagination";
import { TextCell } from "@/components/admin/primitives/TextCell";
import { Button } from "@/components/ui/button";
import { DownloadImagesButton } from "@/components/admin/primitives/DownloadImagesButton";
import { Table } from "@radix-ui/themes";

// ============================================================================
// Types
// ============================================================================

type AvailableCarsViewProps = {
  cars: Car[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onAddCar?: () => void;
  onUpdateCar?: (car: Car) => void;
  onDeleteCar?: (car: Car) => void;
  isAdmin?: boolean;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
};

type AvailableCarTableRowProps = {
  car: Car;
  index: number;
  currentPage: number;
  pageSize: number;
  isAdmin: boolean;
  onPhotoClick: (photos: string[] | undefined, e: React.MouseEvent) => void;
  onUpdateCar?: (car: Car) => void;
  onDeleteCar?: (car: Car) => void;
  formatPrice: (price: number) => string;
  getCategoryLabel: (category: string) => string;
};

// ============================================================================
// Hoisted Static Elements (rule 6.3)
// ============================================================================

const loadingSpinner = (
  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#429de6]" />
);

const carouselSpinner = (
  <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
);

// Module-level price formatter for performance
const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

// ============================================================================
// Memoized Table Row Component
// ============================================================================

const AvailableCarTableRow = memo(function AvailableCarTableRow({
  car,
  index,
  currentPage,
  pageSize,
  isAdmin,
  onPhotoClick,
  onUpdateCar,
  onDeleteCar,
  formatPrice,
  getCategoryLabel,
}: AvailableCarTableRowProps) {
  const t = useTranslations("admin.availableCars");

  const handleUpdate = useCallback(() => onUpdateCar?.(car), [onUpdateCar, car]);
  const handleDelete = useCallback(() => onDeleteCar?.(car), [onDeleteCar, car]);
  const handlePhotoClick = useCallback(
    (e: React.MouseEvent) => onPhotoClick(car.photos, e),
    [onPhotoClick, car.photos]
  );

  return (
    <Table.Row className="transition-colors duration-150 hover:bg-yellow-100 dark:hover:bg-[#429de6]/20">
      {/* Row Number */}
      <Table.Cell className="px-4 py-3 text-center">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {(currentPage - 1) * pageSize + index + 1}
        </div>
      </Table.Cell>

      {/* Photo (Clickable) */}
      <Table.Cell className="px-4 py-3">
        {car.imageUrl && (
          <button
            onClick={handlePhotoClick}
            className="relative h-12 w-16 overflow-hidden rounded-xl ring-1 ring-gray-200 dark:ring-white/10 flex-shrink-0 hover:ring-2 hover:ring-[#429de6] transition-all cursor-pointer"
          >
            <Image
              src={car.imageUrl}
              alt={car.model}
              fill
              className="object-cover"
              sizes="64px"
            />
            {car.photos && car.photos.length > 1 && (
              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                +{car.photos.length - 1}
              </div>
            )}
          </button>
        )}
      </Table.Cell>

      {/* Model */}
      <Table.Cell className="px-4 py-3">
        <div className="text-sm font-semibold text-gray-900 dark:text-white">
          {car.model}
        </div>
      </Table.Cell>

      {/* Year */}
      <Table.Cell className="px-4 py-3">
        <div className="text-sm text-gray-900 dark:text-white">{car.year}</div>
      </Table.Cell>

      {/* VIN */}
      <Table.Cell className="px-4 py-3">
        <div className="text-sm text-gray-900 dark:text-white font-mono">
          {car.vin || "-"}
        </div>
      </Table.Cell>

      {/* Price */}
      <Table.Cell className="px-4 py-3">
        <div className="text-sm font-semibold text-gray-900 dark:text-white">
          {formatPrice(car.priceUsd)}
        </div>
      </Table.Cell>

      {/* Category */}
      <Table.Cell className="px-4 py-3">
        <span
          className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${
            car.category === "AVAILABLE"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
              : car.category === "ONROAD"
                ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
          }`}
        >
          {getCategoryLabel(car.category)}
        </span>
      </Table.Cell>

      {/* Location */}
      <Table.Cell className="px-4 py-3">
        <div className="text-sm text-gray-900 dark:text-white">
          {car.location || "-"}
        </div>
      </Table.Cell>

      {/* Engine */}
      <TextCell
        value={car.engine?.toLowerCase()}
        cellClassName="px-4 py-3"
        valueClassName="text-sm text-gray-900 dark:text-white capitalize"
      />

      {/* Horsepower */}
      <TextCell
        value={car.horsepower ? `${car.horsepower} HP` : undefined}
        cellClassName="px-4 py-3"
        valueClassName="text-sm text-gray-900 dark:text-white"
      />

      {/* Transmission */}
      <TextCell
        value={car.transmission?.toLowerCase()}
        cellClassName="px-4 py-3"
        valueClassName="text-sm text-gray-900 dark:text-white capitalize"
      />

      {/* Drive Type */}
      <TextCell
        value={car.driveType}
        cellClassName="px-4 py-3"
        valueClassName="text-sm text-gray-900 dark:text-white"
      />

      {/* Mileage */}
      <TextCell
        value={car.mileage && car.mileage > 0 ? `${car.mileage.toLocaleString("en-US")} km` : undefined}
        cellClassName="px-4 py-3"
        valueClassName="text-sm text-gray-900 dark:text-white whitespace-nowrap"
      />

      {/* Description */}
      <TextCell
        value={car.description}
        cellClassName="px-4 py-3"
        valueClassName="text-sm text-gray-900 dark:text-white line-clamp-2"
      />

      {/* Actions */}
      {isAdmin && (
        <Table.Cell className="px-4 py-3 text-center pr-6 sm:pr-8">
          <div className="flex items-center justify-center gap-2">
            {car.photos && car.photos.length > 0 && (
              <DownloadImagesButton
                images={car.photos}
                carName={`${car.brand} ${car.model} ${car.year}`}
                variant="outline"
                size="sm"
                useZip={true}
                showCount={false}
                compactText={true}
                className="h-9 px-3 gap-2 border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400 hover:text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50 dark:hover:border-emerald-700 dark:hover:text-emerald-300 transition-all"
              />
            )}
            {onUpdateCar && (
              <Button
                onClick={handleUpdate}
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
                onClick={handleDelete}
                variant="outline"
                size="sm"
                className="h-9 px-3 gap-2 border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:border-gray-400 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-900/30 dark:text-gray-400 dark:hover:bg-gray-900/50 dark:hover:border-gray-600 dark:hover:text-gray-300 transition-all"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">{t("table.delete")}</span>
              </Button>
            )}
          </div>
        </Table.Cell>
      )}
    </Table.Row>
  );
});

// ============================================================================
// Main Component
// ============================================================================

export const AvailableCarsView = memo(function AvailableCarsView({
  cars,
  isLoading = false,
  onRefresh,
  onAddCar,
  onUpdateCar,
  onDeleteCar,
  isAdmin = false,
  currentPage = 1,
  totalPages = 1,
  pageSize = 25,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
}: AvailableCarsViewProps) {
  const t = useTranslations("admin.availableCars");
  const tModals = useTranslations("admin.modals.createAvailableCar");

  // Photo carousel state
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [selectedCarPhotos, setSelectedCarPhotos] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);

  // Stable callback for opening photo carousel
  const handlePhotoClick = useCallback(
    (photos: string[] | undefined, e: React.MouseEvent) => {
      e.stopPropagation();
      if (photos && photos.length > 0) {
        setSelectedCarPhotos(photos);
        setCurrentPhotoIndex(0);
        setImageLoading(true);
        setCarouselOpen(true);
      }
    },
    []
  );

  // Stable callback for closing carousel
  const handleCloseCarousel = useCallback(() => setCarouselOpen(false), []);

  // Navigate to next photo
  const handleNextPhoto = useCallback(() => {
    setImageLoading(true);
    setCurrentPhotoIndex((prev) =>
      prev < selectedCarPhotos.length - 1 ? prev + 1 : 0
    );
  }, [selectedCarPhotos.length]);

  // Navigate to previous photo
  const handlePrevPhoto = useCallback(() => {
    setImageLoading(true);
    setCurrentPhotoIndex((prev) =>
      prev > 0 ? prev - 1 : selectedCarPhotos.length - 1
    );
  }, [selectedCarPhotos.length]);

  // Handle image load complete
  const handleImageLoad = useCallback(() => setImageLoading(false), []);

  // Keyboard navigation for carousel
  useEffect(() => {
    if (!carouselOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevPhoto();
      } else if (e.key === "ArrowRight") {
        handleNextPhoto();
      } else if (e.key === "Escape") {
        setCarouselOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [carouselOpen, handleNextPhoto, handlePrevPhoto]);

  // Preload ALL images when carousel opens for instant navigation
  useEffect(() => {
    if (!carouselOpen || selectedCarPhotos.length === 0) return;

    selectedCarPhotos.forEach((photoUrl) => {
      const img = new window.Image();
      img.src = photoUrl;
    });
  }, [carouselOpen, selectedCarPhotos]);

  // Stable price formatter
  const formatPrice = useCallback((price: number): string => {
    return priceFormatter.format(price);
  }, []);

  // Stable category label getter
  const getCategoryLabel = useCallback(
    (category: string): string => {
      switch (category) {
        case "AVAILABLE":
          return tModals("categoryAvailable");
        case "ONROAD":
          return tModals("categoryOnRoad");
        case "TRANSIT":
          return tModals("categoryTransit");
        default:
          return category;
      }
    },
    [tModals]
  );

  return (
    <>
      <Surface>
        <div className="px-6 py-3 flex items-center justify-between">
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
            {onRefresh && <RefreshButton onClick={onRefresh} isLoading={isLoading} />}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table.Root>
            <Table.Header>
              <Table.Row className="border-gray-200 dark:border-white/10">
                <Table.ColumnHeaderCell className="text-center w-16">{t("table.number")}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="min-w-[100px]">{t("table.photo")}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="min-w-[200px]">{t("table.model")}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="min-w-[100px]">{t("table.year")}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="min-w-[160px]">{t("table.vin")}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="min-w-[140px]">{t("table.price")}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="min-w-[120px]">{t("table.category")}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="min-w-[140px]">{t("table.location")}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="min-w-[120px]">{t("table.engine")}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="min-w-[100px]">{t("table.hp")}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="min-w-[140px]">{t("table.transmission")}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="min-w-[120px]">{t("table.driveType")}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="min-w-[140px]">{t("table.mileage")}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="min-w-[200px]">{t("table.description")}</Table.ColumnHeaderCell>
                {isAdmin && (
                  <Table.ColumnHeaderCell className="text-center min-w-[160px]">
                    {t("table.actions")}
                  </Table.ColumnHeaderCell>
                )}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {isLoading ? (
                <Table.Row>
                  <Table.Cell colSpan={isAdmin ? 15 : 14} className="py-12">
                    <div className="flex items-center justify-center">
                      {loadingSpinner}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ) : !cars || cars.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={isAdmin ? 15 : 14} className="py-12">
                    <div className="flex items-center justify-center text-center text-sm text-gray-600 dark:text-gray-400">
                      {t("noCarsFound")}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ) : (
                cars.map((car, index) => (
                  <AvailableCarTableRow
                    key={car.id}
                    car={car}
                    index={index}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    isAdmin={isAdmin}
                    onPhotoClick={handlePhotoClick}
                    onUpdateCar={onUpdateCar}
                    onDeleteCar={onDeleteCar}
                    formatPrice={formatPrice}
                    getCategoryLabel={getCategoryLabel}
                  />
                ))
              )}
            </Table.Body>
          </Table.Root>
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
            pageSizeOptions={[25, 50, 100]}
          />
        )}
      </Surface>

      {/* Photo Lightbox Modal */}
      {carouselOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          {/* Close Button */}
          <button
            onClick={handleCloseCarousel}
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
                {carouselSpinner}
              </div>
            )}

            {selectedCarPhotos.length > 0 && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedCarPhotos[currentPhotoIndex]}
                alt={`Photo ${currentPhotoIndex + 1}`}
                className={`max-w-full max-h-full object-contain transition-opacity duration-200 ${
                  imageLoading ? "opacity-0" : "opacity-100"
                }`}
                onLoad={handleImageLoad}
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
});
