import { adminApiRequest, type AdminApiResult } from "@/lib/admin/adminApiRequest";

export const markNotificationAsRead = ({
  notificationId,
}: {
  notificationId: string;
}): Promise<AdminApiResult<unknown>> =>
  adminApiRequest({
    path: "/notifications/mark-read",
    method: "PATCH",
    json: { notificationId },
    errorFallback: "Failed to mark notification as read",
    errorContext: "marking notification as read",
  });
