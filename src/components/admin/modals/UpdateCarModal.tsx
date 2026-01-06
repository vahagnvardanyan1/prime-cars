"use client";

import { useState, useEffect } from "react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import type { AdminCar } from "@/lib/admin/types";
import { VehicleType, Auction } from "@/lib/admin/types";
import { updateCar } from "@/lib/admin/updateCar";
import { fetchUsers } from "@/lib/admin/fetchUsers";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      // Note: selectedUserId is set after users are loaded
    }
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

  const handleClose = () => {
    // Reset selected user when closing
    setSelectedUserId("");
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

    setIsSubmitting(true);

    try {
      // Find the selected user to get their full name
      const selectedUser = users.find(u => u.id === selectedUserId);
      debugger
      const result = await updateCar({
        id: car.id,
        data: {
          client: selectedUser?.customerId,
          model: model.trim(),
          vehicleModel: model.trim(),
          year: Number(year),
          autoPrice: Number(priceUsd),
          ...(vehicleType.trim() && { type: vehicleType.trim() }),
            ...(auction.trim() && { auction: auction.trim() }),
          ...(purchaseDate.trim() && { purchaseDate: purchaseDate.trim() }),
          ...(city.trim() && { city: city.trim() }),
          ...(lot.trim() && { lot: lot.trim() }),
          ...(vin.trim() && { vin: vin.trim() }),
          ...(customerNotes.trim() && { customerNotes: customerNotes.trim() }),
        },
      });

      if (result.success) {
        toast.success("Car Updated", {
          description: "The car has been updated successfully.",
        });
        
        if (onCarUpdated) {
          onCarUpdated();
        }
        
        handleClose();
      } else {
        toast.error("Update Failed", {
          description: result.error || "Failed to update the car. Please try again.",
        });
      }
    } catch (error) {
      toast.error("Update Failed", {
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
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
          <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Update Car</DialogTitle>
          <p className="text-sm sm:text-base text-gray-500 dark:text-white/60 mt-1 sm:mt-2">Edit vehicle information and details</p>
        </DialogHeader>

        <div className="px-4 sm:px-8 lg:px-16 py-5 sm:py-6 lg:py-8 space-y-4 sm:space-y-5 lg:space-y-6 bg-gray-50/50 dark:bg-[#0b0f14]">
          {/* Row 1: Model, Year, Price, Vehicle Type, Auction */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
            <div className="space-y-2">
              <Label htmlFor="model" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
                Model *
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
                Year *
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
                Price (USD) *
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
                Vehicle Type
              </Label>
              <Select value={vehicleType || "none"} onValueChange={(value) => setVehicleType(value === "none" ? "" : value)}>
                <SelectTrigger id="type" className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 transition-all duration-200">
                  <SelectValue placeholder="truck" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#161b22] border-gray-200 dark:border-white/10 shadow-xl">
                  <SelectItem value="none" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 rounded-md">No type</SelectItem>
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
                Auction
              </Label>
              <Select value={auction || "none"} onValueChange={(value) => setAuction(value === "none" ? "" : value)}>
                <SelectTrigger id="auction" className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 transition-all duration-200">
                  <SelectValue placeholder="copart" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#161b22] border-gray-200 dark:border-white/10 shadow-xl">
                  <SelectItem value="none" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 rounded-md">No auction</SelectItem>
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
                Purchase Date
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
                City
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
                Lot Number
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
                VIN
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
                Client
              </Label>
              <Select value={selectedUserId || "none"} onValueChange={(value) => setSelectedUserId(value === "none" ? "" : value)}>
                <SelectTrigger id="client" disabled={loadingUsers} className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 bg-white dark:bg-[#161b22] hover:dark:bg-[#1c2128] border border-gray-300 dark:border-white/10 hover:dark:border-white/20 rounded-lg text-[15px] sm:text-[16px] text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400/50 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                  <SelectValue placeholder={loadingUsers ? "Loading users..." : "No client"} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#161b22] border-gray-200 dark:border-white/10 shadow-xl max-h-[300px]">
                  <SelectItem value="none" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 rounded-md">No client</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id} className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 rounded-md">
                      {user.firstName} {user.lastName} 
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Customer Notes (full width) */}
          <div className="space-y-2 pt-1 sm:pt-2">
            <Label htmlFor="notes" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/90 uppercase tracking-wide">
              Customer Notes
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
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 px-4 sm:px-8 lg:px-16 py-5 sm:py-6 lg:py-7 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b0f14]">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto sm:min-w-[140px] lg:min-w-[150px] h-11 sm:h-12 text-[15px] sm:text-[16px] font-medium border-2 border-gray-300 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 hover:dark:border-white/20 text-gray-900 dark:text-white rounded-lg transition-all duration-200"
          >
            Cancel
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
                <span>Updating...</span>
              </div>
            ) : (
              "Update Car"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
