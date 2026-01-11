"use client";

import { useState, useEffect } from "react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";

import type { AdminCar } from "@/lib/admin/types";
import { VehicleType, Auction } from "@/lib/admin/types";
import { updateCar } from "@/lib/admin/updateCar";
import { fetchUsers } from "@/lib/admin/fetchUsers";
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
import { PdfUploader } from "@/components/admin/primitives/PdfUploader";
import { usePhotoUploads } from "@/hooks/admin/usePhotoUploads";
import { PhotoUploadGrid } from "@/components/admin/modals/PhotoUploadGrid";

type UpdateCarModalProps = {
  open: boolean;
  car: AdminCar | null;
  onOpenChange: ({ open }: { open: boolean }) => void;
  onCarUpdated?: () => void;
};

type User = {
  id: string;
  customerId?: string;
  firstName: string;
  lastName: string;
  email: string;
};

export const UpdateCarModal = ({ open, car, onOpenChange, onCarUpdated }: UpdateCarModalProps) => {
  const t = useTranslations();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Photo management
  const { files, previews: newPreviews, setFileAt, removeFileAt, clearAll, addMultipleFiles } = usePhotoUploads({ 
    maxFiles: 25, 
    initialSlots: 1 
  });
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([]);

  // Form state
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [priceUsd, setPriceUsd] = useState("");
  const [vehicleType, setVehicleType] = useState<string>("");
  const [auction, setAuction] = useState<string>("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [city, setCity] = useState("");
  const [lot, setLot] = useState("");
  const [vin, setVin] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [currentInvoice, setCurrentInvoice] = useState<string>("");
  const [carPaid, setCarPaid] = useState(false);
  const [shippingPaid, setShippingPaid] = useState(false);
  const [insurance, setInsurance] = useState(false);

  // Populate form when car data changes
  useEffect(() => {
    if (car) {
      setModel(car.model || "");
      setYear(car.year?.toString() || "");
      setPriceUsd(car.priceUsd?.toString() || "");
      setVehicleType(car.details?.type || "");
      setAuction(car.details?.auction || "");
      setPurchaseDate(car.details?.purchaseDate ? car.details.purchaseDate.split('T')[0] : "");
      setCity(car.details?.city || "");
      setLot(car.details?.lot || "");
      setVin(car.details?.vin || "");
      setCustomerNotes(car.details?.customerNotes || "");
      setCurrentInvoice(car.details?.invoice || "");
      setInvoiceFile(null);
      setCarPaid(car.carPaid || false);
      setShippingPaid(car.shippingPaid || false);
      setInsurance(car.insurance || false);
      
      // Initialize photos
      const carPhotos = car.photos || [];
      setExistingPhotos(carPhotos);
      setPhotosToDelete([]);
      clearAll();
      // Note: selectedUserId is set after users are loaded
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [car]);

  // Fetch users
  useEffect(() => {
    if (open) {
      const loadUsers = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        if (!token) return;

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
            
            // Set selected user after users are loaded if car has a client
            if (car?.client) {
              console.log('Car client value:', car.client);
              console.log('Available user IDs:', formattedUsers.map(u => u.id));
              
              // Try to match by ID first
              const matchedById = formattedUsers.find(u => u.id === car.client || u.customerId === car.client);
              
              // If not found by ID, try to match by full name
              const matchedByName = formattedUsers.find(u => 
                `${u.firstName} ${u.lastName}` === car.client
              );
              
              const matchedUser = matchedById || matchedByName;
              
              if (matchedUser) {
                console.log('Matched user:', matchedUser);
                setSelectedUserId(matchedUser.id);
              } else {
                console.log('No matching user found for:', car.client);
              }
            }
          }
        } catch (error) {
          console.error("Error loading users:", error);
        } finally {
          setLoadingUsers(false);
        }
      };

      loadUsers();
    }
  }, [open, car]);

  const handleRemoveExistingPhoto = (index: number) => {
    const photoUrl = existingPhotos[index];
    if (photoUrl) {
      setPhotosToDelete((prev) => [...prev, photoUrl]);
      setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleClose = () => {
    // Reset selected user and invoice when closing
    setSelectedUserId("");
    setInvoiceFile(null);
    setCurrentInvoice("");
    setCarPaid(false);
    setShippingPaid(false);
    setInsurance(false);
    onOpenChange({ open: false });
  };

  const handleSubmit = async () => {
    if (!car) return;

    // Validation
    if (!model.trim()) {
      toast.error("Validation Error", {
        description: "Model is required",
      });
      return;
    }

    if (!year || isNaN(Number(year))) {
      toast.error("Validation Error", {
        description: "Valid year is required",
      });
      return;
    }

    if (!priceUsd || isNaN(Number(priceUsd))) {
      toast.error("Validation Error", {
        description: "Valid price is required",
      });
      return;
    }

    // Filter out null files to get only new photos
    const newPhotoFiles = files.filter((file): file is File => file !== null);

    setIsSubmitting(true);

    try {
      // Find the selected user to get their full name
      const selectedUser = users.find(u => u.id === selectedUserId);
      
      const result = await updateCar({
        id: car.id,
        data: {
          client: selectedUser?.customerId,
          model: model.trim(),
          vehicleModel: model.trim(),
          year: Number(year),
          autoPrice: Number(priceUsd),
          carPaid,
          shippingPaid,
          insurance,
          ...(vehicleType.trim() && { type: vehicleType.trim() }),
          ...(auction.trim() && { auction: auction.trim() }),
          ...(purchaseDate.trim() && { purchaseDate: purchaseDate.trim() }),
          ...(city.trim() && { city: city.trim() }),
          ...(lot.trim() && { lot: lot.trim() }),
          ...(vin.trim() && { vin: vin.trim() }),
          ...(customerNotes.trim() && { customerNotes: customerNotes.trim() }),
        },
        invoiceFile,
        newPhotos: newPhotoFiles,
        photosToDelete,
      });

      if (result.success) {
        toast.success(t("admin.modals.updateCar.successTitle"), {
          description: t("admin.modals.updateCar.successDescription"),
        });
        
        if (onCarUpdated) {
          onCarUpdated();
        }
        
        handleClose();
      } else {
        toast.error(t("admin.modals.updateCar.errorTitle"), {
          description: result.error || t("admin.modals.updateCar.unexpectedError"),
        });
      }
    } catch (error) {
      toast.error(t("admin.modals.updateCar.errorTitle"), {
        description: error instanceof Error ? error.message : t("admin.modals.updateCar.unexpectedError"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!car) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => onOpenChange({ open: isOpen })}>
      <DialogContent className="w-[calc(100vw-20px)] sm:w-[calc(100vw-40px)] lg:w-[95vw] lg:min-w-[1400px] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0b0f14] border border-gray-200 dark:border-white/10 shadow-2xl rounded-2xl sm:rounded-3xl p-0">
        <DialogHeader className="px-4 sm:px-8 lg:px-16 pt-5 sm:pt-6 lg:pt-7 pb-4 sm:pb-5 border-b border-gray-200 dark:border-white/10">
          <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{t("admin.modals.updateCar.title")}</DialogTitle>
          <p className="text-sm sm:text-base text-gray-500 dark:text-white/60 mt-1 sm:mt-2">{t("admin.modals.updateCar.subtitle")}</p>
        </DialogHeader>

        <div className="px-4 sm:px-8 lg:px-16 py-5 sm:py-6 lg:py-8 space-y-4 sm:space-y-5 lg:space-y-6 bg-gray-50/50 dark:bg-[#0b0f14]">
          {/* Car Photos */}
          <div className="space-y-3">
            <Label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
              Existing Car Photos {existingPhotos.length > 0 && `(${existingPhotos.length})`}
            </Label>
            
            {/* Existing Photos - Readonly, can only be deleted */}
            {existingPhotos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {existingPhotos.map((photoUrl, index) => (
                  <div key={`existing-${index}`} className="group relative h-[140px] sm:h-[160px] overflow-hidden rounded-2xl border border-solid border-gray-200 dark:border-white/10">
                    <img
                      src={photoUrl}
                      alt={`Car photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0 opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-1 text-[11px] font-medium text-gray-900 opacity-0 transition-opacity group-hover:opacity-100">
                      Photo {index + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingPhoto(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110"
                      aria-label="Remove photo"
                    >
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New Photos Upload */}
            <div className="space-y-2 pt-2">
              <Label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                Add New Photos
              </Label>
              <PhotoUploadGrid
                label=""
                previews={newPreviews}
                onPickFile={setFileAt}
                onRemoveFile={removeFileAt}
                onPickMultipleFiles={addMultipleFiles}
                tileClassName="h-[140px] sm:h-[160px]"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200 dark:border-white/10">
              <p className="text-gray-500 dark:text-gray-400">
                {existingPhotos.length} existing • {files.filter(f => f !== null).length} new • Up to 25 photos total
              </p>
              {photosToDelete.length > 0 && (
                <p className="text-amber-600 dark:text-amber-400 font-medium">
                  {photosToDelete.length} photo{photosToDelete.length > 1 ? 's' : ''} will be deleted
                </p>
              )}
            </div>
          </div>

          {/* Row 1: Model, Year, Price, Vehicle Type, Auction */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
            <div className="space-y-2">
              <Label htmlFor="model" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                {t("admin.modals.updateCar.model")} *
              </Label>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="bmw"
                required
                className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                {t("admin.modals.updateCar.year")} *
              </Label>
              <Input
                id="year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2025"
                min="1900"
                max={new Date().getFullYear() + 1}
                required
                className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                {t("admin.modals.updateCar.priceUsd")} *
              </Label>
              <Input
                id="price"
                type="number"
                value={priceUsd}
                onChange={(e) => setPriceUsd(e.target.value)}
                placeholder="20000"
                min="0"
                step="0.01"
                required
                className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                {t("admin.modals.updateCar.vehicleType")}
              </Label>
              <Select value={vehicleType || "none"} onValueChange={(value) => setVehicleType(value === "none" ? "" : value)}>
                <SelectTrigger id="type" className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 transition-all duration-200">
                  <SelectValue placeholder="truck" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#161b22] border-gray-200 dark:border-white/10 shadow-xl">
                  <SelectItem value="none" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 rounded-md">{t("admin.modals.updateCar.noType")}</SelectItem>
                  {Object.values(VehicleType).map((type) => (
                    <SelectItem key={type} value={type} className="capitalize text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 rounded-md">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auction" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                {t("admin.modals.updateCar.auction")}
              </Label>
              <Select value={auction || "none"} onValueChange={(value) => setAuction(value === "none" ? "" : value)}>
                <SelectTrigger id="auction" className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 transition-all duration-200">
                  <SelectValue placeholder="copart" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#161b22] border-gray-200 dark:border-white/10 shadow-xl">
                  <SelectItem value="none" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 rounded-md">{t("admin.modals.updateCar.noAuction")}</SelectItem>
                  {Object.values(Auction).map((auctionValue) => (
                    <SelectItem key={auctionValue} value={auctionValue} className="uppercase text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 rounded-md">
                      {auctionValue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Purchase Date, City, Lot Number, VIN, Client */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                {t("admin.modals.updateCar.purchaseDate")}
              </Label>
              <Input
                id="purchaseDate"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200 [color-scheme:dark]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                {t("admin.modals.updateCar.city")}
              </Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="New York"
                className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lot" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                {t("admin.modals.updateCar.lotNumber")}
              </Label>
              <Input
                id="lot"
                value={lot}
                onChange={(e) => setLot(e.target.value)}
                placeholder="3213213"
                className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vin" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                {t("admin.modals.updateCar.vin")}
              </Label>
              <Input
                id="vin"
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                placeholder="312312dsa"
                maxLength={17}
                className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                {t("admin.modals.updateCar.client")}
              </Label>
              <Select value={selectedUserId || "none"} onValueChange={(value) => setSelectedUserId(value === "none" ? "" : value)}>
                <SelectTrigger id="client" disabled={loadingUsers} className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                  <SelectValue placeholder={loadingUsers ? t("admin.modals.updateCar.loadingUsers") : t("admin.modals.updateCar.noClient")} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#161b22] border-gray-200 dark:border-white/10 shadow-xl max-h-[300px]">
                  <SelectItem value="none" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 rounded-md">{t("admin.modals.updateCar.noClient")}</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id} className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 rounded-md">
                      {user.firstName} {user.lastName} 
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Payment Status & Insurance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pt-1 sm:pt-2">
            {/* Car Payment */}
            <div 
              className={`
                relative overflow-hidden p-4 sm:p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer
                ${carPaid 
                  ? 'bg-green-50/80 border-green-300 dark:bg-green-950/30 dark:border-green-800/50 hover:bg-green-50 dark:hover:bg-green-950/40' 
                  : 'bg-orange-50/80 border-orange-300 dark:bg-orange-950/30 dark:border-orange-800/50 hover:bg-orange-50 dark:hover:bg-orange-950/40'
                }
              `}
              onClick={() => !isSubmitting && setCarPaid(!carPaid)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    {carPaid ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                    )}
                    <Label htmlFor="car-paid" className="text-base font-bold text-gray-900 dark:text-white cursor-pointer">
                      {t("admin.modals.updateCar.carPaid")}
                    </Label>
                  </div>
                  <div className={`
                    inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold
                    ${carPaid 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' 
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
                    }
                  `}>
                    {carPaid ? t("admin.modals.addCar.paid") : t("admin.modals.addCar.notPaid")}
                  </div>
                </div>
                <Switch
                  id="car-paid"
                  checked={carPaid}
                  onCheckedChange={setCarPaid}
                  disabled={isSubmitting}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Shipping Payment */}
            <div 
              className={`
                relative overflow-hidden p-4 sm:p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer
                ${shippingPaid 
                  ? 'bg-green-50/80 border-green-300 dark:bg-green-950/30 dark:border-green-800/50 hover:bg-green-50 dark:hover:bg-green-950/40' 
                  : 'bg-orange-50/80 border-orange-300 dark:bg-orange-950/30 dark:border-orange-800/50 hover:bg-orange-50 dark:hover:bg-orange-950/40'
                }
              `}
              onClick={() => !isSubmitting && setShippingPaid(!shippingPaid)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    {shippingPaid ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                    )}
                    <Label htmlFor="shipping-paid" className="text-base font-bold text-gray-900 dark:text-white cursor-pointer">
                      {t("admin.modals.updateCar.shippingPaid")}
                    </Label>
                  </div>
                  <div className={`
                    inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold
                    ${shippingPaid 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' 
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
                    }
                  `}>
                    {shippingPaid ? t("admin.modals.addCar.paid") : t("admin.modals.addCar.notPaid")}
                  </div>
                </div>
                <Switch
                  id="shipping-paid"
                  checked={shippingPaid}
                  onCheckedChange={setShippingPaid}
                  disabled={isSubmitting}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Insurance */}
            <div 
              className={`
                relative overflow-hidden p-4 sm:p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer
                ${insurance 
                  ? 'bg-blue-50/80 border-blue-300 dark:bg-blue-950/30 dark:border-blue-800/50 hover:bg-blue-50 dark:hover:bg-blue-950/40' 
                  : 'bg-gray-50/80 border-gray-300 dark:bg-gray-800/30 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/40'
                }
              `}
              onClick={() => !isSubmitting && setInsurance(!insurance)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    {insurance ? (
                      <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                    )}
                    <Label htmlFor="insurance" className="text-base font-bold text-gray-900 dark:text-white cursor-pointer">
                      {t("admin.modals.updateCar.insurance")}
                    </Label>
                  </div>
                  <div className={`
                    inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold
                    ${insurance 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300'
                    }
                  `}>
                    {insurance ? t("admin.modals.addCar.exists") : t("admin.modals.addCar.notExists")}
                  </div>
                </div>
                <Switch
                  id="insurance"
                  checked={insurance}
                  onCheckedChange={setInsurance}
                  disabled={isSubmitting}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </div>

          {/* Row 4: Customer Notes and Invoice Upload */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 pt-1 sm:pt-2">
            <div className="space-y-2">
              <Label htmlFor="notes" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
              {t("admin.modals.updateCar.customerNotes")}
              </Label>
              <Textarea
                id="notes"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Some notes"
                rows={3}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 resize-none bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:dark:bg-[#1c2128] transition-all duration-200"
              />
            </div>
            
            <PdfUploader
              onFileSelect={setInvoiceFile}
              currentFileName={currentInvoice}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 px-4 sm:px-8 lg:px-16 py-5 sm:py-6 lg:py-7 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b0f14]">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto sm:min-w-[140px] lg:min-w-[150px] h-11 sm:h-12 text-[15px] sm:text-[16px] font-medium border-2 border-gray-300 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 hover:dark:border-white/20 text-gray-900 dark:text-white rounded-lg transition-all duration-200"
          >
            {t("admin.modals.updateCar.cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto sm:min-w-[140px] lg:min-w-[150px] h-11 sm:h-12 text-[15px] sm:text-[16px] bg-gradient-to-r from-[#429de6] to-[#3b8ed4] hover:from-[#3a8acc] hover:to-[#3280bb] text-white font-semibold rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{t("admin.modals.updateCar.updating")}</span>
              </div>
            ) : (
              t("admin.modals.updateCar.updateButton")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
