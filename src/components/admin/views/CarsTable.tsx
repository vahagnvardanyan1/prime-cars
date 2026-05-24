"use client";

import { memo, useCallback } from "react";
import Image from "next/image";
import { Download, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Table } from "@radix-ui/themes";

import type { AdminCar } from "@/lib/admin/types";
import { formatUsd } from "@/lib/admin/format";
import { TextCell } from "@/components/admin/primitives/TextCell";
import { Button } from "@/components/ui/button";
import { DownloadImagesButton } from "@/components/admin/primitives/DownloadImagesButton";

type CarsTableProps = {
  cars: AdminCar[];
  isLoading: boolean;
  currentPage: number;
  pageSize: number;
  isAdmin: boolean;
  onPhotoClick: (photos: string[] | undefined, e: React.MouseEvent) => void;
  onUpdateCar?: (car: AdminCar) => void;
  onDeleteCar?: (car: AdminCar) => void;
  formatDate: (dateString?: string) => string;
};

type CarTableRowProps = Omit<CarsTableProps, "cars" | "isLoading"> & {
  car: AdminCar;
  index: number;
};

const loadingSpinner = (
  <svg className="animate-spin h-8 w-8 text-[#429de6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

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
      <Table.Cell className="sticky left-0 z-10 bg-white dark:bg-[#0b0f14] p-0">
        <div className="flex items-stretch h-full w-full">
          <div className="w-[72px] sm:w-[124px] px-2 sm:px-3 py-2 flex-shrink-0 flex items-center gap-2 sm:gap-3">
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
                {car?.photos?.length && (
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                    +{car.photos.length - 1}
                  </div>
                )}
              </button>
            )}
            {car?.photos?.length && (
              <DownloadImagesButton
                images={car.photos}
                carName={`${car.model} ${car.year}`}
                variant="ghost"
                size="sm"
                useZip={true}
                showCount={false}
                compactText={true}
                className="hidden sm:inline-flex h-8 w-8 p-0 flex-shrink-0 rounded-lg text-gray-500 dark:text-gray-400 hover:text-[#429de6] dark:hover:text-[#429de6] hover:bg-gray-100 dark:hover:bg-white/10 transition-colors [&_span]:!hidden [&_svg]:!mr-0"
              />
            )}
          </div>
          <div className="w-px self-stretch bg-gray-200 dark:bg-white/10 flex-shrink-0" />
          <div className="w-[124px] sm:w-[170px] px-2 sm:px-3 py-2 min-w-0 flex flex-col justify-center">
            <div className="break-words sm:truncate text-sm font-semibold text-gray-900 dark:text-white" title={`${car.year} ${car.model}`}>
              {car.year} {car.model}
            </div>
            {car.details?.lot && (
              <div className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mt-0.5 break-all sm:break-normal" title={car.details.lot}>
                {car.details.lot}
              </div>
            )}
            {car.details?.vin && (
              <div className="text-xs font-bold uppercase tracking-wider font-mono text-gray-600 dark:text-gray-400 mt-0.5 break-all sm:break-normal sm:truncate" title={car.details.vin}>
                {car.details.vin}
              </div>
            )}
          </div>
          <div className="w-px self-stretch bg-gray-200 dark:bg-white/10 flex-shrink-0" />
        </div>
      </Table.Cell>

      <Table.Cell className="px-3 py-2 min-w-[110px] border-r border-gray-100 dark:border-white/5">
        <div className="text-sm text-gray-900 dark:text-white whitespace-nowrap">
          {formatDate(car.details?.purchaseDate)}
        </div>
      </Table.Cell>

      <Table.Cell className="px-3 py-2 min-w-[90px] border-r border-gray-100 dark:border-white/5">
        <div className="text-sm text-gray-900 dark:text-white capitalize">
          {car.details?.auction || "-"}
        </div>
      </Table.Cell>

      <TextCell
        value={car.client}
        valueClassName="text-sm text-gray-900 dark:text-white font-medium truncate"
      />

      <TextCell value={car.details?.destinationPort} />

      <TextCell
        value={car.details?.containerNumberBooking}
        valueClassName="text-sm text-gray-900 dark:text-white font-mono truncate"
      />

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

      <TextCell value={car.details?.city} />

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

      <TextCell
        value={car.details?.receiverName}
        cellClassName="px-3 py-2 min-w-[110px] border-r border-gray-100 dark:border-white/5"
      />

      <TextCell
        value={car.details?.customerNotes}
        cellClassName="px-3 py-2 min-w-[150px] border-r border-gray-100 dark:border-white/5 max-w-[180px]"
        valueClassName="text-sm text-gray-900 dark:text-white line-clamp-1"
      />

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

export const CarsTable = memo(function CarsTable({
  cars,
  isLoading,
  currentPage,
  pageSize,
  isAdmin,
  onPhotoClick,
  onUpdateCar,
  onDeleteCar,
  formatDate,
}: CarsTableProps) {
  const t = useTranslations();
  const tTable = useTranslations("carsTable");

  return (
    <div className="scrollbar-visible overflow-x-auto">
      <Table.Root>
        <Table.Header className="sticky top-0 z-30">
          <Table.Row className="bg-gray-50 hover:bg-gray-50 dark:bg-[#0b0f14] dark:hover:bg-[#0b0f14]">
            <Table.ColumnHeaderCell className="sticky left-0 z-40 bg-gray-50 dark:bg-[#0b0f14] p-0">
              <div className="flex items-stretch h-full w-full">
                <div className="w-[72px] sm:w-[124px] px-2 sm:px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{tTable("photos")}</div>
                <div className="w-px self-stretch bg-gray-200 dark:bg-white/10 flex-shrink-0" />
                <div className="w-[124px] sm:w-[170px] px-2 sm:px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{tTable("car")}</div>
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
                onPhotoClick={onPhotoClick}
                onUpdateCar={onUpdateCar}
                onDeleteCar={onDeleteCar}
                formatDate={formatDate}
              />
            ))
          )}
        </Table.Body>
      </Table.Root>
    </div>
  );
});
