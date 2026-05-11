"use client";

import { useState, useEffect, useCallback, memo } from "react";
import Image from "next/image";
import { Download, Pencil, Plus, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslations } from "next-intl";

import type { AdminCar } from "@/lib/admin/types";
import { formatUsd } from "@/lib/admin/format";
import { Surface } from "@/components/admin/primitives/Surface";
import { RefreshButton } from "@/components/admin/primitives/RefreshButton";
import { Pagination } from "@/components/admin/primitives/Pagination";
import { TextCell } from "@/components/admin/primitives/TextCell";
import { CarFilters, type CarFiltersState } from "@/components/admin/filters/CarFilters";
import { Button } from "@/components/ui/button";
import { DownloadImagesButton } from "@/components/ui/DownloadImagesButton";
import { Table } from "@radix-ui/themes";

// ============================================================================
// Types
// ============================================================================

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
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
};

type CarTableRowProps = {
  car: AdminCar;
  index: number;
  currentPage: number;
  pageSize: number;
  isAdmin: boolean;
  onPhotoClick: (photos: string[] | undefined, e: React.MouseEvent) => void;
  onUpdateCar?: (car: AdminCar) => void;
  onDeleteCar?: (car: AdminCar) => void;
  formatDate: (dateString?: string) => string;
};

// ============================================================================
// Hoisted Static Elements (rule 6.3 - avoids recreation on every render)
// ============================================================================

const loadingSpinner = (
  <svg className="animate-spin h-8 w-8 text-[#429de6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const carouselSpinner = (
  <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
);

// ============================================================================
// Memoized Table Row Component (rule 5.4 - extract expensive work)
// ============================================================================

