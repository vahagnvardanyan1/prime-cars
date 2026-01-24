"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Surface } from "@/components/admin/primitives/Surface";
import { RefreshButton } from "@/components/admin/primitives/RefreshButton";
import { Pagination } from "@/components/admin/primitives/Pagination";
import { UserFilters, type UserFiltersState } from "@/components/admin/filters/UserFilters";
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
  filters?: UserFiltersState;
  onFiltersChange?: (filters: UserFiltersState) => void;
  onClearFilters?: () => void;
  // Pagination
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
};

const getInitials = ({ firstName, lastName }: { firstName: string; lastName: string }) => {
  const first = firstName?.charAt(0)?.toUpperCase() || "";
  const last = lastName?.charAt(0)?.toUpperCase() || "";
  return `${first}${last}`;
};

export const UsersView = ({ 
  users, 
  isLoading = false, 
  onRefresh, 
  onCreateUser, 
  onUpdateUser, 
  onDeleteUser, 
  isAdmin = false,
  filters,
  onFiltersChange,
  onClearFilters,
  // Pagination
  currentPage = 1,
  totalPages = 1,
  pageSize = 25,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
}: UsersViewProps) => {
  const t = useTranslations();
  const tTable = useTranslations("usersTable");

  return (
    <Surface className="overflow-hidden">
      <div className="px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {tTable("title")}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {tTable("showing")} {users.length} {users.length === 1 ? tTable("user") : tTable("users")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && onCreateUser && (
            <Button
              type="button"
              onClick={onCreateUser}
              aria-label={tTable("createUser")}
              className="h-9 rounded-xl bg-[#429de6] text-white hover:bg-[#3a8acc] flex items-center gap-2"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              <span className="hidden sm:inline">{tTable("createUser")}</span>
            </Button>
          )}
          {onRefresh && (
            <RefreshButton onClick={onRefresh} isLoading={isLoading} />
          )}
        </div>
      </div>

      {/* Filters */}
      {filters && onFiltersChange && onClearFilters && (
        <UserFilters
          filters={filters}
          onFiltersChange={onFiltersChange}
          onClearFilters={onClearFilters}
        />
      )}

      <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/70 hover:bg-gray-50/70 dark:bg-white/5">
            <TableHead className="px-6 py-4 sm:px-8 text-sm font-semibold min-w-[250px]">{tTable("name")}</TableHead>
            <TableHead className="px-4 py-4 text-sm font-semibold min-w-[150px]">{tTable("username")}</TableHead>
            <TableHead className="px-4 py-4 text-sm font-semibold min-w-[200px]">{tTable("email")}</TableHead>
            <TableHead className="px-4 py-4 text-sm font-semibold min-w-[150px]">{tTable("phone")}</TableHead>
            <TableHead className="px-4 py-4 text-sm font-semibold min-w-[150px]">{tTable("passport")}</TableHead>
            <TableHead className="px-4 py-4 text-sm font-semibold min-w-[180px]">{tTable("company")}</TableHead>
            <TableHead className="px-4 py-4 text-sm font-semibold min-w-[120px]">{tTable("country")}</TableHead>
            {isAdmin && (
              <TableHead className="px-4 py-4 text-center pr-6 sm:pr-8 text-sm font-semibold min-w-[160px]">{tTable("actions")}</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={isAdmin ? 8 : 7} className="py-12">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div aria-hidden="true" className="animate-spin">
                    <svg className="h-8 w-8 text-[#429de6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {tTable("loadingUsers")}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isAdmin ? 8 : 7} className="py-12">
                <div className="flex items-center justify-center text-center text-sm text-gray-600 dark:text-gray-400">
                  {tTable("noUsersFound")}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            users.map((u) => (
            <TableRow key={u.id} className="transition-colors duration-150 hover:bg-yellow-100 dark:hover:bg-[#429de6]/20">
              <TableCell className="px-2 py-3 min-w-[250px]">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-sm font-semibold text-gray-900 ring-1 ring-gray-200 dark:bg-white/5 dark:text-white dark:ring-white/10 flex-shrink-0">
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
              <TableCell className="px-1.5 py-3 min-w-[150px]">
                <div className="text-sm text-gray-900 dark:text-white">
                  {u.username || "-"}
                </div>
              </TableCell>
              <TableCell className="px-1.5 py-3 min-w-[200px]">
                <div className="text-sm text-gray-900 dark:text-white">
                  {u.email || "-"}
                </div>
              </TableCell>
              <TableCell className="px-1.5 py-3 min-w-[150px]">
                <div className="text-sm text-gray-900 dark:text-white">
                  {u.phone || "-"}
                </div>
              </TableCell>
              <TableCell className="px-1.5 py-3 min-w-[150px]">
                <div className="text-sm text-gray-900 dark:text-white font-mono">
                  {u.passport || "-"}
                </div>
              </TableCell>
              <TableCell className="px-1.5 py-3 min-w-[180px]">
                <div className="text-sm text-gray-900 dark:text-white">
                  {u.companyName || "-"}
                </div>
              </TableCell>
              <TableCell className="px-1.5 py-3 min-w-[120px]">
                <div className="text-sm text-gray-900 dark:text-white">
                  {u.country || "-"}
                </div>
              </TableCell>

              {/* Actions */}
              {isAdmin && (
                <TableCell className="px-1.5 py-3 text-center pr-2 min-w-[160px]">
                  <div className="flex items-center justify-center gap-2">
                    {onUpdateUser && (
                      <Button
                        onClick={() => onUpdateUser(u)}
                        variant="outline"
                        size="sm"
                        aria-label={`${t("admin.actions.update")} ${u.firstName} ${u.lastName}`}
                        className="h-9 px-3 gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:border-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-950/50 dark:hover:border-blue-800 dark:hover:text-blue-300 transition-all"
                      >
                        <Pencil aria-hidden="true" className="h-4 w-4" />
                        <span className="hidden sm:inline">{t("admin.actions.update")}</span>
                      </Button>
                    )}
                    {onDeleteUser && (
                      <Button
                        onClick={() => onDeleteUser(u)}
                        variant="outline"
                        size="sm"
                        aria-label={`${t("admin.actions.delete")} ${u.firstName} ${u.lastName}`}
                        className="h-9 px-3 gap-2 border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:border-gray-400 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-900/30 dark:text-gray-400 dark:hover:bg-gray-900/50 dark:hover:border-gray-600 dark:hover:text-gray-300 transition-all"
                      >
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                        <span className="hidden sm:inline">{t("admin.actions.delete")}</span>
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

      {/* Pagination */}
      {onPageChange && onPageSizeChange && totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </Surface>
  );
};



