"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Surface } from "@/components/admin/primitives/Surface";
import { RefreshButton } from "@/components/admin/primitives/RefreshButton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminUser } from "@/lib/admin/types";

type UsersViewProps = {
  users: AdminUser[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onCreateUser?: () => void;
  onUpdateUser?: (user: AdminUser) => void;
  onDeleteUser?: (user: AdminUser) => void;
  isAdmin?: boolean;
};

const getInitials = ({ firstName, lastName }: { firstName: string; lastName: string }) => {
  const first = firstName?.charAt(0)?.toUpperCase() || "";
  const last = lastName?.charAt(0)?.toUpperCase() || "";
  return `${first}${last}`;
};

export const UsersView = ({ users, isLoading = false, onRefresh, onCreateUser, onUpdateUser, onDeleteUser, isAdmin = false }: UsersViewProps) => {
  const t = useTranslations();

  return (
    <Surface className="overflow-hidden">
      <div className="px-6 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("admin.usersView.title")}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && onCreateUser && (
            <Button
              type="button"
              onClick={onCreateUser}
              className="h-9 rounded-xl bg-[#429de6] text-white hover:bg-[#3a8acc] flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create User</span>
            </Button>
          )}
          {onRefresh && (
            <RefreshButton onClick={onRefresh} isLoading={isLoading} />
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/70 hover:bg-gray-50/70 dark:bg-white/5">
            <TableHead className="px-6 py-4 sm:px-8 text-sm font-semibold min-w-[250px]">Name</TableHead>
            <TableHead className="px-4 py-4 text-sm font-semibold min-w-[150px]">Username</TableHead>
            <TableHead className="px-4 py-4 text-sm font-semibold min-w-[200px]">Email</TableHead>
            <TableHead className="px-4 py-4 text-sm font-semibold min-w-[150px]">Phone</TableHead>
            <TableHead className="px-4 py-4 text-sm font-semibold min-w-[150px]">Passport</TableHead>
            <TableHead className="px-4 py-4 text-sm font-semibold min-w-[180px]">Company</TableHead>
            <TableHead className="px-4 py-4 text-sm font-semibold min-w-[120px]">Country</TableHead>
            {isAdmin && (
              <TableHead className="px-4 py-4 text-center pr-6 sm:pr-8 text-sm font-semibold min-w-[160px]">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={isAdmin ? 8 : 7} className="py-12">
                <div className="flex flex-col items-center justify-center gap-3">
                  <svg className="animate-spin h-8 w-8 text-[#429de6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t("admin.usersView.loadingUsers")}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isAdmin ? 8 : 7} className="py-12">
                <div className="flex items-center justify-center text-center text-sm text-gray-600 dark:text-gray-400">
                  {t("admin.usersView.noUsersFound")}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            users.map((u) => (
            <TableRow key={u.id} className="hover:bg-gray-50/70 dark:hover:bg-white/5">
              <TableCell className="px-6 py-6 sm:px-8 min-w-[250px]">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-base font-semibold text-gray-900 ring-1 ring-gray-200 dark:bg-white/5 dark:text-white dark:ring-white/10 flex-shrink-0">
                    {getInitials({ firstName: u.firstName, lastName: u.lastName })}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold text-gray-900 dark:text-white">
                      {u.firstName} {u.lastName}
                    </div>
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {u.location || u.country || "-"}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-4 py-6 min-w-[150px]">
                <div className="text-sm text-gray-900 dark:text-white">
                  {u.username || "-"}
                </div>
              </TableCell>
              <TableCell className="px-4 py-6 min-w-[200px]">
                <div className="text-sm text-gray-900 dark:text-white">
                  {u.email || "-"}
                </div>
              </TableCell>
              <TableCell className="px-4 py-6 min-w-[150px]">
                <div className="text-sm text-gray-900 dark:text-white">
                  {u.phone || "-"}
                </div>
              </TableCell>
              <TableCell className="px-4 py-6 min-w-[150px]">
                <div className="text-sm text-gray-900 dark:text-white font-mono">
                  {u.passport || "-"}
                </div>
              </TableCell>
              <TableCell className="px-4 py-6 min-w-[180px]">
                <div className="text-sm text-gray-900 dark:text-white">
                  {u.companyName || "-"}
                </div>
              </TableCell>
              <TableCell className="px-4 py-6 min-w-[120px]">
                <div className="text-sm text-gray-900 dark:text-white">
                  {u.country || "-"}
                </div>
              </TableCell>

              {/* Actions */}
              {isAdmin && (
                <TableCell className="px-4 py-6 text-center pr-6 sm:pr-8 min-w-[160px]">
                  <div className="flex items-center justify-center gap-2">
                    {onUpdateUser && (
                      <Button
                        onClick={() => onUpdateUser(u)}
                        variant="outline"
                        size="sm"
                        className="h-9 px-3 gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:border-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-950/50 dark:hover:border-blue-800 dark:hover:text-blue-300 transition-all"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="hidden sm:inline">Update</span>
                      </Button>
                    )}
                    {onDeleteUser && (
                      <Button
                        onClick={() => onDeleteUser(u)}
                        variant="outline"
                        size="sm"
                        className="h-9 px-3 gap-2 border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-400 hover:text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50 dark:hover:border-red-700 dark:hover:text-red-300 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>
    </Surface>
  );
};



