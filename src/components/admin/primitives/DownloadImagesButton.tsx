"use client";

import { useState } from "react";

import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { downloadCarImages, downloadCarImagesAsZip } from "@/lib/utils/downloadImages";

type DownloadImagesButtonProps = {
  images: string[];
  carName: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  useZip?: boolean;
  className?: string;
  showCount?: boolean;
  compactText?: boolean;
};

export const DownloadImagesButton = ({
  images,
  carName,
  variant = "outline",
  size = "default",
  useZip = true,
  className,
  showCount = true,
  compactText = false,
}: DownloadImagesButtonProps) => {
  const t = useTranslations("downloadImages");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!images || images.length === 0) {
      toast.error(t("error"), {
        description: t("noImages"),
      });
      return;
    }

    setIsDownloading(true);

    try {
      if (useZip) {
        // Download as ZIP file
        const result = await downloadCarImagesAsZip({ images, carName });
        
        if (result.success) {
          if (result.error) {
            // Partial success - show warning with exact error details
            toast.warning(t("partial"), {
              description: result.error,
              duration: 10000, // Show warning longer for reading details
            });
          } else {
            // Full success
            toast.success(t("success"), {
              description: t("successMessage", { count: images.length }),
            });
          }
        } else {
          // Show exact error message from the download function
          throw new Error(result.error || t("errorMessage"));
        }
      } else {
        // Download individually
        const result = await downloadCarImages({ images, carName });
        
        if (result.success) {
          toast.success(t("success"), {
            description: t("successIndividual", { 
              count: result.downloadedCount,
              total: images.length 
            }),
          });
        } else if (result.downloadedCount > 0) {
          toast.warning(t("partial"), {
            description: t("partialMessage", { 
              count: result.downloadedCount,
              total: images.length,
              failed: result.failedCount 
            }),
          });
        } else {
          throw new Error(t("errorMessage"));
        }
      }
    } catch (error) {
      console.error("Download error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(t("error"), {
        description: errorMessage,
        duration: 10000, // Show error longer for reading details
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={isDownloading || !images || images.length === 0}
      className={className}
    >
      {isDownloading ? (
        <>
          <div aria-hidden="true" className="animate-spin">
            <Loader2 className="w-4 h-4 sm:mr-2" />
          </div>
          <span className={compactText ? "hidden sm:inline" : ""}>{t("downloading")}</span>
        </>
      ) : (
        <>
          <Download aria-hidden="true" className="w-4 h-4 sm:mr-2" />
          <span className={compactText ? "hidden sm:inline" : ""}>
            {showCount
              ? t("downloadAll", { count: images?.length || 0 })
              : t("buttonShort")
            }
          </span>
        </>
      )}
    </Button>
  );
};
