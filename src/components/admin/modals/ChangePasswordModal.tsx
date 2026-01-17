"use client";

import { useState } from "react";

import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

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
import { changePassword } from "@/lib/admin/changePassword";

type ChangePasswordModalProps = {
  open: boolean;
  onOpenChange: ({ open }: { open: boolean }) => void;
};

export const ChangePasswordModal = ({
  open,
  onOpenChange,
}: ChangePasswordModalProps) => {
  const t = useTranslations("admin.modals.changePassword");
  const tValidation = useTranslations("auth.validation");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const handleClose = () => {
    if (!isSubmitting) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      onOpenChange({ open: false });
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!currentPassword.trim()) {
      newErrors.currentPassword = tValidation("passwordRequired");
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = tValidation("passwordRequired");
    } else if (newPassword.length < 8) {
      newErrors.newPassword = tValidation("passwordTooShort");
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = tValidation("passwordRequired");
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = tValidation("passwordsMustMatch");
    }

    if (newPassword && currentPassword && newPassword === currentPassword) {
      newErrors.newPassword = t("newPasswordMustBeDifferent");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await changePassword({
        currentPassword,
        newPassword,
      });

      if (result.success) {
        toast.success(t("successTitle"), {
          description: t("successDescription"),
        });
        handleClose();
      } else {
        if (result.error === "Current password is incorrect") {
          setErrors({ currentPassword: t("incorrectCurrentPassword") });
        } else {
          toast.error(t("errorTitle"), {
            description: result.error || t("errorDescription"),
          });
        }
      }
    } catch (error) {
      toast.error(t("errorTitle"), {
        description: error instanceof Error ? error.message : t("errorDescription"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => onOpenChange({ open: nextOpen })}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Current Password */}
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <Label
              htmlFor="currentPassword"
              className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("currentPassword")}
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, currentPassword: undefined }));
                }}
                placeholder={t("currentPasswordPlaceholder")}
                className="h-10 sm:h-11 pr-10 text-sm bg-white dark:bg-[#161b22] border-gray-300 dark:border-white/10 text-gray-900 dark:text-white"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <Label
              htmlFor="newPassword"
              className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("newPassword")}
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, newPassword: undefined }));
                }}
                placeholder={t("newPasswordPlaceholder")}
                className="h-10 sm:h-11 pr-10 text-sm bg-white dark:bg-[#161b22] border-gray-300 dark:border-white/10 text-gray-900 dark:text-white"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <Label
              htmlFor="confirmPassword"
              className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("confirmPassword")}
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                placeholder={t("confirmPasswordPlaceholder")}
                className="h-10 sm:h-11 pr-10 text-sm bg-white dark:bg-[#161b22] border-gray-300 dark:border-white/10 text-gray-900 dark:text-white"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-[#161b22] dark:text-white dark:hover:bg-white/5"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-[#429de6] text-white hover:bg-[#3a8dd6] dark:bg-[#429de6] dark:hover:bg-[#3a8dd6]"
            >
              {isSubmitting ? t("changing") : t("changePassword")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
