"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Plus, Search, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateUserModalFormik } from "@/components/admin/modals/CreateUserModalFormik";
import { ProtectedComponent } from "@/components/rbac/ProtectedComponent";
import { Permission } from "@/lib/rbac/permissions";
import { useUsers, useDeleteUser } from "@/lib/react-query/hooks";

export const AdminUsersPageRefactored = () => {
  const t = useTranslations();
  const [search, setSearch] = useState("");
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Use React Query hooks
  const { data, isLoading, error, refetch } = useUsers({ search });
  const deleteUserMutation = useDeleteUser();

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <ProtectedComponent permission={Permission.CREATE_USER}>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#429de6] hover:bg-[#3a8acc] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </ProtectedComponent>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t("admin.usersView.searchPlaceholder")}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#429de6]" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-600 dark:text-red-400">
            Failed to load users. Please try again.
          </p>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Users List */}
      {data && !isLoading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer ID
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  data.users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {user.customerId || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <ProtectedComponent permission={Permission.EDIT_USER}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                          >
                            Edit
                          </Button>
                        </ProtectedComponent>
                        <ProtectedComponent permission={Permission.DELETE_USER}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={deleteUserMutation.isPending}
                            className="text-gray-600 hover:text-gray-700 dark:text-gray-400"
                          >
                            {deleteUserMutation.isPending ? t("admin.usersView.deleting") : t("admin.modals.deleteUser.confirm")}
                          </Button>
                        </ProtectedComponent>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Info */}
          {data.total > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {data.users.length} of {data.total} users
              </p>
            </div>
          )}
        </div>
      )}

      {/* Create User Modal */}
      <CreateUserModalFormik
        open={isCreateModalOpen}
        onOpenChange={({ open }) => setIsCreateModalOpen(open)}
        onUserCreated={() => refetch()}
      />
    </div>
  );
};
