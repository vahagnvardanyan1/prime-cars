"use client";

import type { ChangeEvent, DragEvent } from "react";
import { memo, useState, useCallback, useMemo } from "react";

import Image from "next/image";

import { ImagePlus, Upload } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/components/ui/utils";

type PhotoUploadGridProps = {
  label: string;
  previews: (string | null)[];
  onPickFile: ({ index, file }: { index: number; file: File | null }) => void;
  onRemoveFile: ({ index }: { index: number }) => void;
  onPickMultipleFiles?: (files: File[]) => void;
  tileClassName?: string;
};

// Memoized photo tile component to prevent unnecessary re-renders
type PhotoTileProps = {
  index: number;
  preview: string | null;
  label: string;
  tileClassName?: string;
  onPickFile: ({ index, file }: { index: number; file: File | null }) => void;
  onRemoveFile: ({ index }: { index: number }) => void;
  onPickMultipleFiles?: (files: File[]) => void;
};

const PhotoTile = memo(({
  index,
  preview,
  label,
  tileClassName,
  onPickFile,
  onRemoveFile,
  onPickMultipleFiles,
}: PhotoTileProps) => {
  const t = useTranslations();
  const [isDragging, setIsDragging] = useState(false);
  
  const inputId = `${label.replace(/\s+/g, "-").toLowerCase()}-${index}`;
  
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (!files || files.length === 0) {
      return;
    }
    
    // If multiple files selected and we have the handler, use it
    if (files.length > 1 && onPickMultipleFiles) {
      const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
      onPickMultipleFiles(fileArray);
      // Reset the input
      e.target.value = '';
      return;
    }
    
    // Single file
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
      onPickFile({ index, file });
    }
    // Reset the input
    e.target.value = '';
  }, [index, onPickFile, onPickMultipleFiles]);
  
  const handleDragOver = useCallback((e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    
    if (!files || files.length === 0) {
      return;
    }
    
    // If multiple files dropped and we have the handler, use it
    if (files.length > 1 && onPickMultipleFiles) {
      const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
      onPickMultipleFiles(fileArray);
      return;
    }
    
    // Single file
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
      onPickFile({ index, file });
    }
  }, [index, onPickFile, onPickMultipleFiles]);
  
  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemoveFile({ index });
  }, [index, onRemoveFile]);
  
  return (
    <label
      htmlFor={inputId}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed bg-white transition-all duration-200",
        "h-[120px]",
        "border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:bg-[#0b0f14] dark:hover:bg-white/5",
        preview ? "border-solid" : "",
        isDragging && "border-[#429de6] bg-blue-50 dark:bg-[#429de6]/10 scale-[1.02] ring-2 ring-[#429de6]/50",
        tileClassName,
      )}
      suppressHydrationWarning
    >
      <input
        id={inputId}
        type="file"
        accept="image/*"
        multiple={!!onPickMultipleFiles}
        className="sr-only"
        onChange={handleChange}
      />

      {preview ? (
        <>
          <Image
            src={preview}
            alt={t("admin.modals.photoUpload.previewAlt")}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 240px"
            unoptimized
            suppressHydrationWarning
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-1 text-[11px] font-medium text-gray-900 opacity-0 transition-opacity group-hover:opacity-100">
            {t("admin.modals.photoUpload.replace")}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110"
            aria-label="Remove photo"
          >
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#429de6]/90">
              <Upload className="h-8 w-8 text-white animate-bounce" />
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-1.5 px-3 text-gray-600 dark:text-gray-300">
          <div className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-200 dark:bg-white/5 dark:ring-white/10 transition-all",
            isDragging && "scale-110 ring-2 ring-[#429de6] bg-[#429de6]/10"
          )}>
            {isDragging ? (
              <Upload className="h-4 w-4 text-[#429de6] animate-bounce" />
            ) : (
              <ImagePlus className="h-4 w-4 text-[#429de6]" />
            )}
          </div>
          <div className="text-sm font-medium">{t("admin.modals.photoUpload.uploadPhoto")}</div>
          <div className="hidden text-xs text-gray-500 dark:text-gray-400 sm:block">
            {isDragging ? "Drop to upload" : t("admin.modals.photoUpload.clickToSelect")}
          </div>
        </div>
      )}
    </label>
  );
});

PhotoTile.displayName = 'PhotoTile';

export const PhotoUploadGrid = ({
  label,
  previews,
  onPickFile,
  onRemoveFile,
  onPickMultipleFiles,
  tileClassName,
}: PhotoUploadGridProps) => {
  // Memoize the tiles to prevent unnecessary re-renders
  const tiles = useMemo(() => {
    return previews.map((preview, i) => (
      <PhotoTile
        key={`photo-tile-${i}`}
        index={i}
        preview={preview}
        label={label}
        tileClassName={tileClassName}
        onPickFile={onPickFile}
        onRemoveFile={onRemoveFile}
        onPickMultipleFiles={onPickMultipleFiles}
      />
    ));
  }, [previews, label, tileClassName, onPickFile, onRemoveFile, onPickMultipleFiles]);

  return (
    <div suppressHydrationWarning>
      {label && (
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
          {label}
        </div>
      )}
      <div 
        className={cn("grid gap-3", label ? "mt-3" : "", previews.length === 1 ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4")}
        suppressHydrationWarning
      >
        {tiles}
      </div>
    </div>
  );
};




