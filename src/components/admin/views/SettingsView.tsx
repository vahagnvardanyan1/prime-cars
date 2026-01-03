"use client";

import { useMemo, useState } from "react";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Surface } from "@/components/admin/primitives/Surface";
import { formatUsd } from "@/lib/admin/format";
import type { ShippingCity } from "@/lib/admin/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SettingsViewProps = {
  cities: ShippingCity[];
  onApplyGlobalAdjustment: ({ delta }: { delta: number }) => void;
  onUpdateCityClick: ({ cityId }: { cityId: string }) => void;
  onDeleteCity: ({ cityId }: { cityId: string }) => void;
};

export const SettingsView = ({
  cities,
  onApplyGlobalAdjustment,
  onUpdateCityClick,
  onDeleteCity,
}: SettingsViewProps) => {
  const [delta, setDelta] = useState("");

  const canApply = useMemo(() => {
    return delta.trim().length > 0 && Number.isFinite(Number(delta));
  }, [delta]);

  const apply = () => {
    if (!canApply) return;
    onApplyGlobalAdjustment({ delta: Number(delta) });
    setDelta("");
  };

  return (
    <div className="space-y-6">
      <Surface>
        <div className="px-6 py-5">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            Shipping Prices
          </div>
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Manage city-specific shipping, with a safe global adjustment control.
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="rounded-2xl border border-[#429de6]/20 bg-[#429de6]/[0.05] p-5 dark:border-[#429de6]/25 dark:bg-[#429de6]/10">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  Global Price Adjustment
                </div>
                <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  Enter a value to <span className="font-medium">add to all city shipping prices</span>.
                  Example: if all are 100 and you enter 100 → all become 200.
                </div>
              </div>

              <div className="flex w-full gap-2 md:w-auto">
                <Input
                  value={delta}
                  onChange={(e) => setDelta(e.target.value)}
                  inputMode="numeric"
                  placeholder="100"
                  className="h-11 w-full rounded-xl border-[#429de6]/20 bg-white text-gray-900 shadow-none focus-visible:ring-[#429de6]/30 md:w-[140px] dark:border-[#429de6]/25 dark:bg-[#0a0a0a] dark:text-white"
                />
                <Button
                  type="button"
                  className="h-11 rounded-xl bg-[#429de6] text-white hover:bg-[#3a8acc] disabled:opacity-60"
                  disabled={!canApply}
                  onClick={apply}
                >
                  Apply to All Cities
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Surface>

      <Surface className="overflow-hidden">
        <div className="px-6 py-5">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            Cities
          </div>
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Update or delete shipping prices per city.
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/70 hover:bg-gray-50/70 dark:bg-white/5">
              <TableHead className="px-6 py-3">City</TableHead>
              <TableHead className="py-3">Shipping</TableHead>
              <TableHead className="py-3 text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cities.map((c) => (
              <TableRow key={c.id} className="hover:bg-gray-50/70 dark:hover:bg-white/5">
                <TableCell className="px-6 py-4">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {c.city}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatUsd({ value: c.shippingUsd })}
                  </div>
                </TableCell>
                <TableCell className="py-4 text-right pr-6">
                  <div className="inline-flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 rounded-xl border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-[#0b0f14] dark:text-white dark:hover:bg-white/5"
                      onClick={() => onUpdateCityClick({ cityId: c.id })}
                    >
                      Update
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 rounded-xl border-gray-200 bg-white text-[#da565b] hover:bg-red-50 hover:text-[#da565b] dark:border-white/10 dark:bg-[#0b0f14] dark:hover:bg-white/5"
                        >
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl border-gray-200 dark:border-white/10 dark:bg-[#0b0f14]">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-gray-900 dark:text-white">
                            Delete {c.city}?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove the city from shipping price management. This action can&apos;t be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="rounded-xl bg-[#da565b] text-white hover:bg-[#c84b50]"
                            onClick={() => onDeleteCity({ cityId: c.id })}
                          >
                            Confirm Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Surface>
    </div>
  );
};


