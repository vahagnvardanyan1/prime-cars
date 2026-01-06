"use client";

import { useEffect } from "react";

import { UpdateShippingPriceModal } from "@/components/admin/modals/UpdateShippingPriceModal";
import { SettingsView } from "@/components/admin/views/SettingsView";
import { useAdminSettingsState } from "@/hooks/admin/useAdminSettingsState";
import { useUser } from "@/contexts/UserContext";

export const AdminSettingsPage = () => {
  const state = useAdminSettingsState();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      state.loadCities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <>
      <SettingsView
        cities={state.cities}
        isLoading={state.isLoadingCities}
        onApplyGlobalAdjustment={state.applyGlobalAdjustment}
        onUpdateCityClick={state.openUpdateCityPrice}
        onDeleteCity={state.deleteCity}
        onShippingCreated={() => state.loadCities({ forceRefresh: true })}
      />

      <UpdateShippingPriceModal
        open={state.updateCityPriceModal.isOpen}
        city={state.selectedCity}
        onOpenChange={({ open }) =>
          open ? null : state.closeUpdateCityPrice()
        }
        onCityUpdated={() => state.loadCities({ forceRefresh: true })}
      />
    </>
  );
};

