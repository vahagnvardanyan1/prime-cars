import { adminApiRequest, type AdminApiResult } from "@/lib/admin/adminApiRequest";

export const deleteNotification = ({ id }: { id: string }): Promise<AdminApiResult<unknown>> =>
  adminApiRequest({
    path: `/notifications/${id}`,
    method: "DELETE",
    errorFallback: "Failed to delete notification",
    errorContext: "deleting notification",
  });