const CarTableRow = memo(function CarTableRow({
  car,
  isAdmin,
  onPhotoClick,
  onUpdateCar,
  onDeleteCar,
  formatDate,
}: CarTableRowProps) {
  const t = useTranslations();
  const tTable = useTranslations("carsTable");

  const handleUpdate = useCallback(() => onUpdateCar?.(car), [onUpdateCar, car]);
  const handleDelete = useCallback(() => onDeleteCar?.(car), [onDeleteCar, car]);
  const handlePhotoClick = useCallback(
    (e: React.MouseEvent) => onPhotoClick(car.photos, e),
    [onPhotoClick, car.photos]
  );

  return (
    <Table.Row className="transition-colors duration-150 hover:bg-yellow-100 dark:hover:bg-[#429de6]/20">
      {/* Photo + Model (combined sticky column) */}
      <Table.Cell className="sticky left-0 z-10 bg-white dark:bg-[#0b0f14] p-0">
        <div className="flex items-stretch h-full w-full">
          {/* Photo + download icon */}
          <div className="w-[124px] px-3 py-2 flex-shrink-0 flex items-center gap-3">
            {car.imageUrl && (
              <button
                onClick={handlePhotoClick}
                className="relative h-10 w-14 flex-shrink-0 overflow-hidden rounded-lg ring-1 ring-gray-200 dark:ring-white/10 hover:ring-2 hover:ring-[#429de6] transition-all cursor-pointer"
              >
                <Image
                  src={car.imageUrl}
                  alt={car.model}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
                {car.photos && car.photos.length > 1 && (
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                    +{car.photos.length - 1}
                  </div>
                )}
              </button>
            )}
            {car.photos && car.photos.length > 0 && (
              <DownloadImagesButton
                images={car.photos}
                carName={`${car.model} ${car.year}`}
                variant="ghost"
                size="sm"
                useZip={true}
                showCount={false}
                compactText={true}
                className="h-8 w-8 p-0 flex-shrink-0 rounded-lg text-gray-500 dark:text-gray-400 hover:text-[#429de6] dark:hover:text-[#429de6] hover:bg-gray-100 dark:hover:bg-white/10 transition-colors [&_span]:!hidden [&_svg]:!mr-0"
              />
            )}
          </div>
          {/* Divider between Photos and Car */}
          <div className="w-px self-stretch bg-gray-200 dark:bg-white/10 flex-shrink-0" />
          {/* Year + Model + Lot + VIN */}
          <div className="w-[170px] px-3 py-2 min-w-0 flex flex-col justify-center">
            <div className="truncate text-sm font-semibold text-gray-900 dark:text-white" title={`${car.year} ${car.model}`}>
              {car.year} {car.model}
            </div>
            {car.details?.lot && (
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-gray-700 dark:text-gray-300 mt-0.5">
                {car.details.lot}
              </div>
            )}
            {car.details?.vin && (
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-mono text-gray-600 dark:text-gray-400 mt-0.5 truncate" title={car.details.vin}>
                {car.details.vin}
              </div>
            )}
          </div>
          {/* Divider */}
          <div className="w-px self-stretch bg-gray-200 dark:bg-white/10 flex-shrink-0" />
        </div>
      </Table.Cell>

      {/* Sale Date */}
      <Table.Cell className="px-3 py-2 min-w-[110px] border-r border-gray-100 dark:border-white/5">
        <div className="text-sm text-gray-900 dark:text-white whitespace-nowrap">
          {formatDate(car.details?.purchaseDate)}
        </div>
      </Table.Cell>

      {/* Auction */}
      <Table.Cell className="px-3 py-2 min-w-[90px] border-r border-gray-100 dark:border-white/5">
        <div className="text-sm text-gray-900 dark:text-white capitalize">
          {car.details?.auction || "-"}
        </div>
      </Table.Cell>

      {/* Client */}
      <TextCell
        value={car.client}
        valueClassName="text-sm text-gray-900 dark:text-white font-medium truncate"
      />

      {/* Destination Port */}
      <TextCell value={car.details?.destinationPort} />

      {/* Container */}
      <TextCell
        value={car.details?.containerNumberBooking}
        valueClassName="text-sm text-gray-900 dark:text-white font-mono truncate"
      />

      {/* Price + Car Invoice download */}
      <Table.Cell className="px-3 py-2 min-w-[130px] border-r border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
            {formatUsd({ value: car.priceUsd })}
          </span>
          {car.details?.vehiclePdf && (
            <a
              href={car.details.vehiclePdf}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded leading-none overflow-hidden text-gray-400 hover:text-[#429de6] dark:text-gray-500 dark:hover:text-[#429de6] transition-colors"
              title={tTable("download")}
            >
              <Download className="h-5 w-5" />
            </a>
          )}
        </div>
      </Table.Cell>

      {/* City */}
      <TextCell value={car.details?.city} />

      {/* Shipping Invoice */}
      <Table.Cell className="px-3 py-2 text-center min-w-[60px] border-r border-gray-100 dark:border-white/5">
        {car.details?.shippingPdf ? (
          <a
            href={car.details.shippingPdf}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-7 w-7 rounded-md text-gray-500 hover:text-[#429de6] dark:text-gray-400 dark:hover:text-[#429de6] transition-colors"
            title={tTable("download")}
          >
            <Download className="h-4 w-4" />
          </a>
        ) : (
          <span className="text-xs text-gray-400 dark:text-gray-600">-</span>
        )}
      </Table.Cell>

      {/* Insurance */}
      <Table.Cell className="px-3 py-2 text-center min-w-[60px] border-r border-gray-100 dark:border-white/5">
        {car.details?.insurancePdf ? (
          <a
            href={car.details.insurancePdf}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-7 w-7 rounded-md text-gray-500 hover:text-[#429de6] dark:text-gray-400 dark:hover:text-[#429de6] transition-colors"
            title={tTable("download")}
          >
            <Download className="h-4 w-4" />
          </a>
        ) : (
          <span className="text-xs text-gray-400 dark:text-gray-600">-</span>
        )}
      </Table.Cell>

      {/* Receiver's Name */}
      <TextCell
        value={car.details?.receiverName}
        cellClassName="px-3 py-2 min-w-[110px] border-r border-gray-100 dark:border-white/5"
      />

      {/* Notes */}
      <TextCell
        value={car.details?.customerNotes}
        cellClassName="px-3 py-2 min-w-[150px] border-r border-gray-100 dark:border-white/5 max-w-[180px]"
        valueClassName="text-sm text-gray-900 dark:text-white line-clamp-1"
      />

      {/* Actions */}
      <Table.Cell className="px-3 py-2 text-center pr-4 sm:pr-6 min-w-[120px]">
        <div className="flex items-center justify-center gap-2">
          {isAdmin && onUpdateCar && (
            <Button
              onClick={handleUpdate}
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
              onClick={handleDelete}
              variant="outline"
              size="sm"
              className="h-9 px-3 gap-2 border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:border-gray-400 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-900/30 dark:text-gray-400 dark:hover:bg-gray-900/50 dark:hover:border-gray-600 dark:hover:text-gray-300 transition-all"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">{t("admin.actions.delete")}</span>
            </Button>
          )}
        </div>
      </Table.Cell>
    </Table.Row>
  );
});

// ============================================================================
// Main Component
// ============================================================================

export const CarsView = memo(function CarsView({
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
  currentPage = 1,
  totalPages = 1,
  pageSize = 25,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
}: CarsViewProps) {
  const t = useTranslations();
  const tTable = useTranslations("carsTable");

  // Photo carousel state
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [selectedCarPhotos, setSelectedCarPhotos] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);

  // Stable callback for opening photo carousel
  const handlePhotoClick = useCallback((photos: string[] | undefined, e: React.MouseEvent) => {
    e.stopPropagation();
    if (photos && photos.length > 0) {
      setSelectedCarPhotos(photos);
      setCurrentPhotoIndex(0);
      setImageLoading(true);
      setCarouselOpen(true);
    }
  }, []);

  // Stable callback for closing carousel
  const handleCloseCarousel = useCallback(() => setCarouselOpen(false), []);

  // Navigate to next photo - uses functional setState to avoid stale closure
  const handleNextPhoto = useCallback(() => {
    setImageLoading(true);
    setCurrentPhotoIndex((prev) => {
      // Access length via closure captured at effect setup time
      return prev < selectedCarPhotos.length - 1 ? prev + 1 : 0;
    });
  }, [selectedCarPhotos.length]);

  // Navigate to previous photo - uses functional setState
  const handlePrevPhoto = useCallback(() => {
    setImageLoading(true);
    setCurrentPhotoIndex((prev) => {
      return prev > 0 ? prev - 1 : selectedCarPhotos.length - 1;
    });
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

    // Preload all images at once
    selectedCarPhotos.forEach((photoUrl) => {
      const img = new window.Image();
      img.src = photoUrl;
    });
  }, [carouselOpen, selectedCarPhotos]);

  // Date formatter - stable reference (DD/MM/YYYY format)
  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return "-";
    }
  }, []);

  return (
    <>
      <Surface>
        <div className="px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">
              {tTable("title")}
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {tTable("showing")} {cars?.length || 0}{" "}
              {cars?.length === 1 ? tTable("carSingular") : tTable("cars")}
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
            {onRefresh && <RefreshButton onClick={onRefresh} isLoading={isLoading} />}
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

          <div className="scrollbar-visible"><Table.Root>
            <Table.Header className="sticky top-0 z-30">
              <Table.Row className="bg-gray-50 hover:bg-gray-50 dark:bg-[#0b0f14] dark:hover:bg-[#0b0f14]">
                <Table.ColumnHeaderCell className="sticky left-0 z-40 bg-gray-50 dark:bg-[#0b0f14] p-0">
                  <div className="flex items-stretch h-full w-full">
                    <div className="w-[124px] px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{tTable("photos")}</div>
                    <div className="w-px self-stretch bg-gray-200 dark:bg-white/10 flex-shrink-0" />
                    <div className="w-[170px] px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{tTable("car")}</div>
                    <div className="w-px self-stretch bg-gray-200 dark:bg-white/10 flex-shrink-0" />
                  </div>
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[110px] border-r border-gray-100 dark:border-white/5">{tTable("saleDate")}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[90px] border-r border-gray-100 dark:border-white/5">{tTable("auction")}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[110px] border-r border-gray-100 dark:border-white/5">{tTable("client")}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[110px] border-r border-gray-100 dark:border-white/5">{tTable("destinationPort")}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[110px] border-r border-gray-100 dark:border-white/5">{tTable("container")}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[130px] border-r border-gray-100 dark:border-white/5">{tTable("price")}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[110px] border-r border-gray-100 dark:border-white/5">{tTable("city")}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="px-3 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[90px] border-r border-gray-100 dark:border-white/5">{tTable("shippingInvoice")}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[90px] border-r border-gray-100 dark:border-white/5">{tTable("insurance")}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[110px] border-r border-gray-100 dark:border-white/5">{tTable("receiverName")}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[150px] border-r border-gray-100 dark:border-white/5">{tTable("notes")}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="px-3 py-2.5 text-center pr-4 sm:pr-6 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[120px]">{tTable("actions")}</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {isLoading ? (
                <Table.Row>
                  <Table.Cell colSpan={13} className="py-12">
                    <div className="flex flex-col items-center justify-center gap-3">
                      {loadingSpinner}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t("admin.carsView.loadingCars")}
                      </span>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ) : !cars || cars.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={13} className="py-12">
                    <div className="flex items-center justify-center text-center text-sm text-gray-600 dark:text-gray-400">
                      {t("admin.carsView.noCarsFound")}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ) : (
                cars.map((car, index) => (
                  <CarTableRow
                    key={car.id}
                    car={car}
                    index={index}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    isAdmin={isAdmin}
                    onPhotoClick={handlePhotoClick}
                    onUpdateCar={onUpdateCar}
                    onDeleteCar={onDeleteCar}
                    formatDate={formatDate}
                  />
                ))
              )}
            </Table.Body>
          </Table.Root></div>

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
          {selectedCarPhotos.length > 1 && (
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
              {currentPhotoIndex + 1} / {selectedCarPhotos.length}
            </div>
          )}
        </div>
      )}
    </>
  );
});
