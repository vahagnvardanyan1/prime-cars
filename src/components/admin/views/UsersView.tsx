"use client";

import { useTranslations } from "next-intl";

import { Surface } from "@/components/admin/primitives/Surface";
import { TonePill } from "@/components/admin/primitives/TonePill";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getRoleTone } from "@/lib/admin/format";
import type { AdminUser } from "@/lib/admin/types";

type UsersViewProps = {
  users: AdminUser[];
};

const getInitials = ({ name }: { name: string }) => {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
};

export const UsersView = ({ users }: UsersViewProps) => {
  const t = useTranslations();

  const getRoleLabel = ({ role }: { role: AdminUser["role"] }) => {
    switch (role) {
      case "Admin":
        return t("admin.roles.admin");
      case "Manager":
        return t("admin.roles.manager");
      case "Support":
        return t("admin.roles.support");
      case "Viewer":
        return t("admin.roles.viewer");
      default:
        return role;
    }
  };

  return (
    <Surface className="overflow-hidden">
      <div className="px-6 py-5">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {t("admin.usersView.title")}
        </div>
        <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
          {t("admin.usersView.subtitle")}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/70 hover:bg-gray-50/70 dark:bg-white/5">
            <TableHead className="px-4 py-3 sm:px-6">{t("admin.usersView.columns.user")}</TableHead>
            <TableHead className="py-3">{t("admin.usersView.columns.email")}</TableHead>
            <TableHead className="py-3">{t("admin.usersView.columns.role")}</TableHead>
            <TableHead className="py-3 text-right pr-4 sm:pr-6">
              {t("admin.usersView.columns.status")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id} className="hover:bg-gray-50/70 dark:hover:bg-white/5">
              <TableCell className="px-4 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-sm font-semibold text-gray-900 ring-1 ring-gray-200 dark:bg-white/5 dark:text-white dark:ring-white/10">
                    {getInitials({ name: u.name })}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {u.name}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                      {getRoleLabel({ role: u.role })}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {u.email}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <TonePill tone={getRoleTone({ role: u.role })}>
                  {getRoleLabel({ role: u.role })}
                </TonePill>
              </TableCell>
              <TableCell className="py-4 text-right pr-4 sm:pr-6">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {t("admin.usersView.statusActive")}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Surface>
  );
};


