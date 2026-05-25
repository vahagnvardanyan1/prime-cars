import type { CreateNotificationData, Notification } from "./types";

import { adminApiRequest } from "@/lib/admin/adminApiRequest";

type CreateNotificationResponse = {
  success: boolean;
  notification?: Notification;
  error?: string;
};

export const createNotification = async ({
  data,
}: {
  data: CreateNotificationData;
}): Promise<CreateNotificationResponse> => {
  const result = await adminApiRequest<Notification>({
    path: "/notifications",
    method: "POST",
    json: {
      message: data.message,
      description: data.description,
      reason: data.reason,
    },
    errorFallback: "Failed to create notification",
    errorContext: "creating notification",
  });

  if (!result.success) return { success: false, error: result.error };
  return { success: true, notification: result.data ?? undefined };
};
