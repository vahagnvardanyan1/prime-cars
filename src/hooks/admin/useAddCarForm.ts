"use client";

import { useMemo, useState } from "react";

import type { AdminCarDetails, AdminCarStatus } from "@/lib/admin/types";

type UseAddCarFormReturn = {
  fields: {
    model: string;
    year: string;
    priceUsd: string;
    status: Exclude<AdminCarStatus, "Sold">;
    purchaseDate: string;
    type: string;
    auction: string;
    city: string;
    lot: string;
    paymentToAuctionUsd: string;
    vin: string;
    customerNotes: string;
  };
  actions: {
    setModel: ({ value }: { value: string }) => void;
    setYear: ({ value }: { value: string }) => void;
    setPriceUsd: ({ value }: { value: string }) => void;
    setStatus: ({ value }: { value: Exclude<AdminCarStatus, "Sold"> }) => void;
    setPurchaseDate: ({ value }: { value: string }) => void;
    setType: ({ value }: { value: string }) => void;
    setAuction: ({ value }: { value: string }) => void;
    setCity: ({ value }: { value: string }) => void;
    setLot: ({ value }: { value: string }) => void;
    setPaymentToAuctionUsd: ({ value }: { value: string }) => void;
    setVin: ({ value }: { value: string }) => void;
    setCustomerNotes: ({ value }: { value: string }) => void;
    reset: () => void;
  };
  derived: {
    isSubmitEnabled: boolean;
    parsed: {
      year: number;
      priceUsd: number;
      details: AdminCarDetails;
    } | null;
  };
};

export const useAddCarForm = (): UseAddCarFormReturn => {
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [priceUsd, setPriceUsd] = useState("");
  const [status, setStatus] = useState<Exclude<AdminCarStatus, "Sold">>(
    "Pending Review",
  );

  const [purchaseDate, setPurchaseDate] = useState("");
  const [type, setType] = useState("Auto");
  const [auction, setAuction] = useState("");
  const [city, setCity] = useState("");
  const [lot, setLot] = useState("");
  const [paymentToAuctionUsd, setPaymentToAuctionUsd] = useState("");
  const [vin, setVin] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  const isSubmitEnabled = useMemo(() => {
    const yearNumber = Number(year);
    const priceNumber = Number(priceUsd);
    const paymentNumber = Number(paymentToAuctionUsd);

    return (
      purchaseDate.trim().length > 0 &&
      model.trim().length > 0 &&
      vin.trim().length > 0 &&
      Number.isFinite(yearNumber) &&
      yearNumber > 1900 &&
      Number.isFinite(priceNumber) &&
      priceNumber > 0 &&
      Number.isFinite(paymentNumber) &&
      paymentNumber > 0
    );
  }, [model, paymentToAuctionUsd, priceUsd, purchaseDate, vin, year]);

  const parsed = useMemo(() => {
    if (!isSubmitEnabled) return null;

    const yearNumber = Number(year);
    const priceNumber = Number(priceUsd);
    const paymentNumber = Number(paymentToAuctionUsd);

    const details: AdminCarDetails = {
      purchaseDate: purchaseDate.trim().length ? purchaseDate : undefined,
      type: type.trim().length ? type : undefined,
      auction: auction.trim().length ? auction : undefined,
      city: city.trim().length ? city : undefined,
      lot: lot.trim().length ? lot : undefined,
      paymentToAuctionUsd: paymentNumber,
      vin: vin.trim().length ? vin : undefined,
      customerNotes: customerNotes.trim().length ? customerNotes : undefined,
    };

    return {
      year: yearNumber,
      priceUsd: priceNumber,
      details,
    };
  }, [
    auction,
    city,
    customerNotes,
    isSubmitEnabled,
    lot,
    paymentToAuctionUsd,
    purchaseDate,
    type,
    vin,
    year,
    priceUsd,
  ]);

  const reset = () => {
    setModel("");
    setYear("");
    setPriceUsd("");
    setStatus("Pending Review");
    setPurchaseDate("");
    setType("Auto");
    setAuction("");
    setCity("");
    setLot("");
    setPaymentToAuctionUsd("");
    setVin("");
    setCustomerNotes("");
  };

  return {
    fields: {
      model,
      year,
      priceUsd,
      status,
      purchaseDate,
      type,
      auction,
      city,
      lot,
      paymentToAuctionUsd,
      vin,
      customerNotes,
    },
    actions: {
      setModel: ({ value }) => setModel(value),
      setYear: ({ value }) => setYear(value),
      setPriceUsd: ({ value }) => setPriceUsd(value),
      setStatus: ({ value }) => setStatus(value),
      setPurchaseDate: ({ value }) => setPurchaseDate(value),
      setType: ({ value }) => setType(value),
      setAuction: ({ value }) => setAuction(value),
      setCity: ({ value }) => setCity(value),
      setLot: ({ value }) => setLot(value),
      setPaymentToAuctionUsd: ({ value }) => setPaymentToAuctionUsd(value),
      setVin: ({ value }) => setVin(value),
      setCustomerNotes: ({ value }) => setCustomerNotes(value),
      reset,
    },
    derived: { isSubmitEnabled, parsed },
  };
};


