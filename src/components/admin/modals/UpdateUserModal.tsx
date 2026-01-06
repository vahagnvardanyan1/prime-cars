"use client";

import { useState, useEffect } from "react";

import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import type { AdminUser } from "@/lib/admin/types";
import { updateUser } from "@/lib/admin/updateUser";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UpdateUserModalProps = {
  open: boolean;
  user: AdminUser | null;
  onOpenChange: ({ open }: { open: boolean }) => void;
  onUserUpdated?: () => void;
};

export const UpdateUserModal = ({
  open,
  user,
  onOpenChange,
  onUserUpdated,
}: UpdateUserModalProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [passport, setPassport] = useState("");
  const [country, setCountry] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when user data changes
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setUsername(user.username || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setPassport(user.passport || "");
      setCountry(user.country || "");
      setCompanyName(user.companyName || "");
      setPassword(""); // Never pre-fill password
    }
  }, [user]);

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange({ open: false });
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Validation
    if (!firstName.trim()) {
      toast.error("First name is required");
      return;
    }

    if (!lastName.trim()) {
      toast.error("Last name is required");
      return;
    }

    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateUser({
        id: user.id,
        data: {
          ...(firstName.trim() && { firstName: firstName.trim() }),
          ...(lastName.trim() && { lastName: lastName.trim() }),
          ...(username.trim() && { username: username.trim() }),
          ...(email.trim() && { email: email.trim() }),
          ...(phone.trim() && { phone: phone.trim() }),
          ...(passport.trim() && { passport: passport.trim() }),
          ...(country.trim() && { country: country.trim() }),
          ...(companyName.trim() && { companyName: companyName.trim() }),
          ...(password.trim() && { password: password.trim() }),
        },
      });

      if (result.success) {
        toast.success("User updated successfully");
        onOpenChange({ open: false });
        if (onUserUpdated) {
          onUserUpdated();
        }
      } else {
        toast.error(result.error || "Failed to update user");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Error updating user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => onOpenChange({ open: isOpen })}>
      <DialogContent className="w-[95vw] sm:w-[90vw] lg:w-[95vw] min-w-0 sm:min-w-0 lg:min-w-[1400px] max-w-[95vw] sm:max-w-[90vw] lg:max-w-[1600px] max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10 p-4 sm:p-6 lg:p-8">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Update User
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
            Update user information and credentials
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-4">
          {/* Row 1: First Name, Last Name, Username */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="firstName"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="h-12 sm:h-[44px] lg:h-[48px] w-full text-base sm:text-[15px] lg:text-base px-3 sm:px-3 lg:px-4 bg-white dark:bg-[#161b22] border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="lastName"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="h-12 sm:h-[44px] lg:h-[48px] w-full text-base sm:text-[15px] lg:text-base px-3 sm:px-3 lg:px-4 bg-white dark:bg-[#161b22] border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="username"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Username <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                className="h-12 sm:h-[44px] lg:h-[48px] w-full text-base sm:text-[15px] lg:text-base px-3 sm:px-3 lg:px-4 bg-white dark:bg-[#161b22] border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Row 2: Email, Phone, Passport */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="h-12 sm:h-[44px] lg:h-[48px] w-full text-base sm:text-[15px] lg:text-base px-3 sm:px-3 lg:px-4 bg-white dark:bg-[#161b22] border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="phone"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Phone
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                className="h-12 sm:h-[44px] lg:h-[48px] w-full text-base sm:text-[15px] lg:text-base px-3 sm:px-3 lg:px-4 bg-white dark:bg-[#161b22] border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="passport"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Passport
              </Label>
              <Input
                id="passport"
                value={passport}
                onChange={(e) => setPassport(e.target.value)}
                placeholder="AB123456"
                className="h-12 sm:h-[44px] lg:h-[48px] w-full text-base sm:text-[15px] lg:text-base px-3 sm:px-3 lg:px-4 bg-white dark:bg-[#161b22] border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Row 3: Country, Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="country"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Country
              </Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="United States"
                className="h-12 sm:h-[44px] lg:h-[48px] w-full text-base sm:text-[15px] lg:text-base px-3 sm:px-3 lg:px-4 bg-white dark:bg-[#161b22] border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="companyName"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Company Name
              </Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Inc."
                className="h-12 sm:h-[44px] lg:h-[48px] w-full text-base sm:text-[15px] lg:text-base px-3 sm:px-3 lg:px-4 bg-white dark:bg-[#161b22] border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Row 4: Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave empty to keep current password"
                  className="h-12 sm:h-[44px] lg:h-[48px] w-full text-base sm:text-[15px] lg:text-base px-3 sm:px-3 lg:px-4 pr-10 sm:pr-11 lg:pr-12 bg-white dark:bg-[#161b22] border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Only fill this field if you want to change the password
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3 pt-4 sm:pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto order-2 sm:order-1 h-11 sm:h-12 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-[#161b22] dark:text-gray-300 dark:hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto order-1 sm:order-2 h-11 sm:h-12 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            {isSubmitting ? "Updating..." : "Update User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

