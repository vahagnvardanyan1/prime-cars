"use client";

import { useState, useEffect, useCallback } from "react";

import { toast } from "sonner";

import type { AdminCar } from "@/lib/admin/types";

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

import { useTranslations } from "next-intl";

import { useUser } from "@/contexts/UserContext";

import { useAdminCarsState } from "@/hooks/admin/useAdminCarsState";
import { deleteCar } from "@/lib/admin/deleteCar";
import { AddCarModal } from "@/components/admin/modals/AddCarModal";
import { UpdateCarModal } from "@/components/admin/modals/UpdateCarModal";
import { CarsView } from "@/components/admin/views/CarsView";

export const AdminCarsPage = () => {
  const t = useTranslations();
  const state = useAdminCarsState();
  const { user, isAdmin } = useUser();
  const [selectedCarForUpdate, setSelectedCarForUpdate] = useState<AdminCar | null>(null);
  const [isUpdateCarModalOpen, setIsUpdateCarModalOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<AdminCar | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingCar, setIsDeletingCar] = useState(false);

  // Load cars data when user is available
  useEffect(() => {
    if (user) {
      state.loadCars();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleDeleteCarClick = useCallback((car: AdminCar) => {
    setCarToDelete(car);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!carToDelete) return;

    setIsDeletingCar(true);
    try {
      const result = await deleteCar({ id: carToDelete.id });

      if (result.success) {
        toast.success("Car deleted", {
          description: `${carToDelete.model} has been removed.`,
        });
        await state.loadCars({ forceRefresh: true });
        setIsDeleteDialogOpen(false);
        setCarToDelete(null);
      } else {
        toast.error("Failed to delete car", {
          description: result.error || "Could not delete the car.",
        });
      }
    } catch (error) {
      toast.error("Failed to delete car", {
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    } finally {
      setIsDeletingCar(false);
    }
  }, [carToDelete, state]);

  // Stable callback references to avoid re-renders
  const handleRefresh = useCallback(() => state.loadCars({ forceRefresh: true }), [state]);

  const handleUpdateCar = useCallback((car: AdminCar) => {
    setSelectedCarForUpdate(car);
    setIsUpdateCarModalOpen(true);
  }, []);

  const handleAddCarModalChange = useCallback(({ open }: { open: boolean }) => {
    if (open) {
      state.openAddCar();
    } else {
      state.closeAddCar();
    }
  }, [state]);

  const handleUpdateCarModalChange = useCallback(({ open }: { open: boolean }) => {
    setIsUpdateCarModalOpen(open);
  }, []);

  const handleCarCreated = useCallback(() => state.loadCars({ forceRefresh: true }), [state]);

  return (
    <>
      <CarsView
        cars={state.cars}
        isLoading={state.isLoadingCars}
        onRefresh={handleRefresh}
        onAddCar={state.openAddCar}
        onUpdateCar={handleUpdateCar}
        onDeleteCar={handleDeleteCarClick}
        isAdmin={isAdmin}
        filters={state.filters}
        onFiltersChange={state.updateFilters}
        onClearFilters={state.clearFilters}
        currentPage={state.currentPage}
        totalPages={state.totalPages}
        pageSize={state.pageSize}
        totalItems={state.totalItems}
        onPageChange={state.changePage}
        onPageSizeChange={state.changePageSize}
      />

      {isAdmin && (
        <>
          <AddCarModal
            open={state.isAddCarOpen}
            onOpenChange={handleAddCarModalChange}
            onCreateCar={state.addCar}
            onCarCreated={handleCarCreated}
          />

          <UpdateCarModal
            open={isUpdateCarModalOpen}
            car={selectedCarForUpdate}
            onOpenChange={handleUpdateCarModalChange}
            onCarUpdated={handleCarCreated}
          />

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent className="bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-gray-900 dark:text-white">
                  {t("admin.carsView.deleteCar.title")}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                  {t("admin.carsView.deleteCar.description", { 
                    model: carToDelete?.model || "", 
                    year: carToDelete?.year || "" 
                  })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel 
                  disabled={isDeletingCar}
                  className="border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-[#161b22] dark:text-white dark:hover:bg-white/5"
                >
                  {t("admin.carsView.deleteCar.cancel")}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmDelete}
                  disabled={isDeletingCar}
                  className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                >
                  {isDeletingCar ? t("admin.carsView.deleteCar.deleting") : t("admin.carsView.deleteCar.delete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </>
  );
};

