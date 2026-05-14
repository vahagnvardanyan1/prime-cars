"use client";

import { memo } from "react";
import { useTranslations } from "next-intl";

import type { AdminCar } from "@/lib/admin/types";
import { AdminCarMobileCard } from "@/components/admin/cards/AdminCarMobileCard";

type CarsMobileListProps = {
  cars: AdminCar[];
  isLoading: boolean;
  isAdmin: boolean;
  onPhotoClick: (photos: string[] | undefined, e: React.MouseEvent) => void;
  onUpdateCar?: (car: AdminCar) => void;
  onDeleteCar?: (car: AdminCar) => void;
};

const loadingSpinner = (
  <svg className="animate-spin h-8 w-8 text-[#429de6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export const CarsMobileList = memo(function CarsMobileList({
  cars,
  isLoading,
  isAdmin,
  onPhotoClick,
  onUpdateCar,
  onDeleteCar,
}: CarsMobileListProps) {
  const t = useTranslations();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        {loadingSpinner}
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {t("admin.carsView.loadingCars")}
        </span>
      </div>
    );
  }

  if (!cars || cars.length === 0) {
    return (
      <div className="flex items-center justify-center text-center text-sm text-gray-600 dark:text-gray-400 py-12">
        {t("admin.carsView.noCarsFound")}
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3 px-4 py-4">
      {cars.map((car) => (
        <AdminCarMobileCard
          key={car.id}
          car={car}
          isAdmin={isAdmin}
          onPhotoClick={onPhotoClick}
          onUpdateCar={onUpdateCar}
          onDeleteCar={onDeleteCar}
        />
      ))}
    </ul>
  );
});
