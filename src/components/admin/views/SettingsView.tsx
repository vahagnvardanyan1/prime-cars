"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { Plus, Search, Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddShippingModal } from "@/components/admin/modals/AddShippingModal";
import { Surface } from "@/components/admin/primitives/Surface";
import { UserCoefficientRow } from "@/components/admin/primitives/UserCoefficientRow";
import { formatUsd } from "@/lib/admin/format";
import type { ShippingCity, AdminUser } from "@/lib/admin/types";
import { Auction } from "@/lib/admin/types";
import { API_BASE_URL } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/auth/token";
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
  onApplyGlobalAdjustment: ({ delta, auction }: { delta: number; auction: Auction }) => Promise<void>;
  onUpdateCityClick: ({ cityId }: { cityId: string }) => void;
  onDeleteCity: ({ cityId }: { cityId: string }) => Promise<void>;
  onUpdateCoefficient: ({ userId, coefficient, category }: { userId: string; coefficient: number; category?: Auction }) => Promise<void>;
  onShippingCreated?: () => void;
  onLoadCities?: ({ auction }: { auction: Auction }) => Promise<void>;
  onLoadGlobalAdjustment?: ({ auction }: { auction: Auction }) => Promise<void>;
  isLoading?: boolean;
  isLoadingUsers?: boolean;
  isAdmin?: boolean;
  globalAdjustment?: {
    adjustmentAmount?: number;
    basePrice?: number;
    category?: string;
    lastAdjustmentAmount?: number;
    lastAdjustmentDate?: string;
  };
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
  onLoadGlobalAdjustment,
  isLoading = false,
  isLoadingUsers = false,
  isAdmin = false,
  globalAdjustment,
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
  const [adjustmentAuction, setAdjustmentAuction] = useState<Auction>(Auction.COPART);
  const [showAdjustmentValue, setShowAdjustmentValue] = useState(true);
  
  // Initialize tab and search from URL
  const [activeTab, setActiveTab] = useState<"shipping" | "users">(() => {
    const tab = searchParams.get("tab");
    return tab === "users" ? "users" : "shipping";
  });
  
  const [citySearch, setCitySearch] = useState(() => {
    return searchParams.get("search") || "";
  });
  
  const [selectedAuction, setSelectedAuction] = useState<Auction>(() => {
    const auctionParam = searchParams.get("auction");
    if (auctionParam && Object.values(Auction).includes(auctionParam as Auction)) {
      return auctionParam as Auction;
    }
    return Auction.COPART;
  });

  // Sync state with URL on mount and when searchParams change
  useEffect(() => {
    const tab = searchParams.get("tab");
    const search = searchParams.get("search") || "";
    const auctionParam = searchParams.get("auction");
    
    if (tab === "users") {
      setActiveTab("users");
    } else {
      setActiveTab("shipping");
    }
    
    setCitySearch(search);
    
    if (auctionParam && Object.values(Auction).includes(auctionParam as Auction)) {
      setSelectedAuction(auctionParam as Auction);
    }
  }, [searchParams]);
  
  useEffect(() => {
    if (globalAdjustment?.adjustmentAmount !== undefined) {
      setDelta(String(globalAdjustment.adjustmentAmount));
    } else {
      setDelta("");
    }
  }, [globalAdjustment]);
  
  useEffect(() => {
    if (selectedAuction) {
      setAdjustmentAuction(selectedAuction);
    }
  }, [selectedAuction, setAdjustmentAuction]);

  useEffect(() => {
    const fetchPriceSummary = async () => {
      try {
        const response = await authenticatedFetch(
          `${API_BASE_URL}/shippings/price-summary?category=${adjustmentAuction}`
        );
        
        if (response.ok) {
          const result = await response.json();
          const adjustmentAmount = result.data?.base_adjustment_amount || result.data?.adjustment_amount || result.data?.user_adjustment_amount || 0;
          
          if (adjustmentAmount !== undefined) {
            setDelta(String(adjustmentAmount));
          } else {
            setDelta("");
          }
        } else {
          setDelta("");
        }
      } catch (error) {
        console.error('Error fetching price summary:', error);
        setDelta("");
      }
    };

    fetchPriceSummary();
  }, [adjustmentAuction]);

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

  const handleCitySearchChange = (value: string) => {
    setCitySearch(value);
    
    // Update URL with search parameter
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const canApply = useMemo(() => {
    return delta.trim().length > 0 && Number.isFinite(Number(delta));
  }, [delta]);

  // Filter cities by search query
  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return cities;
    
    const searchLower = citySearch.toLowerCase();
    return cities.filter((city) => {
      return city.city.toLowerCase().includes(searchLower);
    });
  }, [cities, citySearch]);

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
      await onApplyGlobalAdjustment({ delta: Number(delta), auction: adjustmentAuction });
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
    
    // Update URL with auction parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set("auction", auction);
    router.push(`?${params.toString()}`, { scroll: false });
    
    // Load both cities and global adjustment for the selected auction
    if (onLoadCities) {
      await onLoadCities({ auction });
    }
    if (onLoadGlobalAdjustment) {
      await onLoadGlobalAdjustment({ auction });
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

              <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
                {/* Auction Category Selector */}
                <Select
                  value={adjustmentAuction}
                  onValueChange={(value) => setAdjustmentAuction(value as Auction)}
                  disabled={isApplying}
                >
                  <SelectTrigger className="h-12 w-full sm:w-[180px] rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white dark:bg-[#1a1f2e] text-gray-900 dark:text-white font-medium shadow-sm hover:border-gray-300 dark:hover:border-white/20 focus-visible:ring-2 focus-visible:ring-[#429de6]/20 transition-all px-4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#1a1f2e] border-gray-200 dark:border-white/10 rounded-xl">
                    <SelectItem value={Auction.COPART} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 focus:bg-gray-100 dark:focus:bg-white/5">
                      COPART
                    </SelectItem>
                    <SelectItem value={Auction.IAAI} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 focus:bg-gray-100 dark:focus:bg-white/5">
                      IAAI
                    </SelectItem>
                    <SelectItem value={Auction.MANHEIM} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 focus:bg-gray-100 dark:focus:bg-white/5">
                      MANHEIM
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Amount Input */}
                <div className="relative w-full sm:w-[180px]">
                  <Input
                    type={showAdjustmentValue ? "text" : "password"}
                    value={delta}
                    onChange={handleDeltaChange}
                    inputMode="numeric"
                    placeholder={tSettings("adjustmentPlaceholder")}
                    disabled={isApplying}
                    className="h-12 w-full rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white dark:bg-[#1a1f2e] text-gray-900 dark:text-white font-medium shadow-sm hover:border-gray-300 dark:hover:border-white/20 focus-visible:ring-2 focus-visible:ring-[#429de6]/20 transition-all px-4 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdjustmentValue(!showAdjustmentValue)}
                    disabled={isApplying}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                  >
                    {showAdjustmentValue ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Apply Button */}
                <Button
                  type="button"
                  className="h-12 rounded-2xl bg-[#429de6] text-white hover:bg-[#3a8acc] disabled:opacity-50 min-w-[160px] sm:min-w-[180px] whitespace-nowrap font-semibold shadow-lg shadow-[#429de6]/20 hover:shadow-xl hover:shadow-[#429de6]/30 transition-all"
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
          <div className="px-4 sm:px-6 py-5 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {t("admin.settingsView.citiesTitle")}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {t("admin.settingsView.showingCities", { 
                  count: filteredCities.length, 
                  auction: selectedAuction.toUpperCase() 
                })}
              </p>
            </div>
            <Button
              type="button"
              onClick={() => setIsAddShippingModalOpen(true)}
              className="h-10 sm:h-11 px-4 rounded-xl bg-[#429de6] text-white hover:bg-[#3a8acc] flex items-center gap-2 text-sm font-semibold shadow-lg shadow-[#429de6]/20 transition-all hover:shadow-xl hover:shadow-[#429de6]/30 w-full sm:w-auto justify-center"
            >
              <Plus className="h-4 w-4" />
              <span>{t("admin.settingsView.addCity")}</span>
            </Button>
          </div>

          {/* Search and Filter Section */}
          <div className="px-4 sm:px-6 py-4 space-y-4 border-b border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                type="text"
                placeholder={tSettings("searchCityPlaceholder")}
                value={citySearch}
                onChange={(e) => handleCitySearchChange(e.target.value)}
                className="pl-10 h-11 bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10 focus-visible:ring-[#429de6] rounded-xl text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-sm"
              />
            </div>

            {/* Auction Filter Tabs - Horizontal Scroll on Mobile */}
            <div className="relative -mx-4 sm:mx-0">
              <div className="overflow-x-auto scrollbar-hide px-4 sm:px-0">
                <div className="flex gap-2 min-w-max sm:min-w-0">
                  <button
                    type="button"
                    onClick={() => handleAuctionChange(Auction.COPART)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                      selectedAuction === Auction.COPART
                        ? "bg-[#429de6] text-white shadow-lg shadow-[#429de6]/25"
                        : "bg-white dark:bg-[#0b0f14] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-[#429de6]/50 dark:hover:border-[#429de6]/30 hover:bg-gray-50 dark:hover:bg-white/5"
                    }`}
                  >
                    COPART
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAuctionChange(Auction.IAAI)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                      selectedAuction === Auction.IAAI
                        ? "bg-[#429de6] text-white shadow-lg shadow-[#429de6]/25"
                        : "bg-white dark:bg-[#0b0f14] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-[#429de6]/50 dark:hover:border-[#429de6]/30 hover:bg-gray-50 dark:hover:bg-white/5"
                    }`}
                  >
                    IAAI
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAuctionChange(Auction.MANHEIM)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                      selectedAuction === Auction.MANHEIM
                        ? "bg-[#429de6] text-white shadow-lg shadow-[#429de6]/25"
                        : "bg-white dark:bg-[#0b0f14] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-[#429de6]/50 dark:hover:border-[#429de6]/30 hover:bg-gray-50 dark:hover:bg-white/5"
                    }`}
                  >
                    MANHEIM
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50 dark:bg-white/[0.03] border-b border-gray-200 dark:border-white/10">
              <TableHead className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[150px] sm:min-w-[200px]">
                {t("admin.settingsView.columns.city")}
              </TableHead>
              <TableHead className="px-4 py-3 sm:py-4 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[140px] sm:min-w-[180px]">
                {t("admin.settingsView.columns.shipping")}
              </TableHead>
              <TableHead className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-right text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[160px] sm:min-w-[200px]">
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
                    {citySearch 
                      ? t("admin.settingsView.noCitiesMatchSearch", { search: citySearch })
                      : t("admin.settingsView.noCitiesFound", { auction: selectedAuction.toUpperCase() })
                    }
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCities.map((c) => (
                <TableRow key={c.id} className="border-b border-gray-200 dark:border-white/10 hover:bg-gray-50/80 dark:hover:bg-white/[0.03] transition-colors">
                <TableCell className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 min-w-[150px] sm:min-w-[200px]">
                  <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                    {c.city}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4 sm:py-5 min-w-[140px] sm:min-w-[180px]">
                  <div className="text-sm sm:text-base font-semibold text-[#429de6] dark:text-[#429de6]">
                    {formatUsd({ value: c.shippingUsd })}
                  </div>
                </TableCell>
                <TableCell className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-right min-w-[160px] sm:min-w-[200px]">
                  <div className="inline-flex items-center justify-end gap-2 sm:gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 sm:h-10 px-3 sm:px-4 rounded-lg sm:rounded-xl border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-[#0b0f14] dark:text-white dark:hover:bg-white/5 text-xs sm:text-sm font-medium transition-colors"
                      onClick={() => onUpdateCityClick({ cityId: c.id })}
                    >
                      {t("admin.settingsView.update")}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 sm:h-10 px-3 sm:px-4 rounded-lg sm:rounded-xl border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:border-red-500/20 dark:bg-[#0b0f14] dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300 text-xs sm:text-sm font-medium transition-colors"
                          disabled={deletingCityId === c.id}
                        >
                          {deletingCityId === c.id ? (
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <svg className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span className="hidden sm:inline">Deleting...</span>
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
                  {t("admin.settingsView.loadingUsers")}
                </span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-12 flex items-center justify-center text-center text-sm text-gray-600 dark:text-gray-400">
                {userSearch ? t("admin.settingsView.noUsersMatchSearch") : t("admin.settingsView.noUsersFound")}
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


