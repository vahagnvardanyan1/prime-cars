"use client";

import { Plus, Trash2 } from "lucide-react";
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
import type { Notification } from "@/lib/admin/notifications/types";

type NotificationsViewProps = {
  notifications: Notification[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onCreateNotification?: () => void;
  onDeleteNotification?: (notification: Notification) => void;
  onViewNotification?: (notification: Notification) => void;
  isAdmin?: boolean;
};

const formatDate = ({ dateString, t }: { dateString: string; t: (key: string, values?: Record<string, number>) => string }) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t("justNow");
  if (diffMins < 60) return t("minutesAgo", { minutes: diffMins });
  if (diffHours < 24) return t("hoursAgo", { hours: diffHours });
  if (diffDays < 7) return t("daysAgo", { days: diffDays });
  
  return date.toLocaleDateString();
};

export const NotificationsView = ({ 
  notifications, 
  isLoading = false, 
  onRefresh, 
  onCreateNotification,
  onDeleteNotification,
  onViewNotification,
  isAdmin = false,
}: NotificationsViewProps) => {
  const t = useTranslations("admin.notifications");

  return (
    <Surface className="overflow-hidden">
      <div className="px-6 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold text-gray-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {t("showing")} {notifications.length} {notifications.length === 1 ? t("notification") : t("notifications")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && onCreateNotification && (
            <Button
              type="button"
              onClick={onCreateNotification}
              className="h-9 rounded-xl bg-[#429de6] text-white hover:bg-[#3a8acc] flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t("create")}</span>
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
              <TableHead className="px-6 py-4 sm:px-8 text-sm font-semibold w-[200px]">{t("message")}</TableHead>
              <TableHead className="px-4 py-4 text-sm font-semibold w-[280px]">{t("description")}</TableHead>
              <TableHead className="px-4 py-4 text-sm font-semibold w-[200px]">{t("reason")}</TableHead>
              <TableHead className="px-4 py-4 text-sm font-semibold w-[120px]">{t("createdAt")}</TableHead>
              <TableHead className="px-4 py-4 text-sm font-semibold w-[100px]">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-gray-500 dark:text-gray-400">
                  {t("loading")}
                </TableCell>
              </TableRow>
            ) : notifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-gray-500 dark:text-gray-400">
                  {t("noNotifications")}
                </TableCell>
              </TableRow>
            ) : (
              notifications.map((notification) => {
                // Treat all notifications as read when user is admin
                const shouldShowAsRead = isAdmin || notification.isRead;
                
                return (
                <TableRow
                  key={notification.id}
                  className={`transition-all duration-200 cursor-pointer ${
                    shouldShowAsRead 
                      ? 'hover:bg-gray-50/50 dark:hover:bg-white/5 opacity-75' 
                      : 'hover:bg-[#429de6]/5 dark:hover:bg-[#429de6]/10 bg-white dark:bg-[#0b0f14]'
                  }`}
                  onClick={() => onViewNotification?.(notification)}
                >
                  <TableCell className="px-6 py-4 sm:px-8">
                    <div className="flex items-center gap-3 max-w-[200px]">
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full ${
                        shouldShowAsRead 
                          ? 'bg-gray-300 dark:bg-gray-600' 
                          : 'bg-[#429de6] animate-pulse'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <div className={`font-medium line-clamp-2 break-words ${
                          shouldShowAsRead 
                            ? 'text-gray-600 dark:text-gray-400' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {notification.message}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="line-clamp-2 break-words overflow-hidden max-w-[280px]">
                      {notification.description}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="line-clamp-2 break-words overflow-hidden max-w-[200px]">
                      {notification.reason || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {formatDate({ dateString: notification.createdAt, t })}
                  </TableCell>
                  <TableCell className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      {isAdmin && onDeleteNotification && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteNotification(notification);
                          }}
                          className="h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800/30 dark:hover:text-gray-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )})
            )}
          </TableBody>
        </Table>
      </div>
    </Surface>
  );
};
