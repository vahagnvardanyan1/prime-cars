export type Notification = {
  id: string; // This is the notification ID
  recordId?: string; // This is the user-notification record ID (for marking as read)
  message: string;
  description: string;
  reason: string;
  createdAt: string;
  isRead?: boolean;
  userId?: string;
};

export type CreateNotificationData = {
  message: string;
  description: string;
  reason: string;
};

export type NotificationFilters = {
  isRead?: string;
};

// Backend API response types
export type BackendNotificationData = {
  _id?: string;
  id?: string;
  message?: string;
  description?: string;
  reason?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  isRead?: boolean;
  userId?: string;
  __v?: number;
};

export type BackendNotificationResponse = {
  _id?: string;
  notification?: BackendNotificationData;
  is_read?: boolean;
  readedTime?: string | null;
  userId?: string;
};
