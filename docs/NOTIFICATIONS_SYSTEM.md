# Notifications System Documentation

## Overview

A comprehensive notifications system has been implemented for the Prime Cars platform, providing CRUD operations for system-wide notifications. The system supports different user experiences based on role:

- **Admin users**: Full CRUD access to manage notifications
- **Non-admin users**: View notifications with automatic popup display for unread items

---

## API Endpoints

The system integrates with the following backend endpoints:

### POST `/notifications`
Create a notification for all users (Admin only)

**Request Body:**
```json
{
  "message": "System Update",
  "description": "The system will undergo maintenance on Saturday.",
  "reason": "Scheduled maintenance for performance improvements"
}
```

### GET `/notifications`
Get all notifications for the current user

**Query Parameters:**
- `isRead` (optional): Filter by read status (true/false)

### GET `/notifications/unread-count`
Get count of unread notifications

**Response:**
```json
{
  "unreadCount": 5
}
```

### GET `/notifications/all`
Get all notifications (Admin only)

### PATCH `/notifications/mark-read`
Mark a notification as read

**Request Body:**
```json
{
  "notificationId": "507f1f77bcf86cd799439011"
}
```

### DELETE `/notifications/{id}`
Delete a notification (Admin only)

---

## File Structure

### API Functions (`/src/lib/admin/notifications/`)

1. **types.ts** - TypeScript types and interfaces
   - `Notification` - Main notification type
   - `CreateNotificationData` - Data for creating notifications
   - `NotificationFilters` - Filter options

2. **fetchNotifications.ts** - Fetch user's notifications with optional filters
3. **fetchAllNotifications.ts** - Fetch all notifications (admin only)
4. **fetchUnreadCount.ts** - Get count of unread notifications
5. **createNotification.ts** - Create new notification for all users
6. **deleteNotification.ts** - Delete a notification
7. **markNotificationAsRead.ts** - Mark notification as read

All API functions use `authenticatedFetch` for automatic token management and refresh.

### State Management (`/src/hooks/admin/`)

**useAdminNotificationsState.ts** - Custom hook for managing notification state
- Handles loading, caching, and filtering of notifications
- Provides modal state management
- 5-minute cache duration for performance
- Separate loading for admin vs regular users

### UI Components

#### Admin Components

1. **AdminNotificationsPage** (`/src/components/admin/pages/`)
   - Main page component for notifications management
   - Handles delete confirmation dialogs
   - Integrates with state management hook

2. **NotificationsView** (`/src/components/admin/views/`)
   - Table view of all notifications
   - Shows: message, description, reason, created date
   - Admin actions: create, delete
   - Refresh functionality

3. **CreateNotificationModal** (`/src/components/admin/modals/`)
   - Form for creating new notifications
   - Fields: message, description, reason
   - Sends notification to all users

#### User Components

**NotificationPopup** (`/src/components/`)
- Automatic popup for non-admin users with unread notifications
- Shows one notification at a time
- Actions: "Mark as Read" or "Later"
- Displays count of remaining unread notifications
- Only appears for non-admin users

### Routing

**Page Route:** `/admin/notifications`
- Location: `/src/app/[locale]/admin/notifications/page.tsx`
- Uses Suspense for loading state
- Accessible from admin sidebar navigation

### Navigation

**AdminSidebarContent** - Updated to include notifications
- New navigation item with Bell icon
- Positioned between "Users" and "Calculator"
- Active state detection based on pathname

### Layout Integration

**Admin Layout** (`/src/app/[locale]/admin/layout.tsx`)
- Integrated `NotificationPopup` component
- Only shows for non-admin users
- Automatically loads on page mount

---

## Translations

Translations added for all three locales (en, ru, hy):

### English (`/src/messages/en.json`)
```json
{
  "admin": {
    "sidebar": {
      "nav": {
        "notifications": "Notifications"
      }
    },
    "headers": {
      "notificationsTitle": "Notifications",
      "notificationsSubtitle": "Manage system notifications and announcements for all users."
    },
    "notifications": {
      "title": "Notifications",
      "create": "Create",
      "message": "Message",
      "description": "Description",
      "reason": "Reason",
      "createdAt": "Created",
      "actions": "Actions",
      "delete": "Delete",
      "markAsRead": "Mark as Read",
      "later": "Later"
    },
    "modals": {
      "createNotification": {
        "title": "Create Notification",
        "subtitle": "Send a notification to all users.",
        "message": "Message",
        "description": "Description",
        "reason": "Reason",
        "submit": "Send to All Users"
      },
      "deleteNotification": {
        "title": "Delete Notification",
        "description": "Are you sure you want to delete this notification?"
      }
    }
  }
}
```

