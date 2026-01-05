"use client";

import Image from "next/image";

import { Calendar, Fuel, Gauge, MapPin } from "lucide-react";

import { carsData } from "@/data/cars";

export const CarsPage = () => {

  return (
    <div className="pt-20 min-h-screen bg-white dark:bg-black transition-colors duration-300">


      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {carsData.map((car) => (
                  <div
                    key={car.id}
                    className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-300 dark:border-white/10 overflow-hidden group hover:border-[#429de6]/50 transition-all cursor-pointer"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-black">
                      <Image
                        src={car.image}
                        alt={`${car.brand} ${car.model}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-gray-900 dark:text-white group-hover:text-[#429de6] transition-colors">
                            {car.brand} {car.model}
                          </h3>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-1 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>{car.year}</span>
                          </div>
                        </div>
                        <div className="text-[#429de6]">${car.price.toLocaleString()}</div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{car.location}</span>
                      </div>

                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-300 dark:border-white/10">
                    <div className="text-center">
                      <Gauge className="w-4 h-4 text-gray-500 dark:text-gray-400 mx-auto mb-1" />
                      <div className="text-gray-900 dark:text-white text-sm">{car.hp} HP</div>
                    </div>
                    <div className="text-center">
                      <Fuel className="w-4 h-4 text-gray-500 dark:text-gray-400 mx-auto mb-1" />
                      <div className="text-gray-900 dark:text-white text-sm">{car.fuel}</div>
                    </div>
                    <div className="text-center text-gray-900 dark:text-white text-sm">
                      {car.transmission}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
};
