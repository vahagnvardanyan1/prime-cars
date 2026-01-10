"use client";

import { useEffect } from "react";

import { UpdateShippingPriceModal } from "@/components/admin/modals/UpdateShippingPriceModal";
import { SettingsView } from "@/components/admin/views/SettingsView";
import { useAdminSettingsState } from "@/hooks/admin/useAdminSettingsState";
import { useUser } from "@/contexts/UserContext";
import { Auction } from "@/lib/admin/types";

export const AdminSettingsPage = () => {
  const state = useAdminSettingsState();
  const { user, isAdmin } = useUser();

  useEffect(() => {
    if (user) {
      state.loadCities({ auction: Auction.COPART }); 
      state.loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <>
      <SettingsView
        cities={state.cities}
        users={state.users}
        isLoading={state.isLoadingCities}
        isLoadingUsers={state.isLoadingUsers}
        isAdmin={isAdmin}
        onApplyGlobalAdjustment={state.applyGlobalAdjustment}
        onUpdateCityClick={state.openUpdateCityPrice}
        onDeleteCity={state.deleteCity}
        onUpdateCoefficient={state.updateCoefficient}
        onShippingCreated={() => state.loadCities({ forceRefresh: true, auction: Auction.COPART })}
        onLoadCities={({ auction }) => state.loadCities({ auction })}
      />

      <UpdateShippingPriceModal
        open={state.updateCityPriceModal.isOpen}
        city={state.selectedCity}
        currentAuction={state.currentAuction || Auction.COPART}
        onOpenChange={({ open }) =>
          open ? null : state.closeUpdateCityPrice()
        }
        onConfirm={state.updateCityPrice}
        onSuccess={() => state.loadCities({ forceRefresh: true, auction: state.currentAuction || Auction.COPART })}
      />
    </>
  );
};

