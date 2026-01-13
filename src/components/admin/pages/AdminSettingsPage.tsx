"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { UpdateShippingPriceModal } from "@/components/admin/modals/UpdateShippingPriceModal";
import { SettingsView } from "@/components/admin/views/SettingsView";
import { useAdminSettingsState } from "@/hooks/admin/useAdminSettingsState";
import { useUser } from "@/contexts/UserContext";
import { Auction } from "@/lib/admin/types";

export const AdminSettingsPage = () => {
  const { user, isAdmin } = useUser();
  const state = useAdminSettingsState({ isAdmin });
  const searchParams = useSearchParams();

  useEffect(() => {
    if (user) {
      // Read auction from URL, default to COPART
      const auctionParam = searchParams.get("auction");
      const initialAuction = (auctionParam && Object.values(Auction).includes(auctionParam as Auction))
        ? auctionParam as Auction
        : Auction.COPART;
      
      state.loadCities({ auction: initialAuction }); 
      state.loadUsers();
      state.loadGlobalAdjustment(initialAuction);
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
        onShippingCreated={() => state.loadCities({ forceRefresh: true, auction: state.currentAuction || Auction.COPART })}
        onLoadCities={({ auction }) => state.loadCities({ auction })}
        onLoadGlobalAdjustment={({ auction }) => state.loadGlobalAdjustment(auction)}
        globalAdjustment={state.globalAdjustment}
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