Similar translations provided for Russian and Armenian.

---

## User Experience

### For Admin Users

1. **Access Notifications Page**
   - Click "Notifications" in admin sidebar
   - View all notifications in table format

2. **Create Notification**
   - Click "Create" button
   - Fill in message, description, and reason
   - Submit to send to all users

3. **Delete Notification**
   - Click delete icon on any notification
   - Confirm deletion in dialog
   - Notification removed for all users

4. **Refresh Data**
   - Click refresh button to reload notifications
   - Data cached for 5 minutes for performance

### For Non-Admin Users

1. **Automatic Popup**
   - On page load, unread notifications automatically appear
   - Large modal displays notification details
   - Shows one notification at a time

2. **Mark as Read**
   - Click "Mark as Read" to dismiss current notification
   - If more unread notifications exist, next one appears
   - Popup closes when all are read

3. **Later Option**
   - Click "Later" to dismiss popup
   - Notifications remain unread
   - Will appear again on next page load

4. **View All Notifications**
   - Navigate to `/admin/notifications` page
   - View all notifications (read and unread)
   - No delete/create actions available

---

## Features

### Security
- All API calls use `authenticatedFetch` with automatic token refresh
- Admin-only endpoints protected by role checking
- User can only see their own notifications

### Performance
- 5-minute cache for notification data
- Prevents unnecessary API calls
- Force refresh option available

### User Experience
- Clean, modern UI matching existing admin design
- Dark mode support
- Responsive design for mobile devices
- Loading states for all async operations
- Toast notifications for success/error feedback

### Accessibility
- Proper ARIA labels
- Keyboard navigation support
- Focus management in modals
- Screen reader friendly

---

## Code Quality

### Follows Project Standards
- ✅ Uses `authenticatedFetch` for all API calls
- ✅ Function expressions instead of declarations
- ✅ Object parameters for functions with 2+ arguments
- ✅ Proper import grouping (framework → third-party → local)
- ✅ Type safety with TypeScript
- ✅ Reusable components and utilities
- ✅ Separation of concerns (logic, UI, state)

### Error Handling
- Try-catch blocks in all async operations
- User-friendly error messages
- Console logging for debugging
- Graceful degradation on failures

### Testing Checklist
- [ ] Test notification creation as admin
- [ ] Test notification deletion as admin
- [ ] Test popup display for non-admin users
- [ ] Test mark as read functionality
- [ ] Test with expired access token (should auto-refresh)
- [ ] Test with expired refresh token (should show login)
- [ ] Test with multiple simultaneous notifications
- [ ] Test responsive design on mobile
- [ ] Test dark mode appearance
- [ ] Test translations in all locales

---

## Future Enhancements

Potential improvements for future iterations:

1. **Notification Types**
   - Add severity levels (info, warning, error)
   - Different icons/colors based on type

2. **Targeting**
   - Send notifications to specific users or groups
   - Role-based notification targeting

3. **Scheduling**
   - Schedule notifications for future delivery
   - Recurring notifications

4. **Rich Content**
   - Support for markdown in descriptions
   - Attachments or links

5. **Notification Center**
   - Topbar icon with unread count badge
   - Dropdown to view recent notifications
   - Quick mark all as read

6. **Push Notifications**
   - Browser push notifications
   - Email notifications

7. **Analytics**
   - Track notification read rates
   - User engagement metrics

---

## Troubleshooting

### Notifications not appearing for non-admin users
- Check that user is authenticated
- Verify `isAdmin` is false
- Check browser console for errors
- Ensure notifications exist in database

### Admin cannot create notifications
- Verify user has admin role
- Check API endpoint is accessible
- Review network tab for errors
- Confirm all required fields are filled

### Popup appears for admin users
- Check `isAdmin` flag in UserContext
- Verify conditional rendering in layout
- Review user role from backend

---

**Last Updated:** January 2026  
**Implemented By:** Prime Cars Development Team
