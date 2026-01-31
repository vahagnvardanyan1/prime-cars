"use client";

import { useMemo, useState, useCallback } from "react";

import type { AdminCarDetails } from "@/lib/admin/types";
import { VehicleType, Auction } from "@/lib/admin/types";

type FormErrors = {
  model?: string;
  year?: string;
  priceUsd?: string;
  purchaseDate?: string;
  vin?: string;
  lot?: string;
  city?: string;
};

type UseAddCarFormReturn = {
  fields: {
    model: string;
    year: string;
    priceUsd: string;
    carPaid: boolean;
    shippingPaid: boolean;
    insurance: boolean;
    purchaseDate: string;
    type: string;
    auction: string;
    city: string;
    lot: string;
    vin: string;
    customerNotes: string;
    containerNumberBooking: string;
    promisedPickUpDate: string;
    deliveredWarehouse: string;
  };
  actions: {
    setModel: ({ value }: { value: string }) => void;
    setYear: ({ value }: { value: string }) => void;
    setPriceUsd: ({ value }: { value: string }) => void;
    setCarPaid: ({ value }: { value: boolean }) => void;
    setShippingPaid: ({ value }: { value: boolean }) => void;
    setInsurance: ({ value }: { value: boolean }) => void;
    setPurchaseDate: ({ value }: { value: string }) => void;
    setType: ({ value }: { value: string }) => void;
    setAuction: ({ value }: { value: string }) => void;
    setCity: ({ value }: { value: string }) => void;
    setLot: ({ value }: { value: string }) => void;
    setVin: ({ value }: { value: string }) => void;
    setCustomerNotes: ({ value }: { value: string }) => void;
    setContainerNumberBooking: ({ value }: { value: string }) => void;
    setPromisedPickUpDate: ({ value }: { value: string }) => void;
    setDeliveredWarehouse: ({ value }: { value: string }) => void;
    reset: () => void;
    clearError: ({ field }: { field: keyof FormErrors }) => void;
  };
  derived: {
    isSubmitEnabled: boolean;
    parsed: {
      year: number;
      priceUsd: number;
      details: AdminCarDetails;
    } | null;
  };
  errors: FormErrors;
  validate: () => boolean;
};

