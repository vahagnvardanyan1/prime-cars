"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import type { AdminUser, IncomeTaxBracket } from "@/lib/admin/types";
import { fetchUserIncomeTax } from "@/lib/admin/fetchUserIncomeTax";
import { updateUserIncomeTax } from "@/lib/admin/updateUserIncomeTax";
import { IncomeTaxBracketRow } from "./IncomeTaxBracketRow";

type UserIncomeTaxRowProps = {
  user: AdminUser;
};

export const UserIncomeTaxRow = ({ user }: UserIncomeTaxRowProps) => {
  const t = useTranslations("admin.settingsView");
  const [isExpanded, setIsExpanded] = useState(false);
  const [brackets, setBrackets] = useState<IncomeTaxBracket[]>([]);
  const [originalBrackets, setOriginalBrackets] = useState<IncomeTaxBracket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const hasChanged = useMemo(() => {
    return JSON.stringify(brackets) !== JSON.stringify(originalBrackets);
  }, [brackets, originalBrackets]);

  const handleToggleExpand = async () => {
    const nextExpanded = !isExpanded;
    setIsExpanded(nextExpanded);

    if (nextExpanded && !hasFetched) {
      setIsLoading(true);
      try {
        const result = await fetchUserIncomeTax({ userId: user.id });
        if (result.success) {
          setBrackets(result.incomeTaxBrackets);
          setOriginalBrackets(result.incomeTaxBrackets);
        } else {
          toast.error(t("incomeTaxLoadError"), { description: result.error });
        }
      } catch {
        toast.error(t("incomeTaxLoadError"));
      } finally {
        setIsLoading(false);
        setHasFetched(true);
      }
    }
  };

  const handleBracketChange = (index: number, updated: IncomeTaxBracket) => {
    setBrackets((prev) => prev.map((b, i) => (i === index ? updated : b)));
  };

  const handleBracketRemove = (index: number) => {
    setBrackets((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddBracket = () => {
    const lastBracket = brackets[brackets.length - 1];
    const newMin = lastBracket ? (lastBracket.max ?? lastBracket.min) + 1 : 0;
    setBrackets((prev) => [
      ...prev,
      { min: newMin, max: null, tax: 0, isPercent: false },
    ]);
  };

  const handleCancel = () => {
    setBrackets([...originalBrackets]);
  };

  const handleSaveClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirmDialog(false);
    setIsSaving(true);
    try {
      const result = await updateUserIncomeTax({
        userId: user.id,
        incomeTaxBrackets: brackets,
      });
      if (result.success) {
        toast.success(t("incomeTaxSaveSuccess"));
        setOriginalBrackets(result.incomeTaxBrackets);
        setBrackets(result.incomeTaxBrackets);
      } else {
        toast.error(t("incomeTaxSaveError"), { description: result.error });
      }
    } catch {
      toast.error(t("incomeTaxSaveError"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Collapsed header */}
      <button
        type="button"
        onClick={handleToggleExpand}
        className="w-full flex items-center gap-3 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {user.companyName || `${user.firstName} ${user.lastName}`}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="truncate">{user.username}</span>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-4 space-y-3">
          {isLoading ? (
            <div className="py-6 flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-[#429de6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t("incomeTaxLoading")}
              </span>
            </div>
          ) : (
            <>
              {/* Bracket table */}
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    <th className="text-left pb-1 pr-0.5 font-medium">Min</th>
                    <th className="text-left pb-1 px-0.5 font-medium">Max</th>
                    <th className="text-left pb-1 px-0.5 font-medium">Tax</th>
                    <th className="text-left pb-1 px-0.5 w-10 font-medium">$/%</th>
                    <th className="pb-1 pl-0.5 w-6"></th>
                  </tr>
                </thead>
                <tbody>
                  {brackets.map((bracket, index) => (
                    <IncomeTaxBracketRow
                      key={index}
                      bracket={bracket}
                      index={index}
                      onChange={handleBracketChange}
                      onRemove={handleBracketRemove}
                    />
                  ))}
                </tbody>
              </table>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 flex-wrap pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddBracket}
                  className="h-6 px-2 rounded border-gray-300 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-[11px]"
                >
                  <Plus className="h-3 w-3 mr-0.5" />
                  {t("incomeTaxAddBracket")}
                </Button>
                {hasChanged && (
                  <>
                    <div className="flex-1" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="h-6 px-2 rounded border-gray-300 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-[11px]"
                    >
                      {t("incomeTaxCancel")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSaveClick}
                      disabled={isSaving}
                      className="h-6 px-3 rounded bg-[#429de6] hover:bg-[#3a8acc] dark:bg-[#429de6] dark:hover:bg-[#3a8acc] text-white text-[11px]"
                    >
                      {isSaving ? (
                        <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        t("incomeTaxSave")
                      )}
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl bg-white dark:bg-[#0b0f14] border border-gray-200 dark:border-white/10 p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {t("incomeTaxConfirmDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2 space-y-2">
              <p>
                {t("incomeTaxConfirmDialog.description")}{" "}
                <strong className="text-gray-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </strong>
                ?
              </p>
              <p>
                {t("incomeTaxConfirmDialog.bracketCount", { count: brackets.length })}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3 mt-6">
            <AlertDialogCancel className="rounded-xl w-full sm:w-auto border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5">
              {t("incomeTaxConfirmDialog.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl w-full sm:w-auto bg-[#429de6] text-white hover:bg-[#3a8acc] dark:bg-[#429de6] dark:hover:bg-[#3a8acc]"
              onClick={handleConfirmSave}
            >
              {t("incomeTaxConfirmDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
