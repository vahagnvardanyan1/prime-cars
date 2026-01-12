"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { Plus, Search } from "lucide-react";
import { useTranslations } from "next-intl";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddShippingModal } from "@/components/admin/modals/AddShippingModal";
import { Surface } from "@/components/admin/primitives/Surface";
import { UserCoefficientRow } from "@/components/admin/primitives/UserCoefficientRow";
import { formatUsd } from "@/lib/admin/format";
import type { ShippingCity, AdminUser } from "@/lib/admin/types";
import { Auction } from "@/lib/admin/types";
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
  users: AdminUser[];
  onApplyGlobalAdjustment: ({ delta }: { delta: number }) => Promise<void>;
  onUpdateCityClick: ({ cityId }: { cityId: string }) => void;
  onDeleteCity: ({ cityId }: { cityId: string }) => Promise<void>;
  onUpdateCoefficient: ({ userId, coefficient, category }: { userId: string; coefficient: number; category?: Auction }) => Promise<void>;
  onShippingCreated?: () => void;
  onLoadCities?: ({ auction }: { auction: Auction }) => Promise<void>;
  isLoading?: boolean;
  isLoadingUsers?: boolean;
  isAdmin?: boolean;
};

export const SettingsView = ({
  cities,
  users,
  onApplyGlobalAdjustment,
  onUpdateCityClick,
  onDeleteCity,
  onUpdateCoefficient,
  onShippingCreated,
  onLoadCities,
  isLoading = false,
  isLoadingUsers = false,
  isAdmin = false,
}: SettingsViewProps) => {
  const t = useTranslations();
  const tSettings = useTranslations("admin.settings");
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [delta, setDelta] = useState("");
  const [isAddShippingModalOpen, setIsAddShippingModalOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [deletingCityId, setDeletingCityId] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [selectedAuction, setSelectedAuction] = useState<Auction>(Auction.COPART);
  
  // Initialize tab from URL or default to shipping
  const [activeTab, setActiveTab] = useState<"shipping" | "users">(() => {
    const tab = searchParams.get("tab");
    return tab === "users" ? "users" : "shipping";
  });

  // Sync activeTab with URL on mount and when searchParams change
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "users") {
      setActiveTab("users");
    } else {
      setActiveTab("shipping");
    }
  }, [searchParams]);

  const handleTabChange = (tab: "shipping" | "users") => {
    setActiveTab(tab);
    // Update URL without page reload
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "users") {
      params.set("tab", "users");
    } else {
      params.delete("tab"); // Default is shipping, so remove param
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const canApply = useMemo(() => {
    return delta.trim().length > 0 && Number.isFinite(Number(delta));
  }, [delta]);

  // No need for client-side filtering since backend filters by auction
  const filteredCities = cities;

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    
    const searchLower = userSearch.toLowerCase();
    return users.filter((user) => {
      return (
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.username.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.phone?.toLowerCase().includes(searchLower) ||
        user.passport?.toLowerCase().includes(searchLower) ||
        user.companyName?.toLowerCase().includes(searchLower)
      );
    });
  }, [users, userSearch]);

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

  const handleAuctionChange = async (auction: Auction) => {
    setSelectedAuction(auction);
    if (onLoadCities) {
      await onLoadCities({ auction });
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation - Only for admins */}
      {isAdmin && (
        <div className="flex gap-2 border-b border-gray-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => handleTabChange("shipping")}
            className={`px-6 py-3 text-sm font-semibold transition-all ${
              activeTab === "shipping"
                ? "border-b-2 border-[#429de6] text-[#429de6] dark:text-[#429de6]"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {t("admin.settingsView.shippingTab")}
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("users")}
            className={`px-6 py-3 text-sm font-semibold transition-all ${
              activeTab === "users"
                ? "border-b-2 border-[#429de6] text-[#429de6] dark:text-[#429de6]"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {t("admin.settingsView.usersTab")}
          </button>
        </div>
      )}

      {/* Shipping Prices Tab - Show for all users, or when shipping tab is active for admins */}
      {(!isAdmin || activeTab === "shipping") && (
        <>
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
                  placeholder={tSettings("adjustmentPlaceholder")}
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
                      <span>{tSettings("applying")}</span>
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
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {t("admin.settingsView.showingCities", { 
                  count: filteredCities.length, 
                  auction: selectedAuction.toUpperCase() 
                })}
              </p>
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

          {/* Auction Filter Buttons */}
          <div className="px-6 pb-4 border-b border-gray-200 dark:border-white/10">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleAuctionChange(Auction.COPART)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedAuction === Auction.COPART
                    ? "bg-[#429de6] text-white"
                    : "bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
                }`}
              >
                COPART
              </button>
              <button
                type="button"
                onClick={() => handleAuctionChange(Auction.IAAI)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedAuction === Auction.IAAI
                    ? "bg-[#429de6] text-white"
                    : "bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
                }`}
              >
                IAAI
              </button>
              <button
                type="button"
                onClick={() => handleAuctionChange(Auction.MANHEIM)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedAuction === Auction.MANHEIM
                    ? "bg-[#429de6] text-white"
                    : "bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
                }`}
              >
                MANHEIM
              </button>
              <button
                type="button"
                onClick={() => handleAuctionChange(Auction.OTHER)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedAuction === Auction.OTHER
                    ? "bg-[#429de6] text-white"
                    : "bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
                }`}
              >
                OTHER
              </button>
            </div>
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
                      {t("admin.settingsView.loadingCities")}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredCities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-12">
                  <div className="flex items-center justify-center text-center text-sm text-gray-600 dark:text-gray-400">
                    {t("admin.settingsView.noCitiesFound", { auction: selectedAuction.toUpperCase() })}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCities.map((c) => (
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
                          className="h-10 px-4 rounded-xl border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-white/10 dark:bg-[#0b0f14] dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
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
        </>
      )}

      {/* User Coefficients Tab - Only for admins */}
      {isAdmin && activeTab === "users" && (
        <Surface>
          <div className="px-6 py-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("admin.settingsView.userCoefficientsTitle")}
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t("admin.settingsView.userCoefficientsDescription")}
            </p>
          </div>

          {/* Search Input */}
          <div className="px-6 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={tSettings("searchUserPlaceholder")}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-10 h-10 bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10 focus-visible:ring-[#429de6]"
              />
            </div>
          </div>

          <div className="px-6 pb-6">
            {isLoadingUsers ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <svg className="animate-spin h-8 w-8 text-[#429de6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Loading users...
                </span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-12 flex items-center justify-center text-center text-sm text-gray-600 dark:text-gray-400">
                {userSearch ? "No users match your search" : "No users found"}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b0f14] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <UserCoefficientRow
                      user={user}
                      onUpdateCoefficient={onUpdateCoefficient}
                    />
                  </div>
                ))}
              </div>
            )}
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


