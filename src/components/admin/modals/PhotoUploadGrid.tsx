"use client";

import type { ChangeEvent } from "react";

import Image from "next/image";

import { ImagePlus } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/components/ui/utils";

type PhotoUploadGridProps = {
  label: string;
  maxFiles: number;
  previews: (string | null)[];
  onPickFile: ({ index, file }: { index: number; file: File | null }) => void;
  tileClassName?: string;
};

export const PhotoUploadGrid = ({
  label,
  maxFiles,
  previews,
  onPickFile,
  tileClassName,
}: PhotoUploadGridProps) => {
  const t = useTranslations();

  const onChangeAt =
    ({ index }: { index: number }) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      onPickFile({ index, file });
    };

  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
        {label}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {Array.from({ length: maxFiles }).map((_, i) => {
          const preview = previews[i] ?? null;
          const inputId = `${label.replace(/\s+/g, "-").toLowerCase()}-${i}`;

          return (
            <label
              key={inputId}
              htmlFor={inputId}
              className={cn(
                "group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed bg-white transition-colors",
                "h-[120px]",
                "border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:bg-[#0b0f14] dark:hover:bg-white/5",
                preview ? "border-solid" : "",
                tileClassName,
              )}
            >
              <input
                id={inputId}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={onChangeAt({ index: i })}
              />

              {preview ? (
                <>
                  <Image
                    src={preview}
                    alt={t("admin.modals.photoUpload.previewAlt")}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 240px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-1 text-[11px] font-medium text-gray-900 opacity-0 transition-opacity group-hover:opacity-100">
                    {t("admin.modals.photoUpload.replace")}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1.5 px-3 text-gray-600 dark:text-gray-300">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-200 dark:bg-white/5 dark:ring-white/10">
                    <ImagePlus className="h-4 w-4 text-[#429de6]" />
                  </div>
                  <div className="text-sm font-medium">{t("admin.modals.photoUpload.uploadPhoto")}</div>
                  <div className="hidden text-xs text-gray-500 dark:text-gray-400 sm:block">
                    {t("admin.modals.photoUpload.clickToSelect")}
                  </div>
                </div>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
};




