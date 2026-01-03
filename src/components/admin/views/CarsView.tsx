"use client";

import Image from "next/image";

import type { AdminCar } from "@/lib/admin/types";
import { formatUsd, getCarStatusTone } from "@/lib/admin/format";
import { Surface } from "@/components/admin/primitives/Surface";
import { TonePill } from "@/components/admin/primitives/TonePill";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CarsViewProps = {
  cars: AdminCar[];
};

export const CarsView = ({ cars }: CarsViewProps) => {
  return (
    <Surface className="overflow-hidden">
      <div className="px-6 py-5">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          Inventory
        </div>
        <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
          Table-style rows with strong alignment and calm density.
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/70 hover:bg-gray-50/70 dark:bg-white/5">
            <TableHead className="px-6 py-3">Car</TableHead>
            <TableHead className="py-3">Price</TableHead>
            <TableHead className="py-3">Status</TableHead>
            <TableHead className="py-3 text-right pr-6">Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cars.map((car) => (
            <TableRow key={car.id} className="hover:bg-gray-50/70 dark:hover:bg-white/5">
              <TableCell className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-16 overflow-hidden rounded-xl ring-1 ring-gray-200 dark:ring-white/10">
                    <Image
                      src={car.imageUrl}
                      alt={car.model}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {car.model}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                      {car.year}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatUsd({ value: car.priceUsd })}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <TonePill tone={getCarStatusTone({ status: car.status })}>
                  {car.status}
                </TonePill>
              </TableCell>
              <TableCell className="py-4 text-right pr-6">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Today
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Surface>
  );
};


