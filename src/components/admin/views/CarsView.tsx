"use client";

import { memo, useCallback, useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import type { AdminCar } from "@/lib/admin/types";
import { Surface } from "@/components/admin/primitives/Surface";
import { RefreshButton } from "@/components/admin/primitives/RefreshButton";
import { Pagination } from "@/components/admin/primitives/Pagination";
import { SearchInput } from "@/components/admin/primitives/SearchInput";
import { CarFilters, type CarFiltersState } from "@/components/admin/filters/CarFilters";
import { CarFiltersSheet } from "@/components/admin/filters/CarFiltersSheet";
import { CarsTable } from "@/components/admin/views/CarsTable";
import { CarsMobileList } from "@/components/admin/views/CarsMobileList";
import { CarsLightbox } from "@/components/admin/views/CarsLightbox";
import { Button } from "@/components/ui/button";

type CarsViewProps = {
  cars: AdminCar[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onAddCar?: () => void;
  onUpdateCar?: (car: AdminCar) => void;
  onDeleteCar?: (car: AdminCar) => void;
  onViewCar?: (car: AdminCar) => void;
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

const formatDate = (dateString?: string): string => {
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
};

export const CarsView = memo(function CarsView({
  cars,
  isLoading = false,
  onRefresh,
  onAddCar,
  onUpdateCar,
  onDeleteCar,
  onViewCar,
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
  const tTable = useTranslations("carsTable");
  const tFilters = useTranslations("admin.filters");

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([]);

  const handlePhotoClick = useCallback((photos: string[] | undefined, e: React.MouseEvent) => {
    e.stopPropagation();
    if (photos && photos.length > 0) {
      setLightboxPhotos(photos);
      setLightboxOpen(true);
    }
  }, []);

  const handleCloseLightbox = useCallback(() => setLightboxOpen(false), []);

  const handleSearchChange = useCallback(
    (search: string) => {
      if (filters && onFiltersChange) onFiltersChange({ ...filters, search });
    },
    [filters, onFiltersChange]
  );

  const showFilters = filters && onFiltersChange && onClearFilters;

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

        {showFilters && (
          <>
            <div className="hidden lg:block">
              <CarFilters
                filters={filters}
                onFiltersChange={onFiltersChange}
                onClearFilters={onClearFilters}
              />
            </div>
            <div className="lg:hidden px-4 py-3 border-b border-gray-200 dark:border-white/10 flex items-center gap-2">
              <SearchInput
                containerClassName="flex-1"
                placeholder={tFilters("searchCars")}
                value={filters.search}
                onChange={handleSearchChange}
              />
              <CarFiltersSheet
                filters={filters}
                onFiltersChange={onFiltersChange}
                onClearFilters={onClearFilters}
              />
            </div>
          </>
        )}

        <div className="hidden lg:block">
          <CarsTable
            cars={cars}
            isLoading={isLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            isAdmin={isAdmin}
            onPhotoClick={handlePhotoClick}
            onUpdateCar={onUpdateCar}
            onDeleteCar={onDeleteCar}
            formatDate={formatDate}
          />
        </div>
        <div className="lg:hidden">
          <CarsMobileList
            cars={cars}
            isLoading={isLoading}
            isAdmin={isAdmin}
            onPhotoClick={handlePhotoClick}
            onUpdateCar={onUpdateCar}
            onDeleteCar={onDeleteCar}
            onViewCar={onViewCar}
          />
        </div>

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

      <CarsLightbox open={lightboxOpen} photos={lightboxPhotos} onClose={handleCloseLightbox} />
    </>
  );
});
