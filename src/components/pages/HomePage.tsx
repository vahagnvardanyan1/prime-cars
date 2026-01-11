"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { ImportCalculator } from "@/components/ImportCalculator";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Link } from "@/i18n/routing";
import { useHomeCars } from "@/hooks/useHomeCars";

export const HomePage = () => {
  const t = useTranslations();
  const router = useRouter();
  const { cars, isLoading } = useHomeCars();

  return (
    <div className="pt-20">
      <section className="relative overflow-hidden bg-gray-50 dark:bg-black min-h-[90vh] flex items-center transition-colors duration-300">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] dark:opacity-100 opacity-0 transition-opacity duration-300">
          <div className="glow-effect"></div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="mb-6 text-gray-900 dark:text-white">
                {t("home.hero.title")}
              </h1>

              <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
                {t("home.hero.description")}
              </p>

              <Link
                href="/calculator"
                className="px-8 py-3 bg-[#429de6] text-white rounded-lg hover:bg-[#3a8acc] transition-all hover:shadow-lg hover:shadow-blue-500/20 mx-auto lg:mx-0 block lg:inline-block"
              >
                {t("home.hero.primaryCta")}
              </Link>
            </div>

            <div className="relative">
              <Image
                src="/logo.png"
                alt={t("home.hero.heroImageAlt")}
                className="w-full h-auto relative z-10"
                width={1000}
                height={600}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-white dark:bg-black transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="mb-4">{t("home.popularDeals.title")}</h2>
            <p className="max-w-3xl mx-auto">
              {t("home.popularDeals.description")}
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white dark:from-black to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white dark:from-black to-transparent z-10 pointer-events-none" />
            
            <Carousel
              opts={{
                align: "center",
                loop: true,
                slidesToScroll: 1,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 6 }).map((_, index) => (
                  <CarouselItem key={`skeleton-${index}`} className="pl-4 basis-[85%] sm:basis-[55%] md:basis-[42%] lg:basis-[31%] xl:basis-[28%]">
                    <div className="bg-white dark:bg-[#111111] rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 h-full">
                      <div className="relative aspect-[16/10] bg-gray-200 dark:bg-white/5 animate-pulse" />
                      <div className="p-6 space-y-3">
                        <div className="h-5 bg-gray-200 dark:bg-white/5 rounded animate-pulse" />
                        <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-3/4 animate-pulse" />
                        <div className="border-t border-gray-200 dark:border-white/10 pt-4">
                          <div className="h-3 bg-gray-200 dark:bg-white/5 rounded w-1/2 mb-2 animate-pulse" />
                          <div className="h-6 bg-gray-200 dark:bg-white/5 rounded w-2/3 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))
              ) : !cars || cars.length === 0 ? (
                // Empty state
                <div className="w-full flex items-center justify-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    {t("home.popularDeals.noCars")}
                  </p>
                </div>
              ) : (
                // Actual car data from backend
                cars.map((car) => {
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
                        onClick={() => router.push(`/cars/${car.id}`)}
                        className="bg-white dark:bg-[#111111] rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 hover:border-[#429de6]/50 transition-all group h-full cursor-pointer"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-[#1a1a1a]">
                          <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-black/50 backdrop-blur-sm rounded-full text-gray-900 dark:text-white text-xs border border-gray-200 dark:border-white/20">
                            {car.year}
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
                            {car.transmission && `${car.transmission}`}
                            {car.transmission && car.fuelType && " • "}
                            {car.fuelType && `${car.fuelType}`}
                            {(car.transmission || car.fuelType) && car.engine && " • "}
                            {car.engine && `${car.engine}`}
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
                })
              )}
            </CarouselContent>
              <CarouselPrevious className="left-2 hidden md:flex z-20" />
              <CarouselNext className="right-2 hidden md:flex z-20" />
            </Carousel>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-white dark:bg-black border-t border-gray-200 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="mb-4">{t("home.importCosts.title")}</h2>
            <p className="max-w-3xl mx-auto">
              {t("home.importCosts.description")}
            </p>
          </div>

          <ImportCalculator />
        </div>
      </section>
    </div>
  );
};
