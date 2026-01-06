"use client";

import { useState, useEffect } from "react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { CreateUserModal } from "@/components/admin/modals/CreateUserModal";
import { UpdateUserModal } from "@/components/admin/modals/UpdateUserModal";
import { UsersView } from "@/components/admin/views/UsersView";
import type { AdminUser } from "@/lib/admin/types";
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
import { useAdminUsersState } from "@/hooks/admin/useAdminUsersState";
import { useUser } from "@/contexts/UserContext";
import { deleteUser } from "@/lib/admin/deleteUser";

export const AdminUsersPage = () => {
  const t = useTranslations("admin.modals.deleteUser");
  const state = useAdminUsersState();
  const { user, isAdmin } = useUser();
  const [selectedUserForUpdate, setSelectedUserForUpdate] = useState<AdminUser | null>(null);
  const [isUpdateUserModalOpen, setIsUpdateUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  useEffect(() => {
    if (user) {
      state.loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleDeleteUserClick = (user: AdminUser) => {
    setUserToDelete(user);
    setIsDeleteUserDialogOpen(true);
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeletingUser(true);
    try {
      const result = await deleteUser({ id: userToDelete.id });

      if (result.success) {
        toast.success(t("success"), {
          description: t("successDescription", { username: userToDelete.username }),
        });
        await state.loadUsers({ forceRefresh: true });
        setIsDeleteUserDialogOpen(false);
        setUserToDelete(null);
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
      setIsDeletingUser(false);
    }
  };

  return (
    <>
      <UsersView
        users={state.users}
        isLoading={state.isLoadingUsers}
        onRefresh={() => state.loadUsers({ forceRefresh: true })}
        onCreateUser={state.openCreateUser}
        onUpdateUser={(user) => {
          setSelectedUserForUpdate(user);
          setIsUpdateUserModalOpen(true);
        }}
        onDeleteUser={handleDeleteUserClick}
        isAdmin={isAdmin}
      />

      {isAdmin && (
        <>
          <CreateUserModal
            open={state.isCreateUserOpen}
            onOpenChange={({ open }) =>
              open ? state.openCreateUser() : state.closeCreateUser()
            }
            onUserCreated={() => state.loadUsers({ forceRefresh: true })}
          />

          <UpdateUserModal
            open={isUpdateUserModalOpen}
            user={selectedUserForUpdate}
            onOpenChange={({ open }) => setIsUpdateUserModalOpen(open)}
            onUserUpdated={() => state.loadUsers({ forceRefresh: true })}
          />

          <AlertDialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
            <AlertDialogContent className="bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-gray-900 dark:text-white">
                  {t("title")}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                  {t("description", { 
                    firstName: userToDelete?.firstName, 
                    lastName: userToDelete?.lastName 
                  })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel 
                  disabled={isDeletingUser}
                  className="border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-[#161b22] dark:text-white dark:hover:bg-white/5"
                >
                  {t("cancel")}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmDeleteUser}
                  disabled={isDeletingUser}
                  className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                >
                  {isDeletingUser ? t("deleting") : t("confirm")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </>
  );
};

