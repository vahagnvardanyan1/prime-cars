"use client";

import { useState, useEffect } from "react";

import { toast } from "sonner";

import { AddCarModal } from "@/components/admin/modals/AddCarModal";
import { UpdateCarModal } from "@/components/admin/modals/UpdateCarModal";
import { CarsView } from "@/components/admin/views/CarsView";
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
import { useAdminCarsState } from "@/hooks/admin/useAdminCarsState";
import { useUser } from "@/contexts/UserContext";
import { deleteCar } from "@/lib/admin/deleteCar";

export const AdminCarsPage = () => {
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

  const handleDeleteCarClick = (car: AdminCar) => {
    setCarToDelete(car);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
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
  };

  return (
    <>
      <CarsView
        cars={state.cars}
        isLoading={state.isLoadingCars}
        onRefresh={() => state.loadCars({ forceRefresh: true })}
        onAddCar={state.openAddCar}
        onUpdateCar={(car) => {
          setSelectedCarForUpdate(car);
          setIsUpdateCarModalOpen(true);
        }}
        onDeleteCar={handleDeleteCarClick}
        isAdmin={isAdmin}
        filters={state.filters}
        onFiltersChange={state.updateFilters}
        onClearFilters={state.clearFilters}
      />

      {isAdmin && (
        <>
          <AddCarModal
            open={state.isAddCarOpen}
            onOpenChange={({ open }) => (open ? state.openAddCar() : state.closeAddCar())}
            onCreateCar={state.addCar}
            onCarCreated={() => state.loadCars({ forceRefresh: true })}
          />

          <UpdateCarModal
            open={isUpdateCarModalOpen}
            car={selectedCarForUpdate}
            onOpenChange={({ open }) => setIsUpdateCarModalOpen(open)}
            onCarUpdated={() => state.loadCars({ forceRefresh: true })}
          />

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent className="bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-gray-900 dark:text-white">Delete Car</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">
                    {carToDelete?.model} ({carToDelete?.year})
                  </span>
                  ? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel 
                  disabled={isDeletingCar}
                  className="border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-[#161b22] dark:text-white dark:hover:bg-white/5"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmDelete}
                  disabled={isDeletingCar}
                  className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                >
                  {isDeletingCar ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </>
  );
};

