"use client";

import { useState, useEffect } from "react";

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
        toast.success("User deleted", {
          description: `${userToDelete.username} has been removed.`,
        });
        await state.loadUsers({ forceRefresh: true });
        setIsDeleteUserDialogOpen(false);
        setUserToDelete(null);
      } else {
        toast.error("Failed to delete user", {
          description: result.error || "Could not delete the user.",
        });
      }
    } catch (error) {
      toast.error("Failed to delete user", {
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
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
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete User</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">{userToDelete?.username}</span>
                  ? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeletingUser}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmDeleteUser}
                  disabled={isDeletingUser}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeletingUser ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </>
  );
};

