"use client";

import { useMemo, useState } from "react";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddShippingModal } from "@/components/admin/modals/AddShippingModal";
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
  onApplyGlobalAdjustment: ({ delta }: { delta: number }) => Promise<void>;
  onUpdateCityClick: ({ cityId }: { cityId: string }) => void;
  onDeleteCity: ({ cityId }: { cityId: string }) => Promise<void>;
  onShippingCreated?: () => void;
  isLoading?: boolean;
  isAdmin?: boolean;
};

export const SettingsView = ({
  cities,
  onApplyGlobalAdjustment,
  onUpdateCityClick,
  onDeleteCity,
  onShippingCreated,
  isLoading = false,
  isAdmin = false,
}: SettingsViewProps) => {
  const t = useTranslations();
  const [delta, setDelta] = useState("");
  const [isAddShippingModalOpen, setIsAddShippingModalOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [deletingCityId, setDeletingCityId] = useState<string | null>(null);

  const canApply = useMemo(() => {
    return delta.trim().length > 0 && Number.isFinite(Number(delta));
  }, [delta]);

  const handleDeltaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value === "") {
      setDelta("");
      return;
    }
    
    if (value === "-") {
      setDelta("-");
      return;
    }
    
    if (/^-?\d*$/.test(value)) {
      setDelta(value);
    }
  };

  const apply = async () => {
    if (!canApply || isApplying) return;
    
    setIsApplying(true);
    try {
      await onApplyGlobalAdjustment({ delta: Number(delta) });
      setDelta("");
    } finally {
      setIsApplying(false);
    }
  };

  const handleDelete = async (cityId: string) => {
    setDeletingCityId(cityId);
    try {
      await onDeleteCity({ cityId });
    } finally {
      setDeletingCityId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Surface>
        <div className="px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("admin.settingsView.shippingPricesTitle")}
          </h1>
        </div>

        <div className="px-4 pb-6 sm:px-6">
          <div className="rounded-2xl border border-[#429de6]/20 bg-[#429de6]/[0.05] p-5 dark:border-[#429de6]/25 dark:bg-[#429de6]/10">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {t("admin.settingsView.globalAdjustmentTitle")}
                </div>
                <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  {t("admin.settingsView.globalAdjustmentBodyPrefix")}{" "}
                  <span className="font-medium">
                    {t("admin.settingsView.globalAdjustmentBodyEmphasis")}
                  </span>
                  . {t("admin.settingsView.globalAdjustmentExample")}
                </div>
              </div>

              <div className="flex w-full gap-2 md:w-auto">
                <Input
                  value={delta}
                  onChange={handleDeltaChange}
                  inputMode="numeric"
                  placeholder="100"
                  disabled={isApplying}
                  className="h-11 w-full rounded-xl border-[#429de6]/20 bg-white text-gray-900 shadow-none focus-visible:ring-[#429de6]/30 md:w-[140px] dark:border-[#429de6]/25 dark:bg-[#0a0a0a] dark:text-white"
                />
                <Button
                  type="button"
                  className="h-11 rounded-xl bg-[#429de6] text-white hover:bg-[#3a8acc] disabled:opacity-60 min-w-[140px]"
                  disabled={!canApply || isApplying}
                  onClick={apply}
                >
                  {isApplying ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Applying...</span>
                    </div>
                  ) : (
                    t("admin.settingsView.applyToAll")
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Surface>

      {isAdmin && (
        <Surface className="overflow-hidden">
          <div className="px-6 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t("admin.settingsView.citiesTitle")}
              </h1>
            </div>
            <Button
              type="button"
              onClick={() => setIsAddShippingModalOpen(true)}
              className="h-9 rounded-xl bg-[#429de6] text-white hover:bg-[#3a8acc] flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t("admin.settingsView.addCity")}</span>
            </Button>
          </div>

          <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/70 hover:bg-gray-50/70 dark:bg-white/5">
              <TableHead className="px-6 py-4 sm:px-8 text-sm font-semibold min-w-[200px]">{t("admin.settingsView.columns.city")}</TableHead>
              <TableHead className="px-4 py-4 text-sm font-semibold min-w-[180px]">{t("admin.settingsView.columns.shipping")}</TableHead>
              <TableHead className="px-4 py-4 text-right pr-6 sm:pr-8 text-sm font-semibold min-w-[200px]">
                {t("admin.settingsView.columns.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="py-12">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <svg className="animate-spin h-8 w-8 text-[#429de6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Loading shipping cities...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : cities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-12">
                  <div className="flex items-center justify-center text-center text-sm text-gray-600 dark:text-gray-400">
                    No shipping cities found
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              cities.map((c) => (
                <TableRow key={c.id} className="hover:bg-gray-50/70 dark:hover:bg-white/5">
                <TableCell className="px-6 py-6 sm:px-8 min-w-[200px]">
                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                    {c.city}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-6 min-w-[180px]">
                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                    {formatUsd({ value: c.shippingUsd })}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-6 text-right pr-6 sm:pr-8 min-w-[200px]">
                  <div className="inline-flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 px-4 rounded-xl border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-[#0b0f14] dark:text-white dark:hover:bg-white/5"
                      onClick={() => onUpdateCityClick({ cityId: c.id })}
                    >
                      {t("admin.settingsView.update")}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 px-4 rounded-xl border-gray-200 bg-white text-[#da565b] hover:bg-red-50 hover:text-[#da565b] dark:border-white/10 dark:bg-[#0b0f14] dark:hover:bg-white/5"
                          disabled={deletingCityId === c.id}
                        >
                          {deletingCityId === c.id ? (
                            <div className="flex items-center gap-2">
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Deleting...</span>
                            </div>
                          ) : (
                            t("admin.settingsView.delete")
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl border-gray-200 dark:border-white/10 dark:bg-[#0b0f14]">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-gray-900 dark:text-white">
                            {t("admin.settingsView.deleteTitle", { city: c.city })}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("admin.settingsView.deleteBody")}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl" disabled={deletingCityId === c.id}>
                            {t("admin.settingsView.cancel")}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="rounded-xl bg-[#da565b] text-white hover:bg-[#c84b50] min-w-[120px]"
                            disabled={deletingCityId === c.id}
                            onClick={() => handleDelete(c.id)}
                          >
                            {deletingCityId === c.id ? (
                              <div className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Deleting...</span>
                              </div>
                            ) : (
                              t("admin.settingsView.confirmDelete")
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>
          </div>
        </Surface>
      )}

      {isAdmin && (
        <AddShippingModal
          isOpen={isAddShippingModalOpen}
          onClose={() => setIsAddShippingModalOpen(false)}
          onShippingCreated={onShippingCreated}
        />
      )}
    </div>
  );
};


