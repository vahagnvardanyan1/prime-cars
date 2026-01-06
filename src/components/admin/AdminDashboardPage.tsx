"use client";

import { useState, useEffect } from "react";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { AdminPreferencesMenu } from "@/components/admin/AdminPreferencesMenu";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminSidebarContent } from "@/components/admin/AdminSidebarContent";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { AddCarModal } from "@/components/admin/modals/AddCarModal";
import { UpdateCarModal } from "@/components/admin/modals/UpdateCarModal";
import { CreateUserModal } from "@/components/admin/modals/CreateUserModal";
import { UpdateUserModal } from "@/components/admin/modals/UpdateUserModal";
import { UpdateShippingPriceModal } from "@/components/admin/modals/UpdateShippingPriceModal";
import { CarsView } from "@/components/admin/views/CarsView";
import { SettingsView } from "@/components/admin/views/SettingsView";
import { UsersView } from "@/components/admin/views/UsersView";
import { ImportCalculator } from "@/components/ImportCalculator";
import type { AdminCar, AdminUser } from "@/lib/admin/types";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
import { useAdminDashboardState } from "@/hooks/admin/useAdminDashboardState";
import { useUser } from "@/contexts/UserContext";
import { LoginModal } from "../LoginModal";
import { deleteCar } from "@/lib/admin/deleteCar";
import { deleteUser } from "@/lib/admin/deleteUser";

