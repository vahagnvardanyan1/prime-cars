"use client";

import { useState, useEffect } from "react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { CreateNotificationModal } from "@/components/admin/modals/CreateNotificationModal";
import { ViewNotificationModal } from "@/components/admin/modals/ViewNotificationModal";
import { NotificationsView } from "@/components/admin/views/NotificationsView";
import type { Notification } from "@/lib/admin/notifications/types";
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
import { useAdminNotificationsState } from "@/hooks/admin/useAdminNotificationsState";
import { useUser } from "@/contexts/UserContext";
import { deleteNotification } from "@/lib/admin/notifications/deleteNotification";
import { markNotificationAsRead } from "@/lib/admin/notifications/markNotificationAsRead";

export const AdminNotificationsPage = () => {
  const t = useTranslations("admin.modals.deleteNotification");
  const state = useAdminNotificationsState();
  const { user, isAdmin } = useUser();
  const [notificationToView, setNotificationToView] = useState<Notification | null>(null);
  const [isViewNotificationModalOpen, setIsViewNotificationModalOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);
  const [isDeleteNotificationDialogOpen, setIsDeleteNotificationDialogOpen] = useState(false);
  const [isDeletingNotification, setIsDeletingNotification] = useState(false);

  useEffect(() => {
    if (user) {
      state.loadNotifications({ isAdmin });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin]);

  const handleViewNotificationClick = (notification: Notification) => {
    setNotificationToView(notification);
    setIsViewNotificationModalOpen(true);
  };

  const handleMarkAsReadClick = async (notification: Notification) => {
    if (!notification || notification.isRead) return;
    
    // Use notification ID (notification._id) for mark-as-read
    const idToUse = notification.id;
    try {
      const result = await markNotificationAsRead({ notificationId: idToUse });
      
      if (result.success) {
        toast.success("Notification marked as read");
        await state.loadNotifications({ forceRefresh: true, isAdmin });
        setIsViewNotificationModalOpen(false);
      } else {
        toast.error("Failed to mark as read", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Failed to mark as read", {
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  const handleDeleteNotificationClick = (notification: Notification) => {
    setNotificationToDelete(notification);
    setIsDeleteNotificationDialogOpen(true);
  };

  const handleConfirmDeleteNotification = async () => {
    if (!notificationToDelete) return;

    setIsDeletingNotification(true);
    try {
      const result = await deleteNotification({ id: notificationToDelete.id });

      if (result.success) {
        toast.success(t("success"), {
          description: t("successDescription"),
        });
        await state.loadNotifications({ forceRefresh: true, isAdmin });
        setIsDeleteNotificationDialogOpen(false);
        setNotificationToDelete(null);
      } else {
        toast.error(t("error"), {
          description: result.error || t("errorDescription"),
        });
      }
    } catch (error) {
      toast.error(t("error"), {
        description: error instanceof Error ? error.message : t("errorDescription"),
      });
    } finally {
      setIsDeletingNotification(false);
    }
  };

  return (
    <>
      <NotificationsView
        notifications={state.notifications}
        isLoading={state.isLoadingNotifications}
        onRefresh={() => state.loadNotifications({ forceRefresh: true, isAdmin })}
        onCreateNotification={isAdmin ? state.openCreateNotification : undefined}
        onViewNotification={handleViewNotificationClick}
        onDeleteNotification={isAdmin ? handleDeleteNotificationClick : undefined}
        isAdmin={isAdmin}
      />

      <ViewNotificationModal
        open={isViewNotificationModalOpen}
        notification={notificationToView}
        onOpenChange={({ open }) => setIsViewNotificationModalOpen(open)}
        onMarkAsRead={!isAdmin ? handleMarkAsReadClick : undefined}
        canMarkAsRead={!isAdmin}
      />

      {isAdmin && (
        <>
          <CreateNotificationModal
            open={state.isCreateNotificationOpen}
            onOpenChange={({ open }) =>
              open ? state.openCreateNotification() : state.closeCreateNotification()
            }
            onNotificationCreated={() => state.loadNotifications({ forceRefresh: true, isAdmin })}
          />

          <AlertDialog open={isDeleteNotificationDialogOpen} onOpenChange={setIsDeleteNotificationDialogOpen}>
            <AlertDialogContent className="bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-gray-900 dark:text-white">
                  {t("title")}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                  {t("description")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel 
                  disabled={isDeletingNotification}
                  className="border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-[#161b22] dark:text-white dark:hover:bg-white/5"
                >
                  {t("cancel")}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmDeleteNotification}
                  disabled={isDeletingNotification}
                  className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                >
                  {isDeletingNotification ? t("deleting") : t("confirm")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </>
  );
};
