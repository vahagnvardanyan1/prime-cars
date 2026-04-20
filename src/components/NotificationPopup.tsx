"use client";

import { useState, useEffect } from "react";

import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Notification } from "@/lib/admin/notifications/types";
import { markNotificationAsRead } from "@/lib/admin/notifications/markNotificationAsRead";
import { fetchNotifications } from "@/lib/admin/notifications/fetchNotifications";
import { clearNotificationsCache } from "@/hooks/admin/useAdminNotificationsState";
import { notificationEvents } from "@/lib/admin/notifications/notificationEvents";

type NotificationPopupProps = {
  userId?: string;
};

export const NotificationPopup = ({ userId }: NotificationPopupProps) => {
  const t = useTranslations("admin.notifications");
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUnreadNotifications = async () => {
      if (!userId) return;

      setIsLoading(true);
      try {
        const result = await fetchNotifications();
        
        if (result.success && result.notifications && result.notifications.length > 0) {
          // Filter unread notifications on client side
          const unread = result.notifications.filter(n => !n.isRead);
          if (unread.length > 0) {
            setUnreadNotifications(unread);
            setCurrentNotification(unread[0]);
            setIsOpen(true);
          }
        }
      } catch (error) {
        console.error("Error loading unread notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUnreadNotifications();
  }, [userId]);

  const handleMarkAsRead = async () => {
    if (!currentNotification) return;

    // Save current notification ID before state updates
    const notificationId = currentNotification.id;
    
    // Optimistic update - immediately remove from UI
    const remainingNotifications = unreadNotifications.filter(
      (n) => n.id !== notificationId
    );
    
    console.log('[NotificationPopup] Marking as read:', notificationId);
    console.log('[NotificationPopup] Remaining:', remainingNotifications.length);
    
    if (remainingNotifications.length > 0) {
      setUnreadNotifications(remainingNotifications);
      setCurrentNotification(remainingNotifications[0]);
    } else {
      setUnreadNotifications([]);
      setCurrentNotification(null);
      setIsOpen(false);
    }

    // Make API call in background
    try {
      await markNotificationAsRead({ notificationId });
      console.log('[NotificationPopup] Successfully marked as read');
      
      // Clear the admin notifications cache so it refreshes when viewing the list
      clearNotificationsCache();
      
      // Notify other components to reload notifications
      notificationEvents.emit();
    } catch (error) {
      console.error("[NotificationPopup] Error marking notification as read:", error);
    }
  };

  const handleLater = () => {
    // Remove current notification from unread list and show next one
    const remainingNotifications = unreadNotifications.filter(
      (n) => n.id !== currentNotification?.id
    );
    
    if (remainingNotifications.length > 0) {
      setUnreadNotifications(remainingNotifications);
      setCurrentNotification(remainingNotifications[0]);
      // Keep modal open with next notification
    } else {
      setUnreadNotifications([]);
      setCurrentNotification(null);
      setIsOpen(false);
    }
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      // When dialog is closed (X icon, outside click, or Escape key)
      // Show next notification if available
      handleLater();
    } else {
      setIsOpen(open);
    }
  };

  if (isLoading || !currentNotification) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent key={currentNotification.id} className="w-[90vw] max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start gap-3 sm:gap-4">
            <div aria-hidden="true" className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#429de6]/10 dark:bg-[#429de6]/20 flex items-center justify-center">
              <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-[#429de6]" />
            </div>
            <div className="flex-1 pt-0.5 sm:pt-1">
              <DialogTitle className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white leading-tight break-words">
                {currentNotification.message}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-4 sm:space-y-6 mt-4 sm:mt-6 pr-2">
          <div>
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">
              {t("description")}
            </h3>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
              {currentNotification.description}
            </p>
          </div>

          {currentNotification.reason && currentNotification.reason.trim() && (
            <div>
              <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">
                {t("reason")}
              </h3>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                {currentNotification.reason}
              </p>
            </div>
          )}

          {unreadNotifications.length > 1 && (
            <div className="pt-3 sm:pt-4 border-t border-gray-200 dark:border-white/10">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Bell aria-hidden="true" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="tabular-nums">
                  {unreadNotifications.length - 1} more notification{unreadNotifications.length - 1 !== 1 ? 's' : ''} waiting
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 flex justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-200 dark:border-white/10">
          <Button
            type="button"
            variant="outline"
            onClick={handleLater}
            className="text-sm sm:text-base border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-[#161b22] dark:text-white dark:hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#429de6] focus-visible:ring-offset-2"
          >
            {t("later")}
          </Button>
          <Button
            type="button"
            onClick={handleMarkAsRead}
            className="text-sm sm:text-base bg-[#429de6] text-white hover:bg-[#3a8dd6] dark:bg-[#429de6] dark:hover:bg-[#3a8dd6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#429de6] focus-visible:ring-offset-2"
          >
            {t("markAsRead")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
