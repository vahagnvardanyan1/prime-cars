"use client";

import { memo, useCallback } from "react";
import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import type { AdminCar } from "@/lib/admin/types";
import { Button } from "@/components/ui/button";

type AdminCarMobileCardProps = {
  car: AdminCar;
  isAdmin: boolean;
  onPhotoClick: (photos: string[] | undefined, e: React.MouseEvent) => void;
  onUpdateCar?: (car: AdminCar) => void;
  onDeleteCar?: (car: AdminCar) => void;
  onViewCar?: (car: AdminCar) => void;
};

export const AdminCarMobileCard = memo(function AdminCarMobileCard({
  car,
  isAdmin,
  onPhotoClick,
  onUpdateCar,
  onDeleteCar,
  onViewCar,
}: AdminCarMobileCardProps) {
  const t = useTranslations();

  const handleUpdate = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onUpdateCar?.(car);
    },
    [onUpdateCar, car]
  );
  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDeleteCar?.(car);
    },
    [onDeleteCar, car]
  );
  const handleView = useCallback(() => onViewCar?.(car), [onViewCar, car]);
  const handleCardKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!onViewCar) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onViewCar(car);
      }
    },
    [onViewCar, car]
  );
  const handlePhotoClick = useCallback(
    (e: React.MouseEvent) => onPhotoClick(car.photos, e),
    [onPhotoClick, car.photos]
  );

  const extraPhotos = car.photos && car.photos.length > 1 ? car.photos.length - 1 : 0;
  const isInteractive = Boolean(onViewCar);

  return (
    <li
      onClick={isInteractive ? handleView : undefined}
      onKeyDown={isInteractive ? handleCardKeyDown : undefined}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={isInteractive ? `${car.year} ${car.model} — ${t("admin.actions.view")}` : undefined}
      className={`rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b0f14] p-3 shadow-sm transition-colors ${
        isInteractive
          ? "cursor-pointer hover:border-blue-300 dark:hover:border-blue-900/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#429de6]"
          : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {car.imageUrl ? (
          <button
            onClick={handlePhotoClick}
            className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg ring-1 ring-gray-200 dark:ring-white/10 hover:ring-2 hover:ring-[#429de6] transition-all"
            aria-label={`Open photos of ${car.year} ${car.model}`}
          >
            <Image
              src={car.imageUrl}
              alt={car.model}
              fill
              className="object-cover"
              sizes="112px"
            />
            {extraPhotos > 0 && (
              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                +{extraPhotos}
              </div>
            )}
          </button>
        ) : (
          <div className="h-20 w-28 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-white/5" />
        )}

        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={`${car.year} ${car.model}`}>
            {car.year} {car.model}
          </div>
          {car.details?.lot && (
            <div className="mt-1 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 truncate" title={car.details.lot}>
              {car.details.lot}
            </div>
          )}
          {car.details?.vin && (
            <div className="mt-0.5 text-xs font-mono text-gray-600 dark:text-gray-400 truncate" title={car.details.vin}>
              {car.details.vin}
            </div>
          )}
        </div>
      </div>

      {isAdmin && (onUpdateCar || onDeleteCar) && (
        <div className="mt-3 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-white/5 pt-3">
          {onUpdateCar && (
            <Button
              onClick={handleUpdate}
              variant="outline"
              size="sm"
              className="min-h-[44px] px-4 gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:border-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-950/50 dark:hover:border-blue-800 dark:hover:text-blue-300"
            >
              <Pencil className="h-4 w-4" />
              {t("admin.actions.update")}
            </Button>
          )}
          {onDeleteCar && (
            <Button
              onClick={handleDelete}
              variant="outline"
              size="sm"
              className="min-h-[44px] px-4 gap-2 border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:border-gray-400 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-900/30 dark:text-gray-400 dark:hover:bg-gray-900/50 dark:hover:border-gray-600 dark:hover:text-gray-300"
            >
              <Trash2 className="h-4 w-4" />
              {t("admin.actions.delete")}
            </Button>
          )}
        </div>
      )}
    </li>
  );
});