export const AdminDashboardPage = () => {
  const t = useTranslations();
  const state = useAdminDashboardState();
  const { user, isAdmin, refreshUser, isLoading: isLoadingUser } = useUser();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedCarForUpdate, setSelectedCarForUpdate] = useState<AdminCar | null>(null);
  const [isUpdateCarModalOpen, setIsUpdateCarModalOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<AdminCar | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingCar, setIsDeletingCar] = useState(false);
  const [selectedUserForUpdate, setSelectedUserForUpdate] = useState<AdminUser | null>(null);
  const [isUpdateUserModalOpen, setIsUpdateUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Simple: Check on mount if user exists
  useEffect(() => {
    // If not loading and no user, show login
    if (!isLoadingUser && !user) {
      setShowLoginModal(true);
    }
  }, [isLoadingUser, user]);

  // Load cars data when user is available
  useEffect(() => {
    if (user) {
      state.loadCars();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Redirect non-admin users away from users view
  useEffect(() => {
    if (user && !isAdmin && state.activeNav === "users") {
      state.setActiveNav("cars");
    }
  }, [user, isAdmin, state.activeNav, state]);

  // Handle login success: fetch user data
  const handleLoginSuccess = async () => {
    console.log("✅ Login successful! Token saved. Now closing modal and fetching user...");
    
    // Close the login modal first
    setShowLoginModal(false);
    
    // Small delay to let modal close animation complete
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log("✅ Fetching user from API: /auth/me");
    
    // Fetch user data from API - skip refresh mechanism since we just logged in with fresh token
    // refreshUser(true) sets isLoadingUser = true, which triggers the loading screen
    await refreshUser(true);
    
    console.log("✅ User data fetched successfully!");
    
    // Load cars after user is fetched
    state.loadCars({ forceRefresh: true });
  };

  // Handle delete car click - open confirmation dialog
  const handleDeleteCarClick = (car: AdminCar) => {
    setCarToDelete(car);
    setIsDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!carToDelete) return;

    setIsDeletingCar(true);
    try {
      const result = await deleteCar({ id: carToDelete.id });
      
      if (result.success) {
        toast.success("Car deleted successfully");
        setIsDeleteDialogOpen(false);
        setCarToDelete(null);
        // Refresh the cars list
        state.loadCars({ forceRefresh: true });
      } else {
        toast.error(result.error || "Failed to delete car");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Error deleting car:", error);
    } finally {
      setIsDeletingCar(false);
    }
  };

  // Handle delete user click - open confirmation dialog
  const handleDeleteUserClick = (user: AdminUser) => {
    setUserToDelete(user);
    setIsDeleteUserDialogOpen(true);
  };

  // Handle delete user confirmation
  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeletingUser(true);
    try {
      const result = await deleteUser({ id: userToDelete.id });
      
      if (result.success) {
        toast.success("User deleted successfully");
        setIsDeleteUserDialogOpen(false);
        setUserToDelete(null);
        // Refresh the users list
        state.loadUsers({ forceRefresh: true });
      } else {
        toast.error(result.error || "Failed to delete user");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Error deleting user:", error);
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Show loading screen while user is being fetched
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] dark:bg-[#070a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#429de6] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            {t("admin.loadingUser")}
          </p>
        </div>
      </div>
    );
  }

 

  return (
    <div className="min-h-screen bg-[#f7f9fc] dark:bg-[#070a0f]">
      <AdminSidebar
        activeNav={state.activeNav}
        onNavChange={({ next }) => state.setActiveNav(next)}
        onAddCar={state.openAddCar}
        onCreateUser={state.openCreateUser}
        isAdmin={isAdmin}
      />

      <div className="pl-0 md:pl-[280px]">
        <AdminTopbar
          left={
            <div className="flex items-center gap-4">
              <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-11 rounded-xl border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-[#0b0f14] dark:text-white dark:hover:bg-white/5 md:hidden"
                    aria-label={t("admin.topbar.openNavAria")}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[320px] border-gray-200 bg-white p-0 dark:border-white/10 dark:bg-[#0b0f14]"
                >
                  <div className="h-full">
                    <AdminSidebarContent
                      activeNav={state.activeNav}
                      onNavChange={({ next }) => state.setActiveNav(next)}
                      onAddCar={state.openAddCar}
                      onCreateUser={state.openCreateUser}
                      onRequestClose={() => setIsMobileNavOpen(false)}
                      isAdmin={isAdmin}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <div className="hidden sm:block text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
                {user?.companyName || "Prime Cars"}
              </div>
            </div>
          }
          right={<AdminPreferencesMenu />}
        />

        <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-full">
          {state.activeNav === "cars" ? (
            <CarsView 
              cars={state.cars} 
              isLoading={state.isLoadingCars}
              onRefresh={() => state.loadCars({ forceRefresh: true })}
              onUpdateCar={(car) => {
                setSelectedCarForUpdate(car);
                setIsUpdateCarModalOpen(true);
              }}
              onDeleteCar={handleDeleteCarClick}
              isAdmin={isAdmin}
            />
          ) : null}
          {state.activeNav === "users" && isAdmin ? (
            <UsersView 
              users={state.users} 
              isLoading={state.isLoadingUsers}
              onRefresh={() => state.loadUsers({ forceRefresh: true })}
              onUpdateUser={(user) => {
                setSelectedUserForUpdate(user);
                setIsUpdateUserModalOpen(true);
              }}
              onDeleteUser={handleDeleteUserClick}
              isAdmin={isAdmin}
            />
          ) : null}
          {state.activeNav === "calculator" ? (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  {t("admin.headers.calculatorTitle")}
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t("admin.headers.calculatorSubtitle")}
                </p>
              </div>
              <ImportCalculator showNotice={false} />
            </div>
          ) : null}
          {state.activeNav === "settings" ? (
            <SettingsView
              cities={state.cities}
              isLoading={state.isLoadingCities}
              onApplyGlobalAdjustment={state.applyGlobalAdjustment}
              onUpdateCityClick={state.openUpdateCityPrice}
              onDeleteCity={state.deleteCity}
              onShippingCreated={() => state.loadCities({ forceRefresh: true })}
            />
          ) : null}
        </div>
      </div>

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

          <CreateUserModal
            open={state.isCreateUserOpen}
            onOpenChange={({ open }) =>
              open ? state.openCreateUser() : state.closeCreateUser()
            }
            onUserCreated={() => state.loadUsers({ forceRefresh: true })}
          />

          <UpdateUserModal
            open={isUpdateUserModalOpen}
            user={selectedUserForUpdate}
            onOpenChange={({ open }) => setIsUpdateUserModalOpen(open)}
            onUserUpdated={() => state.loadUsers({ forceRefresh: true })}
          />
        </>
      )}

      <UpdateShippingPriceModal
        open={state.updateCityPriceModal.isOpen}
        city={state.selectedCity}
        onOpenChange={({ open }) => (open ? null : state.closeUpdateCityPrice())}
        onConfirm={state.updateCityPrice}
        onSuccess={() => state.loadCities({ forceRefresh: true })}
      />

      {/* Login Modal - shown when user is not authenticated */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Delete Car Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">
              Delete Car
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete {carToDelete?.model} ({carToDelete?.year})?
              This action cannot be undone.
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

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete {userToDelete?.firstName} {userToDelete?.lastName}?
              This action cannot be undone and will remove all user data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isDeletingUser}
              className="border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-[#161b22] dark:text-white dark:hover:bg-white/5"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteUser}
              disabled={isDeletingUser}
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              {isDeletingUser ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};