export const useAddCarForm = (): UseAddCarFormReturn => {
  const [model, setModel] = useState<string>("");
  const [year, setYear] = useState("");
  const [priceUsd, setPriceUsd] = useState("");
  const [carPaid, setCarPaid] = useState(false);
  const [shippingPaid, setShippingPaid] = useState(false);
  const [insurance, setInsurance] = useState(false);

  const [purchaseDate, setPurchaseDate] = useState("");
  const [type, setType] = useState<string>(VehicleType.AUTO);
  const [auction, setAuction] = useState<string>(Auction.COPART);
  const [city, setCity] = useState("");
  const [lot, setLot] = useState("");
  const [vin, setVin] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [containerNumberBooking, setContainerNumberBooking] = useState("");
  const [promisedPickUpDate, setPromisedPickUpDate] = useState("");
  const [deliveredWarehouse, setDeliveredWarehouse] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const isSubmitEnabled = useMemo(() => {
    const yearNumber = Number(year);
    const priceNumber = Number(priceUsd);

    return (
      purchaseDate.trim().length > 0 &&
      model.trim().length > 0 &&
      vin.trim().length > 0 &&
      Number.isFinite(yearNumber) &&
      yearNumber > 1900 &&
      Number.isFinite(priceNumber) &&
      priceNumber > 0
    );
  }, [model, priceUsd, purchaseDate, vin, year]);

  const parsed = useMemo(() => {
    if (!isSubmitEnabled) return null;

    const yearNumber = Number(year);
    const priceNumber = Number(priceUsd);

    const details: AdminCarDetails = {
      purchaseDate: purchaseDate.trim().length ? purchaseDate : undefined,
      type: type.trim().length ? type : undefined,
      auction: auction.trim().length ? auction : undefined,
      city: city.trim().length ? city : undefined,
      lot: lot.trim().length ? lot : undefined,
      vin: vin.trim().length ? vin : undefined,
      customerNotes: customerNotes.trim().length ? customerNotes : undefined,
      containerNumberBooking: containerNumberBooking.trim().length ? containerNumberBooking : undefined,
      promisedPickUpDate: promisedPickUpDate.trim().length ? promisedPickUpDate : undefined,
      deliveredWarehouse: deliveredWarehouse.trim().length ? deliveredWarehouse : undefined,
    };

    return {
      year: yearNumber,
      priceUsd: priceNumber,
      details,
    };
  }, [
    auction,
    city,
    containerNumberBooking,
    customerNotes,
    deliveredWarehouse,
    isSubmitEnabled,
    lot,
    promisedPickUpDate,
    purchaseDate,
    type,
    vin,
    year,
    priceUsd,
  ]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!model.trim()) {
      newErrors.model = "Model is required";
    }

    if (!year.trim()) {
      newErrors.year = "Year is required";
    } else {
      const yearNumber = Number(year);
      if (!Number.isFinite(yearNumber) || yearNumber < 1900 || yearNumber > new Date().getFullYear() + 1) {
        newErrors.year = "Please enter a valid year";
      }
    }

    if (!priceUsd.trim()) {
      newErrors.priceUsd = "Price is required";
    } else {
      const priceNumber = Number(priceUsd);
      if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
        newErrors.priceUsd = "Please enter a valid price";
      }
    }

    if (!purchaseDate.trim()) {
      newErrors.purchaseDate = "Purchase date is required";
    }

    if (!vin.trim()) {
      newErrors.vin = "VIN is required";
    } else if (vin.trim().length < 17) {
      newErrors.vin = "VIN must be at least 17 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = useCallback(({ field }: { field: keyof FormErrors }) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setModel("");
    setYear("");
    setPriceUsd("");
    setCarPaid(false);
    setShippingPaid(false);
    setInsurance(false);
    setPurchaseDate("");
    setType(VehicleType.AUTO);
    setAuction(Auction.COPART);
    setCity("");
    setLot("");
    setVin("");
    setCustomerNotes("");
    setContainerNumberBooking("");
    setPromisedPickUpDate("");
    setDeliveredWarehouse("");
    setErrors({});
  }, []);

  return {
    fields: {
      model,
      year,
      priceUsd,
      carPaid,
      shippingPaid,
      insurance,
      purchaseDate,
      type,
      auction,
      city,
      lot,
      vin,
      customerNotes,
      containerNumberBooking,
      promisedPickUpDate,
      deliveredWarehouse,
    },
    actions: {
      setModel: ({ value }) => setModel(value),
      setYear: ({ value }) => setYear(value),
      setPriceUsd: ({ value }) => setPriceUsd(value),
      setCarPaid: ({ value }) => setCarPaid(value),
      setShippingPaid: ({ value }) => setShippingPaid(value),
      setInsurance: ({ value }) => setInsurance(value),
      setPurchaseDate: ({ value }) => setPurchaseDate(value),
      setType: ({ value }) => setType(value),
      setAuction: ({ value }) => setAuction(value),
      setCity: ({ value }) => setCity(value),
      setLot: ({ value }) => setLot(value),
      setVin: ({ value }) => setVin(value),
      setCustomerNotes: ({ value }) => setCustomerNotes(value),
      setContainerNumberBooking: ({ value }) => setContainerNumberBooking(value),
      setPromisedPickUpDate: ({ value }) => setPromisedPickUpDate(value),
      setDeliveredWarehouse: ({ value }) => setDeliveredWarehouse(value),
      reset,
      clearError,
    },
    derived: { isSubmitEnabled, parsed },
    errors,
    validate,
  };
};


