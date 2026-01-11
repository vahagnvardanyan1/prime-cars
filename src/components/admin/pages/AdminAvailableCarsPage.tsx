"use client";

import { useState, useEffect } from "react";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Plus } from "lucide-react";
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
import { useCarsPage } from "@/hooks/useCarsPage";
import { useUser } from "@/contexts/UserContext";
import { deleteAvailableCar } from "@/lib/admin/deleteAvailableCar";
import type { Car, CarCategory } from "@/lib/cars/types";

export const AdminAvailableCarsPage = () => {
  const t = useTranslations("carsPage");
  const tAdmin = useTranslations("admin.modals");
  const tAvailableCars = useTranslations("admin.availableCars");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAdmin } = useUser();
  const { currentCars, arrivingCars, orderCars, isLoading, loadCarsForCategory } = useCarsPage();
  
  // Initialize activeTab from URL or default to AVAILABLE
  const getInitialTab = (): CarCategory => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl === "AVAILABLE" || tabFromUrl === "ONROAD" || tabFromUrl === "TRANSIT") {
      return tabFromUrl as CarCategory;
    }
    return "AVAILABLE";
  };
  
  const [activeTab, setActiveTab] = useState<CarCategory>(getInitialTab());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCarForUpdate, setSelectedCarForUpdate] = useState<Car | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<Car | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin) {
      router.push("/admin");
    }
  }, [isAdmin, router]);

  // Load cars for the active tab from URL on mount
  useEffect(() => {
    const tabFromUrl = getInitialTab();
    setActiveTab(tabFromUrl);
    loadCarsForCategory(tabFromUrl);
  }, [searchParams]);

  const handleUpdateCar = (car: Car) => {
    setSelectedCarForUpdate(car);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteCar = (car: Car) => {
    setCarToDelete(car);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!carToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteAvailableCar({ id: carToDelete.id });

      if (result.success) {
        toast.success(tAdmin("deleteAvailableCar.success"));
        setIsDeleteDialogOpen(false);
        setCarToDelete(null);
        // Reload the current category with force refresh
        loadCarsForCategory(activeTab, true);
      } else {
        toast.error(result.error || tAdmin("deleteAvailableCar.error"));
      }
    } catch (error) {
      toast.error("An error occurred while deleting the car");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateSuccess = () => {
    setIsUpdateModalOpen(false);
    setSelectedCarForUpdate(null);
    // Reload the current category with force refresh to get updated data
    loadCarsForCategory(activeTab, true);
    toast.success(tAvailableCars("carUpdated"));
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    // Reload the current category with force refresh to get new data
    loadCarsForCategory(activeTab, true);
  };

  const handleTabChange = (category: CarCategory) => {
    setActiveTab(category);
    loadCarsForCategory(category);
    
    // Update URL with the selected tab
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", category);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Get all cars from all categories for search
  const allCars = [...(currentCars || []), ...(arrivingCars || []), ...(orderCars || [])];

  // Filter all cars based on search query
  const getSearchResults = () => {
    if (!searchQuery.trim()) return null;
    
    const query = searchQuery.toLowerCase();
    return allCars.filter((car) => (
      car.brand.toLowerCase().includes(query) ||
      car.model.toLowerCase().includes(query) ||
      car.year.toString().includes(query) ||
      car.location?.toLowerCase().includes(query) ||
      car.engine?.toLowerCase().includes(query) ||
      car.fuelType?.toLowerCase().includes(query)
    ));
  };

  const searchResults = getSearchResults();
  const isSearching = searchQuery.trim().length > 0;

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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#429de6] focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-400"
            />
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
                {!isLoading("AVAILABLE") && currentCars.length > 0 && (
                  <span className={`px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                    activeTab === "AVAILABLE" 
                      ? "bg-white/20 text-white" 
                      : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                  }`}>
                    {currentCars.length}
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
                {!isLoading("ONROAD") && arrivingCars.length > 0 && (
                  <span className={`px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                    activeTab === "ONROAD" 
                      ? "bg-white/20 text-white" 
                      : "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
                  }`}>
                    {arrivingCars.length}
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
                {!isLoading("TRANSIT") && orderCars.length > 0 && (
                  <span className={`px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                    activeTab === "TRANSIT" 
                      ? "bg-white/20 text-white" 
                      : "bg-blue-100 dark:bg-[#429de6]/20 text-blue-700 dark:text-[#429de6]"
                  }`}>
                    {orderCars.length}
                  </span>
                )}
              </span>
            </button>
          </div>
        )}

        {/* Search Results - Show when searching */}
        {isSearching ? (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {searchResults && searchResults.length > 0 
                  ? tAvailableCars("searchResults", { count: searchResults.length, query: searchQuery })
                  : tAvailableCars("noResults", { query: searchQuery })
                }
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="text-sm text-[#429de6] hover:text-[#3a8acc] font-medium"
              >
                {tAvailableCars("clearSearch")}
              </button>
            </div>
            {searchResults && searchResults.length > 0 ? (
              <AvailableCarsView
                cars={searchResults}
                isLoading={false}
                onUpdateCar={handleUpdateCar}
                onDeleteCar={handleDeleteCar}
                isAdmin={isAdmin}
              />
            ) : (
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
            )}
          </div>
        ) : (
          /* Tab Content - Only show when not searching */
          <>
            <TabsContent value="AVAILABLE" className="mt-0">
              <AvailableCarsView 
                cars={currentCars} 
                isLoading={isLoading("AVAILABLE")} 
                onUpdateCar={handleUpdateCar}
                onDeleteCar={handleDeleteCar}
                isAdmin={isAdmin}
              />
            </TabsContent>

            <TabsContent value="ONROAD" className="mt-0">
              <AvailableCarsView 
                cars={arrivingCars} 
                isLoading={isLoading("ONROAD")} 
                onUpdateCar={handleUpdateCar}
                onDeleteCar={handleDeleteCar}
                isAdmin={isAdmin}
              />
            </TabsContent>

            <TabsContent value="TRANSIT" className="mt-0">
              <AvailableCarsView 
                cars={orderCars} 
                isLoading={isLoading("TRANSIT")} 
                onUpdateCar={handleUpdateCar}
                onDeleteCar={handleDeleteCar}
                isAdmin={isAdmin}
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
              disabled={isDeleting}
              className="border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-[#161b22] dark:text-white dark:hover:bg-white/5"
            >
              {tAdmin("deleteAvailableCar.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              {isDeleting ? tAdmin("deleteAvailableCar.deleting") : tAdmin("deleteAvailableCar.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
