"use client";

import { useMemo, useState } from "react";

import { ADMIN_CARS, ADMIN_USERS, SHIPPING_CITIES } from "@/lib/admin/mockData";
import type { AdminCar, AdminUser, ShippingCity } from "@/lib/admin/types";

export type AdminNavKey = "cars" | "users" | "settings";

type UpdateCityPriceModalState =
  | { isOpen: false }
  | { isOpen: true; cityId: string };

export const useAdminDashboardState = () => {
  const [activeNav, setActiveNav] = useState<AdminNavKey>("cars");

  const [isAddCarOpen, setIsAddCarOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [updateCityPriceModal, setUpdateCityPriceModal] =
    useState<UpdateCityPriceModalState>({ isOpen: false });

  const [cars] = useState<AdminCar[]>(ADMIN_CARS);
  const [users] = useState<AdminUser[]>(ADMIN_USERS);
  const [cities, setCities] = useState<ShippingCity[]>(SHIPPING_CITIES);

  const openAddCar = () => setIsAddCarOpen(true);
  const closeAddCar = () => setIsAddCarOpen(false);

  const openCreateUser = () => setIsCreateUserOpen(true);
  const closeCreateUser = () => setIsCreateUserOpen(false);

  const openUpdateCityPrice = ({ cityId }: { cityId: string }) => {
    setUpdateCityPriceModal({ isOpen: true, cityId });
  };

  const closeUpdateCityPrice = () => {
    setUpdateCityPriceModal({ isOpen: false });
  };

  const updateCityPrice = ({
    cityId,
    nextShippingUsd,
  }: {
    cityId: string;
    nextShippingUsd: number;
  }) => {
    setCities((prev) =>
      prev.map((c) =>
        c.id === cityId ? { ...c, shippingUsd: nextShippingUsd } : c,
      ),
    );
  };

  const deleteCity = ({ cityId }: { cityId: string }) => {
    setCities((prev) => prev.filter((c) => c.id !== cityId));
  };

  const applyGlobalAdjustment = ({ delta }: { delta: number }) => {
    setCities((prev) =>
      prev.map((c) => ({ ...c, shippingUsd: Math.max(0, c.shippingUsd + delta) })),
    );
  };

  const selectedCity = useMemo(() => {
    if (!updateCityPriceModal.isOpen) return null;
    return cities.find((c) => c.id === updateCityPriceModal.cityId) ?? null;
  }, [cities, updateCityPriceModal]);

  return {
    activeNav,
    setActiveNav,

    cars,
    users,
    cities,

    isAddCarOpen,
    openAddCar,
    closeAddCar,

    isCreateUserOpen,
    openCreateUser,
    closeCreateUser,

    updateCityPriceModal,
    openUpdateCityPrice,
    closeUpdateCityPrice,
    selectedCity,

    updateCityPrice,
    deleteCity,
    applyGlobalAdjustment,
  };
};


