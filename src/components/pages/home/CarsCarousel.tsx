"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

import type { Car } from "@/lib/cars/types";
import { translateEngineType, translateTransmission, translateFuelType } from "@/lib/utils/translateVehicleSpecs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface CarsCarouselProps {
  cars: Car[];
}

export const CarsCarousel = ({ cars }: CarsCarouselProps) => {
  const t = useTranslations();
  const tCarDetails = useTranslations("carDetails");
  const router = useRouter();

  if (!cars || cars.length === 0) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          {t("home.popularDeals.noCars")}
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white dark:from-black to-transparent z-10 pointer-events-none md:w-28" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-black to-transparent z-10 pointer-events-none md:w-28" />
      
      <Carousel
        opts={{
          align: "center",
          loop: true,
          slidesToScroll: 1,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {cars.map((car) => {
            const carImage = car.photos?.[0] || car.imageUrl;
            const carName = `${car.brand} ${car.model}`;
            const carPrice = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }).format(car.priceUsd);

            return (
              <CarouselItem
                key={car.id}
                className="pl-4 basis-[85%] sm:basis-[55%] md:basis-[42%] lg:basis-[31%] xl:basis-[28%]"
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/cars/${car.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(`/cars/${car.id}`);
                    }
                  }}
                  className="bg-white dark:bg-[#111111] rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 hover:border-[#429de6]/50 transition-all group h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#429de6] focus-visible:ring-offset-2"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-[#1a1a1a]">
                    {/* Year Badge - Left */}
                    <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-black/50 backdrop-blur-sm rounded-full text-gray-900 dark:text-white text-xs border border-gray-200 dark:border-white/20 z-10">
                      {car.year}
                    </div>
                    
                    {/* Category Badge - Right */}
                    <div className={`absolute top-4 right-4 px-3 py-1 backdrop-blur-sm rounded-full text-xs font-semibold border z-10 ${
                      car.category === "AVAILABLE" 
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                        : car.category === "ONROAD" 
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" 
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                    }`}>
                      {car.category === "AVAILABLE" && t("carDetails.badges.available")}
                      {car.category === "ONROAD" && t("carDetails.badges.arriving")}
                      {car.category === "TRANSIT" && t("carDetails.badges.order")}
                    </div>
                    
                    <Image
                      src={carImage}
                      alt={carName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="mb-2 line-clamp-2">{carName}</h3>
                    <p className="text-sm mb-4 text-gray-600 dark:text-gray-400">
                      {car.transmission && translateTransmission(car.transmission, tCarDetails)}
                      {car.transmission && car.fuelType && " • "}
                      {car.fuelType && translateFuelType(car.fuelType, tCarDetails)}
                      {(car.transmission || car.fuelType) && car.engine && " • "}
                      {car.engine && translateEngineType(car.engine, tCarDetails)}
                    </p>
                    <div className="border-t border-gray-200 dark:border-white/10 pt-4">
                      <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                        {t("home.popularDeals.priceLabel")}
                      </div>
                      <div className="text-gray-900 dark:text-white text-lg font-semibold">
                        {carPrice}
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-2 hidden md:flex z-20 h-12 w-12 border-2 border-[#429de6]/40 bg-white/95 dark:bg-black/70 backdrop-blur-xl hover:bg-gradient-to-br hover:from-[#429de6] hover:to-[#3a8acc] hover:border-[#429de6] dark:hover:from-[#429de6] dark:hover:to-[#3a8acc] hover:scale-110 hover:shadow-2xl hover:shadow-[#429de6]/40 transition-all duration-300 text-gray-700 hover:text-white dark:text-gray-300 dark:hover:text-white disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed" />
        <CarouselNext className="right-2 hidden md:flex z-20 h-12 w-12 border-2 border-[#429de6]/40 bg-white/95 dark:bg-black/70 backdrop-blur-xl hover:bg-gradient-to-br hover:from-[#429de6] hover:to-[#3a8acc] hover:border-[#429de6] dark:hover:from-[#429de6] dark:hover:to-[#3a8acc] hover:scale-110 hover:shadow-2xl hover:shadow-[#429de6]/40 transition-all duration-300 text-gray-700 hover:text-white dark:text-gray-300 dark:hover:text-white disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed" />
      </Carousel>
    </div>
  );
};
