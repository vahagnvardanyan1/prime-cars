"use client";

import { useState, useEffect } from "react";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";

import { AdminPreferencesMenu } from "@/components/admin/AdminPreferencesMenu";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminSidebarContent } from "@/components/admin/AdminSidebarContent";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { AddCarModal } from "@/components/admin/modals/AddCarModal";
import { CreateUserModal } from "@/components/admin/modals/CreateUserModal";
import { UpdateShippingPriceModal } from "@/components/admin/modals/UpdateShippingPriceModal";
import { CarsView } from "@/components/admin/views/CarsView";
import { SettingsView } from "@/components/admin/views/SettingsView";
import { UsersView } from "@/components/admin/views/UsersView";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAdminDashboardState } from "@/hooks/admin/useAdminDashboardState";
import { LoginModal } from "@/components/LoginModal";
import { getAccessToken } from "@/lib/auth/token";
import { useUser } from "@/contexts/UserContext";

export const AdminDashboardPage = () => {
  const t = useTranslations();
  const state = useAdminDashboardState();
  const { user, isAdmin, refreshUser, isLoading: isLoadingUser } = useUser();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsLoginModalOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load cars only after user data is loaded
  useEffect(() => {
    if (isAuthenticated && user && !isLoadingUser) {
      // Load cars data since cars is the default view
      state.loadCars();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, isLoadingUser]);

  const handleLoginSuccess = async () => {
    setIsAuthenticated(true);
    
    // Refresh user data from API before closing modal
    await refreshUser();
    
    setIsLoginModalOpen(false);
    
    // Load cars data after successful login since cars is the default view
    state.loadCars({ forceRefresh: true });
  };

  // Redirect non-admin users away from users view
  useEffect(() => {
    if (isAuthenticated && !isAdmin && state.activeNav === "users") {
      state.setActiveNav("cars");
    }
  }, [isAuthenticated, isAdmin, state.activeNav, state]);

  // Show loading screen while fetching user data after authentication
  if (isAuthenticated && (isLoadingUser || !user)) {
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
                {t("admin.breadcrumb")}
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
            />
          ) : null}
          {state.activeNav === "users" && isAdmin ? (
            <UsersView 
              users={state.users} 
              isLoading={state.isLoadingUsers}
              onRefresh={() => state.loadUsers({ forceRefresh: true })}
            />
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

          <CreateUserModal
            open={state.isCreateUserOpen}
            onOpenChange={({ open }) =>
              open ? state.openCreateUser() : state.closeCreateUser()
            }
            onUserCreated={() => state.loadUsers({ forceRefresh: true })}
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

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          if (isAuthenticated) {
            setIsLoginModalOpen(false);
          }
        }}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};


