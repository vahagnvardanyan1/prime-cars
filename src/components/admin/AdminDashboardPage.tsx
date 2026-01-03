"use client";

import { useMemo, useState } from "react";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminSidebarContent } from "@/components/admin/AdminSidebarContent";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { SectionHeader } from "@/components/admin/primitives/SectionHeader";
import { CarsView } from "@/components/admin/views/CarsView";
import { SettingsView } from "@/components/admin/views/SettingsView";
import { UsersView } from "@/components/admin/views/UsersView";
import { AddCarModal } from "@/components/admin/modals/AddCarModal";
import { CreateUserModal } from "@/components/admin/modals/CreateUserModal";
import { UpdateShippingPriceModal } from "@/components/admin/modals/UpdateShippingPriceModal";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAdminDashboardState } from "@/hooks/admin/useAdminDashboardState";

import { Menu } from "lucide-react";

const getHeaderCopy = ({ activeNav }: { activeNav: "cars" | "users" | "settings" }) => {
  switch (activeNav) {
    case "cars":
      return {
        title: "Cars",
        subtitle: "Manage inventory listings with calm, table-first clarity.",
      };
    case "users":
      return {
        title: "Users",
        subtitle: "Internal access control and role visibility (frontend-only).",
      };
    case "settings":
      return {
        title: "Settings",
        subtitle: "Shipping price management with safe, powerful controls.",
      };
    default:
      return { title: "Admin", subtitle: "" };
  }
};

export const AdminDashboardPage = () => {
  const state = useAdminDashboardState();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const header = useMemo(() => {
    return getHeaderCopy({ activeNav: state.activeNav });
  }, [state.activeNav]);

  return (
    <div className="min-h-screen bg-[#f7f9fc] dark:bg-[#070a0f]">
      <AdminSidebar
        activeNav={state.activeNav}
        onNavChange={({ next }) => state.setActiveNav(next)}
        onAddCar={state.openAddCar}
        onCreateUser={state.openCreateUser}
      />

      <div className="pl-0 md:pl-[280px]">
        <AdminTopbar
          left={
            <div className="flex items-center gap-3">
              <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-xl border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-[#0b0f14] dark:text-white dark:hover:bg-white/5 md:hidden"
                    aria-label="Open navigation"
                  >
                    <Menu className="h-4 w-4" />
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
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <div className="hidden sm:block text-[11px] font-medium uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
                Prime Cars / Admin
              </div>
            </div>
          }
          right={
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 dark:border-white/10 dark:bg-[#0b0f14] dark:text-gray-300">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#429de6]/10 text-xs font-semibold text-[#429de6]">
                  PC
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-medium text-gray-900 dark:text-white">
                    Admin
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    staff@primecars.internal
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-[#0b0f14] dark:text-white dark:hover:bg-white/5"
                onClick={() => state.setActiveNav("settings")}
              >
                Quick Settings
              </Button>
            </div>
          }
        />

        <div className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <SectionHeader title={header.title} subtitle={header.subtitle} />

          <div className="mt-6">
            {state.activeNav === "cars" ? <CarsView cars={state.cars} /> : null}
            {state.activeNav === "users" ? <UsersView users={state.users} /> : null}
            {state.activeNav === "settings" ? (
              <SettingsView
                cities={state.cities}
                onApplyGlobalAdjustment={state.applyGlobalAdjustment}
                onUpdateCityClick={state.openUpdateCityPrice}
                onDeleteCity={state.deleteCity}
              />
            ) : null}
          </div>
        </div>
      </div>

      <AddCarModal
        open={state.isAddCarOpen}
        onOpenChange={({ open }) => (open ? state.openAddCar() : state.closeAddCar())}
      />

      <CreateUserModal
        open={state.isCreateUserOpen}
        onOpenChange={({ open }) =>
          open ? state.openCreateUser() : state.closeCreateUser()
        }
      />

      <UpdateShippingPriceModal
        open={state.updateCityPriceModal.isOpen}
        city={state.selectedCity}
        onOpenChange={({ open }) => (open ? null : state.closeUpdateCityPrice())}
        onConfirm={state.updateCityPrice}
      />
    </div>
  );
};


