"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type CarsLightboxProps = {
  open: boolean;
  photos: string[];
  onClose: () => void;
};

const spinner = (
  <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
);

export const CarsLightbox = ({ open, photos, onClose }: CarsLightboxProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setCurrentPhotoIndex(0);
      setImageLoading(true);
    }
  }, [open, photos]);

  const handleNextPhoto = useCallback(() => {
    setImageLoading(true);
    setCurrentPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  }, [photos.length]);

  const handlePrevPhoto = useCallback(() => {
    setImageLoading(true);
    setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  }, [photos.length]);

  const handleImageLoad = useCallback(() => setImageLoading(false), []);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevPhoto();
      else if (e.key === "ArrowRight") handleNextPhoto();
      else if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handleNextPhoto, handlePrevPhoto, onClose]);

  useEffect(() => {
    if (!open || photos.length === 0) return;
    photos.forEach((photoUrl) => {
      const img = new window.Image();
      img.src = photoUrl;
    });
  }, [open, photos]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-all z-20"
        aria-label="Close"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </button>

      {photos.length > 1 && (
        <button
          onClick={handlePrevPhoto}
          className="absolute left-2 sm:left-4 p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all z-20"
          aria-label="Previous photo"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </button>
      )}

      <div className="relative w-full max-w-7xl h-[85vh] sm:h-[90vh] flex items-center justify-center">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            {spinner}
          </div>
        )}

        {photos.length > 0 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photos[currentPhotoIndex]}
            alt={`Photo ${currentPhotoIndex + 1}`}
            className={`max-w-full max-h-full object-contain transition-opacity duration-200 ${
              imageLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={handleImageLoad}
          />
        )}
      </div>

      {photos.length > 1 && (
        <button
          onClick={handleNextPhoto}
          className="absolute right-2 sm:right-4 p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all z-20"
          aria-label="Next photo"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </button>
      )}

      {photos.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
          {currentPhotoIndex + 1} / {photos.length}
        </div>
      )}
    </div>
  );
};
