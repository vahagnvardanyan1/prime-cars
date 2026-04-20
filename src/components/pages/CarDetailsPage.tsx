"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { ChevronLeft, MapPin, Gauge, Fuel, Settings, Calendar, TrendingUp, X, ChevronRight } from "lucide-react";
import { useCarDetails } from "@/hooks/useCarDetails";
import { DownloadImagesButton } from "@/components/ui/DownloadImagesButton";
import { translateEngineType, translateTransmission, translateFuelType } from "@/lib/utils/translateVehicleSpecs";

export const CarDetailsPage = ({ carId }: { carId: string }) => {
  const t = useTranslations("carDetails");
  const router = useRouter();
  const { car, isLoading } = useCarDetails({ carId });
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showShareSuccess, setShowShareSuccess] = useState(false);

  const photos = car?.photos || (car ? [car.imageUrl] : []);

  // Preload images for faster navigation
  useEffect(() => {
    if (photos.length === 0) return;

    // Preload all images when component mounts
    photos.forEach((photo) => {
      const img = new Image();
      img.src = photo;
    });
  }, [photos]);

  // Preload adjacent images when lightbox index changes
  useEffect(() => {
    if (!isLightboxOpen || photos.length === 0) return;

    const preloadImage = (index: number) => {
      if (index >= 0 && index < photos.length) {
        const img = new Image();
        img.src = photos[index];
      }
    };

    // Preload next and previous images
    preloadImage((lightboxIndex + 1) % photos.length);
    preloadImage((lightboxIndex - 1 + photos.length) % photos.length);
  }, [isLightboxOpen, lightboxIndex, photos]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen || photos.length === 0) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev + 1) % photos.length);
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev - 1 + photos.length) % photos.length);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isLightboxOpen, photos.length]);

  // Loading state
  if (isLoading) {
    return (
      <div className="pt-20 min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
            {t("loading.title")}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
            {t("loading.description")}
          </p>
          
          {/* Animated Dots */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#429de6] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#429de6] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#429de6] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!car) {
    return (
      <div className="pt-20 min-h-screen bg-white dark:bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t("notFound.title")}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-5">
            {t("notFound.description")}
          </p>
          <button
            onClick={() => router.push("/cars")}
            className="inline-flex items-center px-5 py-2.5 bg-[#429de6] text-white text-sm font-semibold rounded-lg hover:bg-[#3a8acc] transition-colors hover:shadow-lg active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#429de6] focus-visible:ring-offset-2"
          >
            <ChevronLeft aria-hidden="true" className="w-4 h-4 mr-1.5" />
            {t("notFound.backButton")}
          </button>
        </div>
      </div>
    );
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const nextPhoto = () => {
    setLightboxIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setLightboxIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleShare = async () => {
    if (!car) return;

    const shareData = {
      title: `${car.brand} ${car.model}`,
      text: t("share.text", {
        year: car.year,
        brand: car.brand,
        model: car.model,
        price: car.priceUsd.toLocaleString(),
      }),
      url: window.location.href,
    };

    try {
      // Try to use native Web Share API (available on mobile devices)
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        setShowShareSuccess(true);
        setTimeout(() => setShowShareSuccess(false), 3000);
      }
    } catch (error) {
      // User cancelled or error occurred
      if ((error as Error).name !== "AbortError") {
        console.error("Error sharing:", error);
        // Try clipboard as last resort
        try {
          await navigator.clipboard.writeText(window.location.href);
          setShowShareSuccess(true);
          setTimeout(() => setShowShareSuccess(false), 3000);
        } catch (clipboardError) {
          console.error("Error copying to clipboard:", clipboardError);
        }
      }
    }
  };

  const getCategoryBadge = () => {
    switch (car.category) {
      case "AVAILABLE":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full border-2 border-emerald-500 dark:border-emerald-400 text-emerald-700 dark:text-emerald-400">
            {t("badges.available")}
          </span>
        );
      case "ONROAD":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">
            {t("badges.arriving")}
          </span>
        );
      case "TRANSIT":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-[#429de6]/20 text-blue-700 dark:text-[#429de6]">
            {t("badges.order")}
          </span>
        );
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-4 sm:py-5 lg:py-6">
        {/* Back Button */}
        <button
          onClick={() => router.push("/cars")}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4 sm:mb-5 lg:mb-6 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-sm sm:text-base">{t("backButton")}</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-10">
          {/* Photo Gallery */}
          <div className="space-y-2 sm:space-y-3">
            {/* Main Image */}
            <div 
              onClick={() => openLightbox(selectedImage)}
              className="aspect-[16/10] rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 cursor-pointer group relative"
            >
              <img
                src={photos[selectedImage]}
                alt={`${car.brand} ${car.model}`}
                loading="eager"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Zoom icon overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 dark:bg-black/90 rounded-full p-2">
                  <svg className="w-5 h-5 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Thumbnail Grid */}
            <div className="grid grid-cols-5 gap-2">
              {photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden transition-all ${
                    selectedImage === index
                      ? "ring-2 ring-[#429de6] ring-offset-1 dark:ring-offset-black scale-95"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={photo}
                    alt={`${car.brand} ${car.model} - ${index + 1}`}
                    loading={index <= 5 ? "eager" : "lazy"}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Car Details */}
          <div className="space-y-4 sm:space-y-5">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1.5 line-clamp-2">
                    {car.brand} {car.model}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    {car.year} • {car.location}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {getCategoryBadge()}
                </div>
              </div>

              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                ${car.priceUsd.toLocaleString()}
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 sm:p-5">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                {t("specifications")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {car.year && (
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <div className="p-2 bg-white dark:bg-white/10 rounded-lg flex-shrink-0">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t("specs.year")}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{car.year}</p>
                    </div>
                  </div>
                )}

                {car.horsepower && (
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <div className="p-2 bg-white dark:bg-white/10 rounded-lg flex-shrink-0">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t("specs.horsepower")}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {car.horsepower} {t("horsepowerUnit")}
                      </p>
                    </div>
                  </div>
                )}

                {car.engine && (
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <div className="p-2 bg-white dark:bg-white/10 rounded-lg flex-shrink-0">
                      <Gauge className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t("specs.engine")}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{translateEngineType(car.engine, t)}</p>
                    </div>
                  </div>
                )}

                {car.transmission && (
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <div className="p-2 bg-white dark:bg-white/10 rounded-lg flex-shrink-0">
                      <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t("specs.transmission")}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {translateTransmission(car.transmission, t)}
                      </p>
                    </div>
                  </div>
                )}

                {car.fuelType && (
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <div className="p-2 bg-white dark:bg-white/10 rounded-lg flex-shrink-0">
                      <Fuel className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t("specs.fuelType")}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{translateFuelType(car.fuelType, t)}</p>
                    </div>
                  </div>
                )}

                {car.location && (
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <div className="p-2 bg-white dark:bg-white/10 rounded-lg flex-shrink-0">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t("specs.location")}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{car.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-2.5 sm:space-y-3">
              {/* Primary Action */}
              <a 
                href="tel:+37444771130"
                className="block w-full px-5 sm:px-6 py-3 sm:py-3.5 bg-[#429de6] hover:bg-[#3a8acc] text-white text-sm sm:text-base font-semibold rounded-xl transition-all duration-200 hover:shadow-lg active:scale-95 text-center"
              >
                {t("contactButton")}
              </a>
              
              {/* Secondary Actions */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <button 
                  onClick={handleShare}
                  className="px-4 sm:px-5 py-3 sm:py-3.5 bg-white dark:bg-white/10 text-gray-900 dark:text-white text-sm sm:text-base border border-gray-200 dark:border-white/20 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-white/20 transition-all duration-200"
                >
                  {t("shareButton")}
                </button>
                
                <DownloadImagesButton
                  images={photos}
                  carName={`${car.brand} ${car.model} ${car.year}`}
                  variant="outline"
                  size="default"
                  useZip={true}
                  showCount={false}
                  compactText={true}
                  className="px-4 sm:px-5 py-3 sm:py-3.5 bg-white dark:bg-white/10 text-gray-900 dark:text-white text-sm sm:text-base border border-gray-200 dark:border-white/20 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-white/20 transition-all duration-200 h-auto justify-center"
                />
              </div>
            </div>

            {/* Share Success Toast */}
            {showShareSuccess && (
              <div className="fixed bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 mx-4">
                <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 sm:px-6 py-3 sm:py-4 rounded-xl shadow-lg flex items-center gap-3">
                  <svg className="w-5 h-5 text-emerald-400 dark:text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium text-sm sm:text-base">{t("share.success")}</span>
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="bg-blue-50 dark:bg-[#429de6]/10 border border-blue-200 dark:border-[#429de6]/20 rounded-xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-400">
                <strong>{t("note.title")}:</strong> {t("note.description")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeLightbox();
            }}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-full transition-all z-50 touch-none"
            aria-label={t("lightbox.close")}
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-white pointer-events-none" />
          </button>

          {/* Previous Button */}
          {photos.length > 1 && (
            <button
              onClick={prevPhoto}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                prevPhoto();
              }}
              className="absolute left-2 sm:left-4 p-2 sm:p-3 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-full transition-all z-50 touch-none"
              aria-label={t("lightbox.previous")}
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white pointer-events-none" />
            </button>
          )}

          {/* Main Image */}
          <div className="relative w-full max-w-7xl max-h-[85vh] sm:max-h-[90vh] pointer-events-none">
            <img
              src={photos[lightboxIndex]}
              alt={`${car.brand} ${car.model} - ${lightboxIndex + 1}`}
              loading="eager"
              className="w-full h-full max-h-[85vh] sm:max-h-[90vh] object-contain"
            />
          </div>

          {/* Next Button */}
          {photos.length > 1 && (
            <button
              onClick={nextPhoto}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                nextPhoto();
              }}
              className="absolute right-2 sm:right-4 p-2 sm:p-3 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-full transition-all z-50 touch-none"
              aria-label={t("lightbox.next")}
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white pointer-events-none" />
            </button>
          )}

          {/* Image Counter - Mobile (Top) */}
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 sm:hidden px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full text-white text-xs font-medium z-10">
            {lightboxIndex + 1} / {photos.length}
          </div>

          {/* Thumbnail Strip - Desktop Only */}
          <div className="hidden sm:flex absolute bottom-4 left-1/2 transform -translate-x-1/2 gap-2 px-4 py-3 bg-black/70 backdrop-blur-sm rounded-xl max-w-[90vw] overflow-x-auto z-40">
            {photos.map((photo, index) => (
              <button
                key={index}
                onClick={() => setLightboxIndex(index)}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setLightboxIndex(index);
                }}
                className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden transition-all touch-none ${
                  lightboxIndex === index
                    ? "ring-2 ring-[#429de6] scale-110"
                    : "opacity-60 hover:opacity-100 active:opacity-80"
                }`}
              >
                <img
                  src={photo}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover pointer-events-none"
                />
              </button>
            ))}
          </div>

          {/* Keyboard hint - Desktop Only */}
          <div className="hidden md:block absolute top-4 left-4 px-3 py-2 bg-black/70 backdrop-blur-sm rounded-lg text-white text-xs">
            {t("lightbox.keyboardHint")}
          </div>
        </div>
      )}
    </div>
  );
};
