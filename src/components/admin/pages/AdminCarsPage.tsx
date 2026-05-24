"use client";

import { useState, useEffect, useCallback } from "react";

import { toast } from "sonner";

import type { AdminCar } from "@/lib/admin/types";

import { ConfirmDialog } from "@/components/admin/primitives/ConfirmDialog";

import { useTranslations } from "next-intl";

import { useUser } from "@/contexts/UserContext";

import { useAdminCarsState } from "@/hooks/admin/useAdminCarsState";
import { useConfirmDialog } from "@/hooks/admin/useConfirmDialog";
import { deleteCar } from "@/lib/admin/deleteCar";
import { AddCarModal } from "@/components/admin/modals/AddCarModal";
import { UpdateCarModal } from "@/components/admin/modals/UpdateCarModal";
import { ViewCarModal } from "@/components/admin/modals/ViewCarModal";
import { CarsView } from "@/components/admin/views/CarsView";

export const AdminCarsPage = () => {
  const t = useTranslations();
  const state = useAdminCarsState();
  const { user, isAdmin } = useUser();
  const [selectedCarForUpdate, setSelectedCarForUpdate] = useState<AdminCar | null>(null);
  const [isUpdateCarModalOpen, setIsUpdateCarModalOpen] = useState(false);
  const [selectedCarForView, setSelectedCarForView] = useState<AdminCar | null>(null);
  const [isViewCarModalOpen, setIsViewCarModalOpen] = useState(false);
  const deleteConfirm = useConfirmDialog<AdminCar>();
  const [isDeletingCar, setIsDeletingCar] = useState(false);

  // Load cars data when user is available
  useEffect(() => {
    if (user) {
      state.loadCars();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleConfirmDelete = useCallback(async () => {
    const carToDelete = deleteConfirm.target;
    if (!carToDelete) return;

    setIsDeletingCar(true);
    try {
      const result = await deleteCar({ id: carToDelete.id });

      if (result.success) {
        toast.success(t("admin.toasts.carDeletedTitle"), {
          description: t("admin.toasts.carDeletedDescription", { model: carToDelete.model }),
        });
        await state.loadCars({ forceRefresh: true });
        deleteConfirm.close();
      } else {
        toast.error(t("admin.toasts.carDeleteFailedTitle"), {
          description: result.error || t("admin.toasts.couldNotDeleteCar"),
        });
      }
    } catch (error) {
      toast.error(t("admin.toasts.carDeleteFailedTitle"), {
        description: error instanceof Error ? error.message : t("common.unexpectedError"),
      });
    } finally {
      setIsDeletingCar(false);
    }
  }, [deleteConfirm, state, t]);

  // Stable callback references to avoid re-renders
  const handleRefresh = useCallback(() => state.loadCars({ forceRefresh: true }), [state]);

  const handleUpdateCar = useCallback((car: AdminCar) => {
    setSelectedCarForUpdate(car);
    setIsUpdateCarModalOpen(true);
  }, []);

  const handleViewCar = useCallback((car: AdminCar) => {
    setSelectedCarForView(car);
    setIsViewCarModalOpen(true);
  }, []);

  const handleViewCarModalChange = useCallback(({ open }: { open: boolean }) => {
    setIsViewCarModalOpen(open);
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
        onDeleteCar={deleteConfirm.open}
        onViewCar={handleViewCar}
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

      <ViewCarModal
        open={isViewCarModalOpen}
        car={selectedCarForView}
        onOpenChange={handleViewCarModalChange}
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

          <ConfirmDialog
            open={deleteConfirm.isOpen}
            onOpenChange={(next) => !next && deleteConfirm.close()}
            title={t("admin.carsView.deleteCar.title")}
            description={t("admin.carsView.deleteCar.description", {
              model: deleteConfirm.target?.model || "",
              year: deleteConfirm.target?.year || "",
            })}
            confirmLabel={t("admin.carsView.deleteCar.delete")}
            loadingLabel={t("admin.carsView.deleteCar.deleting")}
            cancelLabel={t("admin.carsView.deleteCar.cancel")}
            variant="destructive"
            isLoading={isDeletingCar}
            onConfirm={handleConfirmDelete}
          />
        </>
      )}
    </>
  );
};

