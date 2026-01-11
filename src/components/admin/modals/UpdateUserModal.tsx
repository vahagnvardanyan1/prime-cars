"use client";

import { useState, useEffect } from "react";

import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("admin.modals.updateUser");
  const tValidation = useTranslations("auth.validation");
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
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    phone?: string;
    password?: string;
  }>({});

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
      setErrors({}); // Clear errors when user changes
    }
  }, [user]);

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange({ open: false });
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!firstName.trim()) {
      newErrors.firstName = tValidation("firstNameRequired");
    }

    if (!lastName.trim()) {
      newErrors.lastName = tValidation("lastNameRequired");
    }

    if (!username.trim()) {
      newErrors.username = tValidation("usernameRequired");
    } else if (username.trim().length < 3) {
      newErrors.username = tValidation("usernameMinLength");
    }

    if (!email.trim()) {
      newErrors.email = tValidation("emailRequired");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = tValidation("emailInvalid");
      }
    }

    if (phone.trim()) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(phone.trim()) || phone.trim().length < 8) {
        newErrors.phone = tValidation("phoneInvalid");
      }
    }

    if (password.trim() && password.trim().length < 6) {
      newErrors.password = tValidation("passwordMinLength");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (!validateForm()) {
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
        toast.success(t("successMessage"));
        onOpenChange({ open: false });
        if (onUserUpdated) {
          onUserUpdated();
        }
      } else {
        toast.error(result.error || t("errorMessage"));
      }
    } catch (error) {
      toast.error(t("unexpectedError"));
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
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
            {t("subtitle")}
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
                {t("firstName")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (errors.firstName) {
                    setErrors({ ...errors, firstName: undefined });
                  }
                }}
                placeholder={t("firstNamePlaceholder")}
                className={`h-12 sm:h-[44px] lg:h-[48px] w-full text-base sm:text-[15px] lg:text-base px-3 sm:px-3 lg:px-4 bg-white dark:bg-[#161b22] text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 ${
                  errors.firstName
                    ? 'border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500 focus:ring-red-500 dark:focus:ring-red-500'
                    : 'border-gray-300 dark:border-white/10 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-500'
                }`}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500 dark:text-red-400">{errors.firstName}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="lastName"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("lastName")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (errors.lastName) {
                    setErrors({ ...errors, lastName: undefined });
                  }
                }}
                placeholder={t("lastNamePlaceholder")}
                className={`h-12 sm:h-[44px] lg:h-[48px] w-full text-base sm:text-[15px] lg:text-base px-3 sm:px-3 lg:px-4 bg-white dark:bg-[#161b22] text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 ${
                  errors.lastName
                    ? 'border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500 focus:ring-red-500 dark:focus:ring-red-500'
                    : 'border-gray-300 dark:border-white/10 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-500'
                }`}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500 dark:text-red-400">{errors.lastName}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="username"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("username")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username) {
                    setErrors({ ...errors, username: undefined });
                  }
                }}
                placeholder={t("usernamePlaceholder")}
                className={`h-12 sm:h-[44px] lg:h-[48px] w-full text-base sm:text-[15px] lg:text-base px-3 sm:px-3 lg:px-4 bg-white dark:bg-[#161b22] text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 ${
                  errors.username
                    ? 'border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500 focus:ring-red-500 dark:focus:ring-red-500'
                    : 'border-gray-300 dark:border-white/10 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-500'
                }`}
              />
              {errors.username && (
                <p className="text-sm text-red-500 dark:text-red-400">{errors.username}</p>
              )}
            </div>
          </div>

          {/* Row 2: Email, Phone, Passport */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("email")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors({ ...errors, email: undefined });
                  }
                }}
                placeholder={t("emailPlaceholder")}
                className={`h-12 sm:h-[44px] lg:h-[48px] w-full text-base sm:text-[15px] lg:text-base px-3 sm:px-3 lg:px-4 bg-white dark:bg-[#161b22] text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 ${
                  errors.email
                    ? 'border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500 focus:ring-red-500 dark:focus:ring-red-500'
                    : 'border-gray-300 dark:border-white/10 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-500'
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-500 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="phone"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("phone")}
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("phonePlaceholder")}
                className="h-12 sm:h-[44px] lg:h-[48px] w-full text-base sm:text-[15px] lg:text-base px-3 sm:px-3 lg:px-4 bg-white dark:bg-[#161b22] border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="passport"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("passport")}
              </Label>
              <Input
                id="passport"
                value={passport}
                onChange={(e) => setPassport(e.target.value)}
                placeholder={t("passportPlaceholder")}
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
                {t("country")}
              </Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder={t("countryPlaceholder")}
                className="h-12 sm:h-[44px] lg:h-[48px] w-full text-base sm:text-[15px] lg:text-base px-3 sm:px-3 lg:px-4 bg-white dark:bg-[#161b22] border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="companyName"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("companyName")}
              </Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={t("companyNamePlaceholder")}
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
                {t("password")}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("passwordPlaceholder")}
                  className="h-12 sm:h-[44px] lg:h-[48px] w-full text-base sm:text-[15px] lg:text-base px-3 sm:px-3 lg:px-4 pr-10 sm:pr-11 lg:pr-12 bg-white dark:bg-[#161b22] border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("passwordHint")}
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
            {t("cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto order-1 sm:order-2 h-11 sm:h-12 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            {isSubmitting ? t("submitting") : t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

