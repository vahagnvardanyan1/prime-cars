"use client";

import { useState, useMemo } from "react";
import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { AdminUser } from "@/lib/admin/types";
import { Auction } from "@/lib/admin/types";

type UserCoefficientRowProps = {
  user: AdminUser;
  onUpdateCoefficient: ({ userId, coefficient, category }: { userId: string; coefficient: number; category?: Auction }) => Promise<void>;
};

export const UserCoefficientRow = ({ user, onUpdateCoefficient }: UserCoefficientRowProps) => {
  const t = useTranslations("admin.settingsView");
  const [coefficient, setCoefficient] = useState(user.coefficient?.toString() || "");
  const [auction, setAuction] = useState<Auction | "none">(user.category || "none");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const hasChanged = useMemo(() => {
    const currentCoefficientValue = user.coefficient?.toString() || "";
    const currentAuctionValue = user.category || "none";
    return coefficient !== currentCoefficientValue || auction !== currentAuctionValue;
  }, [coefficient, auction, user.coefficient, user.category]);

  const canApply = useMemo(() => {
    if (!hasChanged) return false;
    // Allow apply if auction changed (even if coefficient didn't)
    const auctionChanged = auction !== (user.category || "none");
    if (auctionChanged && coefficient.trim() !== "") {
      const num = Number(coefficient);
      return Number.isFinite(num) && num >= 0;
    }
    if (auctionChanged && user.coefficient !== undefined) {
      return true; // Auction changed but coefficient exists from before
    }
    // Coefficient changed
    if (coefficient.trim() === "") return false;
    const num = Number(coefficient);
    return Number.isFinite(num) && num >= 0;
  }, [hasChanged, coefficient, auction, user.category, user.coefficient]);

  const handleCoefficientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value === "") {
      setCoefficient("");
      return;
    }
    
    // Allow only whole numbers
    if (/^\d*$/.test(value)) {
      setCoefficient(value);
    }
  };

  const handleApplyClick = () => {
    if (!canApply || isUpdating) return;
    setShowConfirmDialog(true);
  };

  const handleConfirmApply = async () => {
    setShowConfirmDialog(false);
    setIsUpdating(true);
    try {
      const coefficientValue = coefficient.trim() ? Number(coefficient) : user.coefficient || 0;
      await onUpdateCoefficient({ 
        userId: user.id, 
        coefficient: coefficientValue,
        category: auction === "none" ? undefined : auction
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setCoefficient(user.coefficient?.toString() || "");
    setAuction(user.category || "none");
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {user.companyName || `${user.firstName} ${user.lastName}`}
            {user.coefficient !== undefined && !hasChanged && (
              <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                ({t("currentCoefficient")}: {user.coefficient})
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="truncate">{user.username}</span>
            {user.category && (
              <>
                <span className="text-gray-400 dark:text-gray-600">•</span>
                <span className="px-2 py-0.5 rounded-md bg-[#429de6]/10 text-[#429de6] dark:bg-[#429de6]/20 dark:text-[#429de6] font-medium uppercase text-xs whitespace-nowrap">
                  {user.category}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Coefficient & Auction Inputs & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            type="text"
            value={coefficient}
            onChange={handleCoefficientChange}
            placeholder="100"
            disabled={isUpdating}
            className="w-24 h-9 text-center bg-white dark:bg-[#161b22] border-gray-300 dark:border-white/10 text-gray-900 dark:text-white"
          />

          <Select value={auction} onValueChange={(value) => setAuction(value as Auction | "none")} disabled={isUpdating}>
            <SelectTrigger className="w-[120px] h-9 bg-white dark:bg-[#161b22] border-gray-300 dark:border-white/10 text-gray-900 dark:text-white">
              <SelectValue placeholder={t("auctionPlaceholder")} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10">
              <SelectItem value="none">{t("auctionNone")}</SelectItem>
              <SelectItem value={Auction.IAAI}>IAAI</SelectItem>
              <SelectItem value={Auction.COPART}>COPART</SelectItem>
              <SelectItem value={Auction.MANHEIM}>MANHEIM</SelectItem>
              <SelectItem value={Auction.OTHER}>OTHER</SelectItem>
            </SelectContent>
          </Select>

          {hasChanged && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isUpdating}
                className="h-9 px-3 rounded-lg border-gray-300 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5"
              >
                {t("cancelButton")}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleApplyClick}
                disabled={!canApply || isUpdating}
                className="h-9 px-4 rounded-lg bg-[#429de6] hover:bg-[#3a8acc] dark:bg-[#429de6] dark:hover:bg-[#3a8acc] text-white"
              >
                {isUpdating ? (
                  <div className="flex items-center gap-1.5">
                    <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : (
                  t("applyButton")
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl bg-white dark:bg-[#0b0f14] border border-gray-200 dark:border-white/10 p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {t("coefficientDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2 space-y-2">
              <p>
                {t("coefficientDialog.description")} <strong className="text-gray-900 dark:text-white">{user.firstName} {user.lastName}</strong>?
              </p>
              {coefficient && coefficient !== (user.coefficient?.toString() || "") && (
                <p>
                  • {t("coefficientDialog.coefficientChange")}: <strong className="text-gray-900 dark:text-white">{coefficient}</strong>
                </p>
              )}
              {auction !== (user.category || "none") && (
                <p>
                  • {t("coefficientDialog.auctionChange")}: <strong className="text-gray-900 dark:text-white uppercase">{auction === "none" ? t("auctionNone") : auction}</strong>
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3 mt-6">
            <AlertDialogCancel className="rounded-xl w-full sm:w-auto border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5">
              {t("coefficientDialog.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl w-full sm:w-auto bg-[#429de6] text-white hover:bg-[#3a8acc] dark:bg-[#429de6] dark:hover:bg-[#3a8acc]"
              onClick={handleConfirmApply}
            >
              {t("coefficientDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
