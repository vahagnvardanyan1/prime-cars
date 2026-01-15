"use client";

import { useState, useEffect } from "react";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { AvailableCarsView } from "@/components/admin/views/AvailableCarsView";
import { UpdateAvailableCarModal } from "@/components/admin/modals/UpdateAvailableCarModal";
import { CreateAvailableCarModal } from "@/components/admin/modals/CreateAvailableCarModal";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUser } from "@/contexts/UserContext";
import type { Car, CarCategory } from "@/lib/cars/types";
import { 
  useAvailableCars, 
  useDeleteAvailableCar 
} from "@/hooks/admin/useAvailableCars";

export const AdminAvailableCarsPage = () => {
  const t = useTranslations("carsPage");
  const tAdmin = useTranslations("admin.modals");
  const tAvailableCars = useTranslations("admin.availableCars");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAdmin } = useUser();
  
  // Initialize activeTab from URL or default to AVAILABLE
  const getInitialTab = (): CarCategory => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl === "AVAILABLE" || tabFromUrl === "ONROAD" || tabFromUrl === "TRANSIT") {
      return tabFromUrl as CarCategory;
    }
    return "AVAILABLE";
  };
  
  const getInitialSearch = (): string => {
    return searchParams.get("search") || "";
  };

  const getInitialPageSize = (): number => {
    const saved = searchParams.get("pageSize");
    return saved ? parseInt(saved, 10) : 25;
  };

  const getInitialPageForTab = (tab: string): number => {
    const saved = searchParams.get(`${tab.toLowerCase()}Page`);
    return saved ? parseInt(saved, 10) : 1;
  };
  
  const [activeTab, setActiveTab] = useState<CarCategory>(getInitialTab());
  const [searchQuery, setSearchQuery] = useState(getInitialSearch());
  const [selectedCarForUpdate, setSelectedCarForUpdate] = useState<Car | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<Car | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Pagination state for each tab - initialize from URL
  const [availablePage, setAvailablePage] = useState(() => getInitialPageForTab("AVAILABLE"));
  const [onroadPage, setOnroadPage] = useState(() => getInitialPageForTab("ONROAD"));
  const [transitPage, setTransitPage] = useState(() => getInitialPageForTab("TRANSIT"));
  const [pageSize, setPageSize] = useState(getInitialPageSize);

  // React Query hook with pagination for each category
  const { 
    data: availableData,
    isLoading: isLoadingAvailable, 
    refetch: refetchAvailable 
  } = useAvailableCars({
    page: availablePage,
    limit: pageSize,
    search: searchQuery,
    carCategory: "AVAILABLE",
  });
  
  const { 
    data: onroadData,
    isLoading: isLoadingOnroad, 
    refetch: refetchOnroad 
  } = useAvailableCars({
    page: onroadPage,
    limit: pageSize,
    search: searchQuery,
    carCategory: "ONROAD",
  });
  
  const { 
    data: transitData,
    isLoading: isLoadingTransit, 
    refetch: refetchTransit 
  } = useAvailableCars({
    page: transitPage,
    limit: pageSize,
    search: searchQuery,
    carCategory: "TRANSIT",
  });

  // Delete mutation
  const deleteMutation = useDeleteAvailableCar();

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin) {
      router.push("/admin");
    }
  }, [isAdmin, router]);

  // Sync state with URL changes
  useEffect(() => {
    const tabFromUrl = getInitialTab();
    setActiveTab(tabFromUrl);
    
    const searchFromUrl = getInitialSearch();
    setSearchQuery(searchFromUrl);

    // Sync pagination from URL
    const urlAvailablePage = searchParams.get("availablePage");
    const urlOnroadPage = searchParams.get("onroadPage");
    const urlTransitPage = searchParams.get("transitPage");
    const urlPageSize = searchParams.get("pageSize");

    if (urlAvailablePage) {
      const parsed = parseInt(urlAvailablePage, 10);
      if (parsed !== availablePage) setAvailablePage(parsed);
    }
    if (urlOnroadPage) {
      const parsed = parseInt(urlOnroadPage, 10);
      if (parsed !== onroadPage) setOnroadPage(parsed);
    }
    if (urlTransitPage) {
      const parsed = parseInt(urlTransitPage, 10);
      if (parsed !== transitPage) setTransitPage(parsed);
    }
    if (urlPageSize) {
      const parsed = parseInt(urlPageSize, 10);
      if (parsed !== pageSize) setPageSize(parsed);
    }
  }, [searchParams]);

  const handleUpdateCar = (car: Car) => {
    setSelectedCarForUpdate(car);
    setIsUpdateModalOpen(true);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    // Reset all pages to 1 when search changes
    setAvailablePage(1);
    setOnroadPage(1);
    setTransitPage(1);
    
    // Update URL with search parameter and reset pages
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.set("availablePage", "1");
    params.set("onroadPage", "1");
    params.set("transitPage", "1");
    
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    
    // Reset all pages to 1 when clearing search
    setAvailablePage(1);
    setOnroadPage(1);
    setTransitPage(1);
    
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.set("availablePage", "1");
    params.set("onroadPage", "1");
    params.set("transitPage", "1");
    
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleDeleteCar = (car: Car) => {
    setCarToDelete(car);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!carToDelete) return;

    try {
      await deleteMutation.mutateAsync({ id: carToDelete.id });
      toast.success(tAdmin("deleteAvailableCar.success"));
      setIsDeleteDialogOpen(false);
      setCarToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete car");
    }
  };

  const handleUpdateSuccess = () => {
    setIsUpdateModalOpen(false);
    setSelectedCarForUpdate(null);
    toast.success(tAvailableCars("carUpdated"));
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
  };

  const handleTabChange = (category: CarCategory) => {
    setActiveTab(category);
    
    // Update URL with the selected tab
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", category);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Pagination handlers with URL updates
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    
    switch (activeTab) {
      case "AVAILABLE":
        setAvailablePage(page);
        params.set("availablePage", page.toString());
        break;
      case "ONROAD":
        setOnroadPage(page);
        params.set("onroadPage", page.toString());
        break;
      case "TRANSIT":
        setTransitPage(page);
        params.set("transitPage", page.toString());
        break;
    }
    
    // Update URL
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    
    // Reset all pages to 1 when page size changes
    setAvailablePage(1);
    setOnroadPage(1);
    setTransitPage(1);
    
    // Update URL with new page size and reset all page numbers
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageSize", size.toString());
    params.set("availablePage", "1");
    params.set("onroadPage", "1");
    params.set("transitPage", "1");
    
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleRefresh = () => {
    switch (activeTab) {
      case "AVAILABLE":
        refetchAvailable();
        break;
      case "ONROAD":
        refetchOnroad();
        break;
      case "TRANSIT":
        refetchTransit();
        break;
    }
  };

  // Check if user is searching
  const isSearching = searchQuery.trim().length > 0;

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case "AVAILABLE":
        return availableData || { cars: [], total: 0, totalPages: 0, currentPage: 1, pageSize: 25 };
      case "ONROAD":
        return onroadData || { cars: [], total: 0, totalPages: 0, currentPage: 1, pageSize: 25 };
      case "TRANSIT":
        return transitData || { cars: [], total: 0, totalPages: 0, currentPage: 1, pageSize: 25 };
      default:
        return { cars: [], total: 0, totalPages: 0, currentPage: 1, pageSize: 25 };
    }
  };

  const currentData = getCurrentData();

  // Don't render anything if not admin
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="px-6 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {tAvailableCars("title")}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {tAvailableCars("subtitle")}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="h-11 rounded-xl bg-[#429de6] text-white hover:bg-[#3a8acc] flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{tAvailableCars("createCar")}</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CarCategory)} className="w-full">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={tAvailableCars("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#429de6] focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs - Only show when not searching */}
        {!isSearching && (
          <div className="flex items-center gap-2 mb-6 overflow-x-auto">
            <button
              onClick={() => handleTabChange("AVAILABLE")}
              className={`relative px-4 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap rounded-lg ${
                activeTab === "AVAILABLE"
                  ? "text-white bg-emerald-500"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{t("tabs.current")}</span>
                {!isLoadingAvailable && availableData && availableData.total > 0 && (
                  <span className={`px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                    activeTab === "AVAILABLE" 
                      ? "bg-white/20 text-white" 
                      : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                  }`}>
                    {availableData.total}
                  </span>
                )}
              </span>
            </button>

            <button
              onClick={() => handleTabChange("ONROAD")}
              className={`relative px-4 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap rounded-lg ${
                activeTab === "ONROAD"
                  ? "text-white bg-amber-500"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{t("tabs.arriving")}</span>
                {!isLoadingOnroad && onroadData && onroadData.total > 0 && (
                  <span className={`px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                    activeTab === "ONROAD" 
                      ? "bg-white/20 text-white" 
                      : "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
                  }`}>
                    {onroadData.total}
                  </span>
                )}
              </span>
            </button>

            <button
              onClick={() => handleTabChange("TRANSIT")}
              className={`relative px-4 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap rounded-lg ${
                activeTab === "TRANSIT"
                  ? "text-white bg-[#429de6]"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{t("tabs.order")}</span>
                {!isLoadingTransit && transitData && transitData.total > 0 && (
                  <span className={`px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                    activeTab === "TRANSIT" 
                      ? "bg-white/20 text-white" 
                      : "bg-blue-100 dark:bg-[#429de6]/20 text-blue-700 dark:text-[#429de6]"
                  }`}>
                    {transitData.total}
                  </span>
                )}
              </span>
            </button>
          </div>
        )}

        {/* Content - Show paginated results (search is now server-side) */}
        {searchQuery.trim().length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentData.total > 0 
                ? tAvailableCars("searchResults", { count: currentData.total, query: searchQuery })
                : tAvailableCars("noResults", { query: searchQuery })
              }
            </p>
          </div>
        )}
        
        {currentData.total === 0 && searchQuery.trim().length > 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No results found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              No cars match your search &quot;{searchQuery}&quot;. Try different keywords.
            </p>
          </div>
        ) : (
          /* Tab Content */
          <>
            <TabsContent value="AVAILABLE" className="mt-0">
              <AvailableCarsView 
                cars={availableData?.cars || []} 
                isLoading={isLoadingAvailable} 
                onRefresh={handleRefresh}
                onUpdateCar={handleUpdateCar}
                onDeleteCar={handleDeleteCar}
                isAdmin={isAdmin}
                currentPage={availableData?.currentPage || 1}
                totalPages={availableData?.totalPages || 0}
                pageSize={availableData?.pageSize || pageSize}
                totalItems={availableData?.total || 0}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </TabsContent>

            <TabsContent value="ONROAD" className="mt-0">
              <AvailableCarsView 
                cars={onroadData?.cars || []} 
                isLoading={isLoadingOnroad} 
                onRefresh={handleRefresh}
                onUpdateCar={handleUpdateCar}
                onDeleteCar={handleDeleteCar}
                isAdmin={isAdmin}
                currentPage={onroadData?.currentPage || 1}
                totalPages={onroadData?.totalPages || 0}
                pageSize={onroadData?.pageSize || pageSize}
                totalItems={onroadData?.total || 0}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </TabsContent>

            <TabsContent value="TRANSIT" className="mt-0">
              <AvailableCarsView 
                cars={transitData?.cars || []} 
                isLoading={isLoadingTransit} 
                onRefresh={handleRefresh}
                onUpdateCar={handleUpdateCar}
                onDeleteCar={handleDeleteCar}
                isAdmin={isAdmin}
                currentPage={transitData?.currentPage || 1}
                totalPages={transitData?.totalPages || 0}
                pageSize={transitData?.pageSize || pageSize}
                totalItems={transitData?.total || 0}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Create Car Modal */}
      <CreateAvailableCarModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Update Car Modal */}
      {selectedCarForUpdate && (
        <UpdateAvailableCarModal
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedCarForUpdate(null);
          }}
          car={selectedCarForUpdate}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">
              {tAdmin("deleteAvailableCar.title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              {tAdmin("deleteAvailableCar.description", { 
                brand: carToDelete?.brand || "", 
                model: carToDelete?.model || "", 
                year: carToDelete?.year || "" 
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={deleteMutation.isPending}
              className="border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-[#161b22] dark:text-white dark:hover:bg-white/5"
            >
              {tAdmin("deleteAvailableCar.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              {deleteMutation.isPending ? tAdmin("deleteAvailableCar.deleting") : tAdmin("deleteAvailableCar.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
