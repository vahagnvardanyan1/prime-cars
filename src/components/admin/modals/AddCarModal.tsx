"use client";

import { useState, useEffect } from "react";

import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle } from "lucide-react";

// Helper to sanitize numeric input (removes leading zeros, non-numeric chars)
const sanitizeNumericInput = (value: string): string => {
  // Remove non-numeric characters except for empty string
  const numericOnly = value.replace(/[^0-9]/g, "");
  // Remove leading zeros (but keep "0" if that's all there is)
  if (numericOnly === "") return "";
  return String(parseInt(numericOnly, 10));
};

import type { AdminCar } from "@/lib/admin/types";
import { VehicleType, Auction } from "@/lib/admin/types";
import { createAdminCar } from "@/lib/admin/createAdminCar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhotoUploadGrid } from "@/components/admin/modals/PhotoUploadGrid";
import { PdfUploader } from "@/components/admin/primitives/PdfUploader";
import { useAddCarForm } from "@/hooks/admin/useAddCarForm";
import { usePhotoUploads } from "@/hooks/admin/usePhotoUploads";
import { fetchUsers } from "@/lib/admin/fetchUsers";
import { createCar } from "@/lib/admin/createCar";
import { useShippingPrices } from "@/lib/react-query/hooks/useShipping";
import { toast } from "sonner";

type AddCarModalProps = {
  open: boolean;
  onOpenChange: ({ open }: { open: boolean }) => void;
  onCreateCar: ({ car }: { car: AdminCar }) => void;
  onCarCreated?: () => void;
};

type User = {
  id: string;
  customerId?: string;
  firstName: string;
  lastName: string;
  email: string;
};

