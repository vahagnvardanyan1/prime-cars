// Simple event system for notification updates
type NotificationEventCallback = () => void;

const listeners: NotificationEventCallback[] = [];

export const notificationEvents = {
  // Subscribe to notification changes
  subscribe: (callback: NotificationEventCallback) => {
    listeners.push(callback);
    return () => {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  },
  
  // Emit notification change event
  emit: () => {
    listeners.forEach(callback => callback());
  }
};
