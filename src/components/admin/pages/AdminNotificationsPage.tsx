"use client";

import { useState, useEffect } from "react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { CreateNotificationModal } from "@/components/admin/modals/CreateNotificationModal";
import { NotificationReadUsersModal } from "@/components/admin/modals/NotificationReadUsersModal";
import { ViewNotificationModal } from "@/components/admin/modals/ViewNotificationModal";
import { ConfirmDialog } from "@/components/admin/primitives/ConfirmDialog";
import { NotificationsView } from "@/components/admin/views/NotificationsView";
import type { Notification } from "@/lib/admin/notifications/types";
import { useAdminNotificationsState } from "@/hooks/admin/useAdminNotificationsState";
import { useConfirmDialog } from "@/hooks/admin/useConfirmDialog";
import { useUser } from "@/contexts/UserContext";
import { deleteNotification } from "@/lib/admin/notifications/deleteNotification";
import { markNotificationAsRead } from "@/lib/admin/notifications/markNotificationAsRead";
import { notificationEvents } from "@/lib/admin/notifications/notificationEvents";

export const AdminNotificationsPage = () => {
  const tDelete = useTranslations("admin.modals.deleteNotification");
  const tMarkAsRead = useTranslations("admin.modals.markAsRead");
  const state = useAdminNotificationsState();
  const { user, isAdmin } = useUser();
  const [notificationToView, setNotificationToView] = useState<Notification | null>(null);
  const [isViewNotificationModalOpen, setIsViewNotificationModalOpen] = useState(false);
  const deleteConfirm = useConfirmDialog<Notification>();
  const [isDeletingNotification, setIsDeletingNotification] = useState(false);
  const [notificationForReadUsers, setNotificationForReadUsers] = useState<Notification | null>(null);
  const [isReadUsersModalOpen, setIsReadUsersModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      state.loadNotifications({ isAdmin });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin]);

  // Listen for notification changes from popup
  useEffect(() => {
    const unsubscribe = notificationEvents.subscribe(() => {
      if (user) {
        state.loadNotifications({ forceRefresh: true, isAdmin });
      }
    });
    
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin]);

  const handleViewNotificationClick = (notification: Notification) => {
    setNotificationToView(notification);
    setIsViewNotificationModalOpen(true);
  };

  const handleMarkAsReadClick = async (notification: Notification) => {
    if (!notification || notification.isRead) return;
    
    const idToUse = notification.id;
    
    state.updateNotificationInState(notification.id, { isRead: true });
    
    setNotificationToView({ ...notification, isRead: true });
    
    try {
      const result = await markNotificationAsRead({ notificationId: idToUse });
      
      if (result.success) {
        toast.success(tMarkAsRead("success"));
        // Invalidate cache and reload to get server state
        state.invalidateCache();
        await state.loadNotifications({ forceRefresh: true, isAdmin });
        
        // Close modal after successful update
        setIsViewNotificationModalOpen(false);
      } else {
        toast.error(tMarkAsRead("error"), {
          description: result.error,
        });
        // Revert optimistic update on error
        state.updateNotificationInState(notification.id, { isRead: false });
        setNotificationToView({ ...notification, isRead: false });
      }
    } catch (error) {
      toast.error(tMarkAsRead("error"), {
        description: error instanceof Error ? error.message : tMarkAsRead("errorDescription"),
      });
      // Revert optimistic update on error
      state.updateNotificationInState(notification.id, { isRead: false });
      setNotificationToView({ ...notification, isRead: false });
    }
  };

  const handleViewReadUsersClick = (notification: Notification) => {
    setNotificationForReadUsers(notification);
    setIsReadUsersModalOpen(true);
  };

  const handleConfirmDeleteNotification = async () => {
    const notificationToDelete = deleteConfirm.target;
    if (!notificationToDelete) return;

    setIsDeletingNotification(true);
    try {
      const result = await deleteNotification({ id: notificationToDelete.id });

      if (result.success) {
        toast.success(tDelete("success"), {
          description: tDelete("successDescription"),
        });
        // Invalidate cache and reload
        state.invalidateCache();
        await state.loadNotifications({ forceRefresh: true, isAdmin });
        deleteConfirm.close();
      } else {
        toast.error(tDelete("error"), {
          description: result.error || tDelete("errorDescription"),
        });
      }
    } catch (error) {
      toast.error(tDelete("error"), {
        description: error instanceof Error ? error.message : tDelete("errorDescription"),
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
        onDeleteNotification={isAdmin ? deleteConfirm.open : undefined}
        onViewReadUsers={isAdmin ? handleViewReadUsersClick : undefined}
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
          <NotificationReadUsersModal
            open={isReadUsersModalOpen}
            onOpenChange={setIsReadUsersModalOpen}
            notificationId={notificationForReadUsers?.id || null}
            notificationMessage={notificationForReadUsers?.message}
          />

          <CreateNotificationModal
            open={state.isCreateNotificationOpen}
            onOpenChange={({ open }) =>
              open ? state.openCreateNotification() : state.closeCreateNotification()
            }
            onNotificationCreated={() => {
              state.invalidateCache();
              state.loadNotifications({ forceRefresh: true, isAdmin });
            }}
          />

          <ConfirmDialog
            open={deleteConfirm.isOpen}
            onOpenChange={(next) => !next && deleteConfirm.close()}
            title={tDelete("title")}
            description={tDelete("description")}
            confirmLabel={tDelete("confirm")}
            loadingLabel={tDelete("deleting")}
            cancelLabel={tDelete("cancel")}
            variant="destructive"
            isLoading={isDeletingNotification}
            onConfirm={handleConfirmDeleteNotification}
          />
        </>
      )}
    </>
  );
};