export const AddCarModal = ({ open, onOpenChange, onCreateCar, onCarCreated }: AddCarModalProps) => {
  const t = useTranslations();
  const { files, previews, setFileAt, removeFileAt, clearAll, addMultipleFiles, reorderFiles } = usePhotoUploads({ initialSlots: 1 });
  const form = useAddCarForm();
  const [vehiclePdfFile, setVehiclePdfFile] = useState<File | null>(null);
  const [insurancePdfFile, setInsurancePdfFile] = useState<File | null>(null);
  const [shippingPdfFile, setShippingPdfFile] = useState<File | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch cities using React Query (cached automatically)
  const { data: cities = [], isLoading: loadingCities } = useShippingPrices(
    form.fields.auction as Auction | undefined
  );

  // Fetch users from backend
  useEffect(() => {
    if (open) {
      const loadUsers = async () => {
        // Check if user is authenticated
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        if (!token) {
          return; // Don't fetch or show error if not authenticated
        }

        setLoadingUsers(true);
        try {
          const result = await fetchUsers();
          
          if (result.success && result.users) {
            const formattedUsers = result.users.map((user) => ({
              id: user.customerId || user.id,
              customerId: user.customerId,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
            }));
            setUsers(formattedUsers);
          } else {
            // Only show error if authenticated (not 401/403 errors)
            if (!result.error?.includes('401') && !result.error?.includes('403') && !result.error?.includes('Unauthorized')) {
              toast.error("Failed to load users", {
                description: result.error || "Could not fetch users from server.",
              });
            }
          }
        } catch (error) {
          // Only show error if it's not an auth error
          const errorMessage = error instanceof Error ? error.message : "";
          if (!errorMessage.includes('401') && !errorMessage.includes('403') && !errorMessage.includes('Unauthorized')) {
            toast.error("Failed to load users", {
              description: errorMessage || "An unexpected error occurred.",
            });
          }
        } finally {
          setLoadingUsers(false);
        }
      };

      loadUsers();
    }
  }, [open]);

  const close = () => {
    onOpenChange({ open: false });
  };

  const onSubmit = async () => {
    if (!form.validate()) {
      return;
    }

    const parsed = form.derived.parsed;
    if (!parsed) return;

    setIsSubmitting(true);

    try {
      // Get image files from the upload hook
      const imageFiles = files.filter((file): file is File => file !== null);

      const result = await createCar({
        data: {
          userId: selectedUserId,
          model: form.fields.model, // VehicleModel enum value
          year: parsed.year,
                  priceUsd: parsed.priceUsd,
                  carPaid: form.fields.carPaid,
                  shippingPaid: form.fields.shippingPaid,
                  insurance: form.fields.insurance,
                  type: form.fields.type, // VehicleType enum value
          auction: form.fields.auction, // Auction enum value
          purchaseDate: parsed.details.purchaseDate,
          city: parsed.details.city,
          lot: parsed.details.lot,
          vin: parsed.details.vin,
          customerNotes: parsed.details.customerNotes,
          containerNumberBooking: parsed.details.containerNumberBooking,
          promisedPickUpDate: parsed.details.promisedPickUpDate,
          deliveredWarehouse: parsed.details.deliveredWarehouse,
        },
        images: imageFiles,
        vehiclePdfFile: vehiclePdfFile,
        insurancePdfFile: insurancePdfFile,
        shippingPdfFile: shippingPdfFile,
      });

      if (result.success) {
        toast.success("Car created successfully", {
          description: `${form.fields.model} has been added to the inventory.`,
        });

        // Create local car object for immediate UI update
        const mainImage = previews.find(p => p !== null) ?? null;
        const car = createAdminCar({
          imageUrl: mainImage,
          model: form.fields.model,
          year: parsed.year,
          priceUsd: parsed.priceUsd,
          carPaid: form.fields.carPaid,
          shippingPaid: form.fields.shippingPaid,
          insurance: form.fields.insurance,
          details: parsed.details,
        });

        onCreateCar({ car });
        
        if (onCarCreated) {
          onCarCreated();
        }
        
        close();
        clearAll();
        setVehiclePdfFile(null);
        setInsurancePdfFile(null);
        setShippingPdfFile(null);
        setSelectedUserId("");
        form.actions.reset();
      } else {
        toast.error("Failed to create car", {
          description: result.error || "An unexpected error occurred.",
        });
      }
    } catch (error) {
      toast.error("Failed to create car", {
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => onOpenChange({ open: nextOpen })}>
      <DialogContent className="w-[calc(100vw-24px)] max-w-[980px] overflow-hidden rounded-3xl border-gray-200 bg-white p-0 dark:border-white/10 dark:bg-[#0a0a0a] lg:max-w-[1100px]">
        <div className="flex max-h-[85vh] flex-col">
          <div className="px-8 py-6 border-b border-gray-200 dark:border-white/10">
            <DialogHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t("admin.modals.addCar.title")}
                  </DialogTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {t("admin.modals.addCar.subtitle")}
                  </p>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="px-8 py-6 max-h-[calc(85vh-180px)] space-y-6 overflow-y-auto">
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
                {t("admin.modals.addCar.photosLabel")}
              </Label>
              <PhotoUploadGrid
                label=""
                previews={previews}
                onPickFile={setFileAt}
                onRemoveFile={removeFileAt}
                onPickMultipleFiles={addMultipleFiles}
                onReorder={reorderFiles}
                tileClassName="h-[160px]"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("admin.modals.addCar.user")}
                </Label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={loadingUsers}
                  className="h-11 w-full rounded-xl border border-gray-300 dark:border-white/20 bg-white pl-4 pr-10 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#429de6] dark:bg-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iI0Q1RDdEQSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==')] bg-[length:16px_16px] bg-[center_right_0.75rem] bg-no-repeat [&>option]:py-1 [&>option]:px-2"
                >
                  <option value="">
                    {loadingUsers ? t("admin.modals.addCar.loadingUsers") : t("admin.modals.addCar.selectUser")}
                  </option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("admin.modals.addCar.purchaseDate")}
                </Label>
                <Input
                  value={form.fields.purchaseDate}
                  onChange={(e) => {
                    form.actions.setPurchaseDate({ value: e.target.value });
                    form.actions.clearError({ field: "purchaseDate" });
                  }}
                  type="date"
                  className={`h-11 rounded-xl bg-white text-gray-900 focus-visible:ring-2 dark:bg-black dark:text-white ${
                    form.errors.purchaseDate
                      ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500'
                      : 'border-gray-300 dark:border-white/20 focus-visible:ring-[#429de6]'
                  }`}
                />
                {form.errors.purchaseDate && (
                  <p className="text-sm text-red-500 dark:text-red-400">{form.errors.purchaseDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("admin.modals.addCar.type")}
                </Label>
                <select
                  value={form.fields.type}
                  onChange={(e) => form.actions.setType({ value: e.target.value })}
                  className="h-11 w-full rounded-xl border border-gray-300 dark:border-white/20 bg-white pl-4 pr-10 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#429de6] dark:bg-black dark:text-white appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iI0Q1RDdEQSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==')] bg-[length:16px_16px] bg-[center_right_0.75rem] bg-no-repeat"
                >
                  <option value={VehicleType.AUTO}>{t("admin.modals.addCar.vehicleTypes.auto")}</option>
                  <option value={VehicleType.MOTORCYCLE}>{t("admin.modals.addCar.vehicleTypes.motorcycle")}</option>
                  <option value={VehicleType.LIMOUSINE}>{t("admin.modals.addCar.vehicleTypes.limousine")}</option>
                  <option value={VehicleType.BOAT}>{t("admin.modals.addCar.vehicleTypes.boat")}</option>
                  <option value={VehicleType.TRAILER}>{t("admin.modals.addCar.vehicleTypes.trailer")}</option>
                  <option value={VehicleType.TRUCK}>{t("admin.modals.addCar.vehicleTypes.truck")}</option>
                  <option value={VehicleType.OVERSIZED_TRUCK}>{t("admin.modals.addCar.vehicleTypes.oversizedTruck")}</option>
                  <option value={VehicleType.JETSKI}>{t("admin.modals.addCar.vehicleTypes.jetski")}</option>
                  <option value={VehicleType.ATV}>{t("admin.modals.addCar.vehicleTypes.atv")}</option>
                  <option value={VehicleType.MOPED}>{t("admin.modals.addCar.vehicleTypes.moped")}</option>
                  <option value={VehicleType.SCOOTER}>{t("admin.modals.addCar.vehicleTypes.scooter")}</option>
                  <option value={VehicleType.OTHER}>{t("admin.modals.addCar.vehicleTypes.other")}</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("admin.modals.addCar.model")} <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  value={form.fields.model}
                  onChange={(e) => {
                    form.actions.setModel({ value: e.target.value });
                    form.actions.clearError({ field: "model" });
                  }}
                  placeholder={t("admin.modals.addCar.modelPlaceholder")}
                  className={`h-11 rounded-xl bg-white text-gray-900 focus-visible:ring-2 dark:bg-black dark:text-white ${
                    form.errors.model
                      ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500'
                      : 'border-gray-300 dark:border-white/20 focus-visible:ring-[#429de6]'
                  }`}
                />
                {form.errors.model && (
                  <p className="text-sm text-red-500 dark:text-red-400">{form.errors.model}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("admin.modals.addCar.year")} <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  value={form.fields.year}
                  onChange={(e) => {
                    const sanitized = sanitizeNumericInput(e.target.value);
                    form.actions.setYear({ value: sanitized });
                    form.actions.clearError({ field: "year" });
                  }}
                  inputMode="numeric"
                  placeholder={t("admin.modals.addCar.yearPlaceholder")}
                  className={`h-11 rounded-xl bg-white text-gray-900 focus-visible:ring-2 dark:bg-black dark:text-white ${
                    form.errors.year
                      ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500'
                      : 'border-gray-300 dark:border-white/20 focus-visible:ring-[#429de6]'
                  }`}
                />
                {form.errors.year && (
                  <p className="text-sm text-red-500 dark:text-red-400">{form.errors.year}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.modals.addCar.auction")}</Label>
                <select
                  value={form.fields.auction}
                  onChange={(e) => form.actions.setAuction({ value: e.target.value })}
                  className="h-11 w-full rounded-xl border border-gray-300 dark:border-white/20 bg-white pl-4 pr-10 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#429de6] dark:bg-black dark:text-white appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iI0Q1RDdEQSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==')] bg-[length:16px_16px] bg-[center_right_0.75rem] bg-no-repeat"
                >
                  {Object.values(Auction).map((auction) => (
                    <option key={auction} value={auction}>
                      {auction.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.modals.addCar.city")}</Label>
                <Select
                  value={form.fields.city}
                  onValueChange={(value) => form.actions.setCity({ value })}
                  disabled={loadingCities || !form.fields.auction}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#1c2128] focus:ring-2 focus:ring-[#429de6] focus:border-[#429de6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <SelectValue placeholder={
                      loadingCities 
                        ? t("admin.modals.addCar.loadingCities") 
                        : !form.fields.auction 
                          ? t("admin.modals.addCar.selectAuctionFirst")
                          : t("admin.modals.addCar.selectCity")
                    } />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#1c2128] border border-gray-200 dark:border-white/10 rounded-lg shadow-lg max-h-[300px] overflow-auto">
                    {cities.map((city) => (
                      <SelectItem 
                        key={city.id} 
                        value={city.city}
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 focus:bg-gray-100 dark:focus:bg-white/10 text-gray-900 dark:text-white px-3 py-2"
                      >
                        {city.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.modals.addCar.lot")}</Label>
                <Input
                  value={form.fields.lot}
                  onChange={(e) => form.actions.setLot({ value: e.target.value })}
                  placeholder={t("admin.modals.addCar.lotPlaceholder")}
                  className="h-11 rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white"
                />
              </div>


              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.modals.addCar.vin")}</Label>
                <Input
                  value={form.fields.vin}
                  onChange={(e) => {
                    form.actions.setVin({ value: e.target.value });
                    form.actions.clearError({ field: "vin" });
                  }}
                  placeholder={t("admin.modals.addCar.vinPlaceholder")}
                  className={`h-11 rounded-xl bg-white text-gray-900 focus-visible:ring-2 dark:bg-black dark:text-white ${
                    form.errors.vin
                      ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500'
                      : 'border-gray-300 dark:border-white/20 focus-visible:ring-[#429de6]'
                  }`}
                />
                {form.errors.vin && (
                  <p className="text-sm text-red-500 dark:text-red-400">{form.errors.vin}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.modals.addCar.containerNumberBooking")}</Label>
                <Input
                  value={form.fields.containerNumberBooking}
                  onChange={(e) => form.actions.setContainerNumberBooking({ value: e.target.value })}
                  placeholder={t("admin.modals.addCar.containerNumberBookingPlaceholder")}
                  className="h-11 rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.modals.addCar.promisedPickUpDate")}</Label>
                <Input
                  value={form.fields.promisedPickUpDate}
                  onChange={(e) => form.actions.setPromisedPickUpDate({ value: e.target.value })}
                  type="date"
                  className="h-11 rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.modals.addCar.deliveredWarehouse")}</Label>
                <Input
                  value={form.fields.deliveredWarehouse}
                  onChange={(e) => form.actions.setDeliveredWarehouse({ value: e.target.value })}
                  type="date"
                  className="h-11 rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.modals.addCar.price")}</Label>
                <Input
                  value={form.fields.priceUsd}
                  onChange={(e) => {
                    const sanitized = sanitizeNumericInput(e.target.value);
                    form.actions.setPriceUsd({ value: sanitized });
                    form.actions.clearError({ field: "priceUsd" });
                  }}
                  inputMode="numeric"
                  placeholder={t("admin.modals.addCar.pricePlaceholder")}
                  className={`h-11 rounded-xl bg-white text-gray-900 focus-visible:ring-2 dark:bg-black dark:text-white ${
                    form.errors.priceUsd
                      ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500'
                      : 'border-gray-300 dark:border-white/20 focus-visible:ring-[#429de6]'
                  }`}
                />
                {form.errors.priceUsd && (
                  <p className="text-sm text-red-500 dark:text-red-400">{form.errors.priceUsd}</p>
                )}
              </div>
              {/* Payment & Documents Section - Better organized UI */}
              <div className="sm:col-span-2 lg:col-span-3 space-y-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t("admin.modals.addCar.paymentsAndDocuments")}
                </h3>

                {/* Car Payment Card */}
                <div className={`
                  relative overflow-hidden rounded-xl border-2 transition-all duration-300
                  ${form.fields.carPaid 
                    ? 'bg-green-50/80 border-green-300 dark:bg-green-950/30 dark:border-green-800/50' 
                    : 'bg-orange-50/80 border-orange-300 dark:bg-orange-950/30 dark:border-orange-800/50'
                  }
                `}>
                  <div 
                    className="p-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    onClick={() => form.actions.setCarPaid({ value: !form.fields.carPaid })}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          {form.fields.carPaid ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                          )}
                          <Label htmlFor="car-paid-add" className="text-base font-bold text-gray-900 dark:text-white cursor-pointer">
                            {t("admin.modals.addCar.carPaid")}
                          </Label>
                        </div>
                        <div className={`
                          inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold
                          ${form.fields.carPaid 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' 
                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
                          }
                        `}>
                          {form.fields.carPaid ? t("admin.modals.addCar.paid") : t("admin.modals.addCar.notPaid")}
                        </div>
                      </div>
                      <Switch
                        id="car-paid-add"
                        checked={form.fields.carPaid}
                        onCheckedChange={(checked) => form.actions.setCarPaid({ value: checked })}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="px-4 pb-4 pt-2 border-t border-green-200/50 dark:border-green-800/30">
                    <PdfUploader
                      onFileSelect={setVehiclePdfFile}
                      disabled={isSubmitting}
                      translations={{
                        label: t("admin.modals.addCar.vehiclePdfLabel"),
                        dragDrop: t("admin.modals.addCar.dragDropVehiclePdf"),
                        dropHere: t("admin.modals.addCar.dropPdfHere"),
                        clickToBrowse: t("admin.modals.addCar.clickToBrowse"),
                        maxSize: t("admin.modals.addCar.pdfOnlyMaxSize"),
                        onlyPdfAllowed: t("admin.modals.addCar.onlyPdfAllowed"),
                        fileSizeLimit: t("admin.modals.addCar.fileSizeLimit")
                      }}
                    />
                  </div>
                </div>

                {/* Shipping Payment Card */}
                <div className={`
                  relative overflow-hidden rounded-xl border-2 transition-all duration-300
                  ${form.fields.shippingPaid 
                    ? 'bg-green-50/80 border-green-300 dark:bg-green-950/30 dark:border-green-800/50' 
                    : 'bg-orange-50/80 border-orange-300 dark:bg-orange-950/30 dark:border-orange-800/50'
                  }
                `}>
                  <div 
                    className="p-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    onClick={() => form.actions.setShippingPaid({ value: !form.fields.shippingPaid })}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          {form.fields.shippingPaid ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                          )}
                          <Label htmlFor="shipping-paid-add" className="text-base font-bold text-gray-900 dark:text-white cursor-pointer">
                            {t("admin.modals.addCar.shippingPaid")}
                          </Label>
                        </div>
                        <div className={`
                          inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold
                          ${form.fields.shippingPaid 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' 
                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
                          }
                        `}>
                          {form.fields.shippingPaid ? t("admin.modals.addCar.paid") : t("admin.modals.addCar.notPaid")}
                        </div>
                      </div>
                      <Switch
                        id="shipping-paid-add"
                        checked={form.fields.shippingPaid}
                        onCheckedChange={(checked) => form.actions.setShippingPaid({ value: checked })}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="px-4 pb-4 pt-2 border-t border-green-200/50 dark:border-green-800/30">
                    <PdfUploader
                      onFileSelect={setShippingPdfFile}
                      disabled={isSubmitting}
                      translations={{
                        label: t("admin.modals.addCar.shippingPdfLabel"),
                        dragDrop: t("admin.modals.addCar.dragDropShippingPdf"),
                        dropHere: t("admin.modals.addCar.dropPdfHere"),
                        clickToBrowse: t("admin.modals.addCar.clickToBrowse"),
                        maxSize: t("admin.modals.addCar.pdfOnlyMaxSize"),
                        onlyPdfAllowed: t("admin.modals.addCar.onlyPdfAllowed"),
                        fileSizeLimit: t("admin.modals.addCar.fileSizeLimit")
                      }}
                    />
                  </div>
                </div>

                {/* Insurance Card */}
                <div className={`
                  relative overflow-hidden rounded-xl border-2 transition-all duration-300
                  ${form.fields.insurance 
                    ? 'bg-blue-50/80 border-blue-300 dark:bg-blue-950/30 dark:border-blue-800/50' 
                    : 'bg-gray-50/80 border-gray-300 dark:bg-gray-800/30 dark:border-gray-700/50'
                  }
                `}>
                  <div 
                    className="p-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    onClick={() => form.actions.setInsurance({ value: !form.fields.insurance })}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          {form.fields.insurance ? (
                            <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                          )}
                          <Label htmlFor="insurance-add" className="text-base font-bold text-gray-900 dark:text-white cursor-pointer">
                            {t("admin.modals.addCar.insurance")}
                          </Label>
                        </div>
                        <div className={`
                          inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold
                          ${form.fields.insurance 
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300'
                          }
                        `}>
                          {form.fields.insurance ? t("admin.modals.addCar.exists") : t("admin.modals.addCar.notExists")}
                        </div>
                      </div>
                      <Switch
                        id="insurance-add"
                        checked={form.fields.insurance}
                        onCheckedChange={(checked) => form.actions.setInsurance({ value: checked })}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="px-4 pb-4 pt-2 border-t border-blue-200/50 dark:border-blue-800/30">
                    <PdfUploader
                      onFileSelect={setInsurancePdfFile}
                      disabled={isSubmitting}
                      translations={{
                        label: t("admin.modals.addCar.insurancePdfLabel"),
                        dragDrop: t("admin.modals.addCar.dragDropInsurancePdf"),
                        dropHere: t("admin.modals.addCar.dropPdfHere"),
                        clickToBrowse: t("admin.modals.addCar.clickToBrowse"),
                        maxSize: t("admin.modals.addCar.pdfOnlyMaxSize"),
                        onlyPdfAllowed: t("admin.modals.addCar.onlyPdfAllowed"),
                        fileSizeLimit: t("admin.modals.addCar.fileSizeLimit")
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("admin.modals.addCar.customerNotes")}</Label>
                <Textarea
                  value={form.fields.customerNotes}
                  onChange={(e) => form.actions.setCustomerNotes({ value: e.target.value })}
                  placeholder={t("admin.modals.addCar.customerNotesPlaceholder")}
                  className="min-h-[100px] rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 focus-visible:ring-2 focus-visible:ring-[#429de6] dark:bg-black dark:text-white resize-none"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 px-8 py-5 dark:border-white/10 bg-gray-50 dark:bg-[#0a0a0a]">
          <DialogFooter className="gap-3 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-11 px-6 rounded-xl border-gray-300 dark:border-white/20 bg-white text-gray-900 hover:bg-gray-100 dark:bg-black dark:text-white dark:hover:bg-white/5 font-medium"
              onClick={close}
            >
              {t("admin.modals.addCar.cancel")}
            </Button>
            <Button
              type="button"
              className="h-11 px-6 rounded-xl bg-[#429de6] text-white hover:bg-[#3a8acc] disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-blue-500/20"
              disabled={!form.derived.isSubmitEnabled || isSubmitting}
              onClick={onSubmit}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t("admin.modals.addCar.submitting")}</span>
                </div>
              ) : (
                t("admin.modals.addCar.submit")
              )}
            </Button>
          </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};




