"use client";

import { useEffect, useState } from "react";

import { CheckCheck, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ReadUser } from "@/lib/admin/notifications/fetchReadUsers";
import { fetchReadUsers } from "@/lib/admin/notifications/fetchReadUsers";

type NotificationReadUsersModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notificationId: number | string | null;
  notificationMessage?: string;
};

const formatReadTime = ({ dateString }: { dateString: string }) => {
  const date = new Date(dateString);
  
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${month}.${day}.${year} ${hours}:${minutes}`;
};

export const NotificationReadUsersModal = ({
  open,
  onOpenChange,
  notificationId,
  notificationMessage,
}: NotificationReadUsersModalProps) => {
  const t = useTranslations("admin.modals.readUsers");

  const [readUsers, setReadUsers] = useState<ReadUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && notificationId) {
      loadReadUsers();
    }
  }, [open, notificationId]);

  const loadReadUsers = async () => {
    if (!notificationId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchReadUsers({ notificationId });

      if (result.success && result.data) {
        setReadUsers(result.data);
      } else {
        setError(result.error || "Failed to load read users");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load read users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after close animation
    setTimeout(() => {
      setReadUsers([]);
      setError(null);
    }, 200);
  };

  const getInitials = ({ firstName, lastName }: { firstName: string; lastName: string }) => {
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <CheckCheck className="h-5 w-5 text-[#429de6]" />
                {t("title")}
              </DialogTitle>
              {notificationMessage && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                  {notificationMessage}
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#429de6] border-r-transparent"></div>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{t("loading")}</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          ) : readUsers.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <CheckCheck className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400">{t("noReads")}</p>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-1">
                {readUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-[#429de6] to-[#3a8acc] text-white text-sm font-medium">
                        {getInitials({ firstName: user.firstName, lastName: user.lastName })}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                      {user.companyName && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-0.5">
                          {user.companyName}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatReadTime({ dateString: user.readAt })}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <CheckCheck className="h-3.5 w-3.5 text-[#429de6]" />
                        <span className="text-xs text-[#429de6]">{t("read")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {readUsers.length > 0 && (
          <div className="flex-shrink-0 pt-3 border-t border-gray-200 dark:border-white/10">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              {t("totalReads", { count: readUsers.length })}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
