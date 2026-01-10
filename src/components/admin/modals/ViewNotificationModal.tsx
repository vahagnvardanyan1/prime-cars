"use client";

import { Bell, Calendar, CheckCircle2, Circle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Notification } from "@/lib/admin/notifications/types";

type ViewNotificationModalProps = {
  open: boolean;
  notification: Notification | null;
  onOpenChange: ({ open }: { open: boolean }) => void;
  onMarkAsRead?: (notification: Notification) => void;
  canMarkAsRead?: boolean;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const ViewNotificationModal = ({
  open,
  notification,
  onOpenChange,
  onMarkAsRead,
  canMarkAsRead = false,
}: ViewNotificationModalProps) => {
  const t = useTranslations("admin.notifications");

  if (!notification) return null;

  const handleMarkAsRead = () => {
    if (onMarkAsRead && notification) {
      onMarkAsRead(notification);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => onOpenChange({ open: nextOpen })}>
      <DialogContent className="max-w-3xl bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center ${
              notification.isRead 
                ? 'bg-gray-100 dark:bg-gray-800' 
                : 'bg-[#429de6]/10 dark:bg-[#429de6]/20'
            }`}>
              <Bell className={`h-7 w-7 ${
                notification.isRead 
                  ? 'text-gray-400 dark:text-gray-500' 
                  : 'text-[#429de6]'
              }`} />
            </div>
            <div className="flex-1 pt-1">
              <div className="flex items-start justify-between gap-4">
                <DialogTitle className="text-2xl font-semibold text-gray-900 dark:text-white pr-4">
                  {notification.message}
                </DialogTitle>
                {notification.isRead ? (
                  <span className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Read
                  </span>
                ) : (
                  <span className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#429de6]/10 dark:bg-[#429de6]/20 text-xs font-medium text-[#429de6]">
                    <Circle className="h-3.5 w-3.5 fill-current" />
                    Unread
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <time>{formatDate(notification.createdAt)}</time>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
              {t("description")}
            </h3>
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {notification.description}
            </p>
          </div>

          {notification.reason && notification.reason.trim() && (
            <div className="border-t border-gray-200 dark:border-white/10 pt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                {t("reason")}
              </h3>
              <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {notification.reason}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200 dark:border-white/10">
          <div>
            {canMarkAsRead && !notification.isRead && onMarkAsRead && (
              <Button
                type="button"
                onClick={handleMarkAsRead}
                className="bg-[#429de6] text-white hover:bg-[#3a8dd6] dark:bg-[#429de6] dark:hover:bg-[#3a8dd6]"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {t("markAsRead")}
              </Button>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange({ open: false })}
            className="border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-[#161b22] dark:text-white dark:hover:bg-white/5"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
