"use client";

import { useState, useEffect } from "react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { CreateUserModal } from "@/components/admin/modals/CreateUserModal";
import { UpdateUserModal } from "@/components/admin/modals/UpdateUserModal";
import { ConfirmDialog } from "@/components/admin/primitives/ConfirmDialog";
import { UsersView } from "@/components/admin/views/UsersView";
import type { AdminUser } from "@/lib/admin/types";
import { useAdminUsersState } from "@/hooks/admin/useAdminUsersState";
import { useConfirmDialog } from "@/hooks/admin/useConfirmDialog";
import { useUser } from "@/contexts/UserContext";
import { deleteUser } from "@/lib/admin/deleteUser";

export const AdminUsersPage = () => {
  const t = useTranslations("admin.modals.deleteUser");
  const { user, isAdmin } = useUser();
  const state = useAdminUsersState({ isAdmin });
  const [selectedUserForUpdate, setSelectedUserForUpdate] = useState<AdminUser | null>(null);
  const [isUpdateUserModalOpen, setIsUpdateUserModalOpen] = useState(false);
  const deleteConfirm = useConfirmDialog<AdminUser>();
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  useEffect(() => {
    if (user) {
      state.loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleConfirmDeleteUser = async () => {
    const userToDelete = deleteConfirm.target;
    if (!userToDelete) return;

    setIsDeletingUser(true);
    try {
      const result = await deleteUser({ id: userToDelete.id });

      if (result.success) {
        toast.success(t("success"), {
          description: t("successDescription", { username: userToDelete.username }),
        });
        await state.loadUsers({ forceRefresh: true });
        deleteConfirm.close();
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
        onDeleteUser={deleteConfirm.open}
        isAdmin={isAdmin}
        filters={state.filters}
        onFiltersChange={state.updateFilters}
        onClearFilters={state.clearFilters}
        currentPage={state.currentPage}
        totalPages={state.totalPages}
        pageSize={state.pageSize}
        totalItems={state.totalItems}
        onPageChange={state.changePage}
        onPageSizeChange={state.changePageSize}
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

          <ConfirmDialog
            open={deleteConfirm.isOpen}
            onOpenChange={(next) => !next && deleteConfirm.close()}
            title={t("title")}
            description={t("description", {
              firstName: deleteConfirm.target?.firstName || "",
              lastName: deleteConfirm.target?.lastName || "",
            })}
            confirmLabel={t("confirm")}
            loadingLabel={t("deleting")}
            cancelLabel={t("cancel")}
            variant="destructive"
            isLoading={isDeletingUser}
            onConfirm={handleConfirmDeleteUser}
          />
        </>
      )}
    </>
  );
};

