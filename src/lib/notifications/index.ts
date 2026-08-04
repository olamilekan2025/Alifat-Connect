export * from "./notification.types";
export * from "./notification.utils";

// Server-only exports
export {
  createNotification,
  createUserNotification,
  createAdminNotification,
  createNotificationForAdmins,
  getUserNotifications,
  getAdminNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearNotifications,
  setSocketIO,
} from "./notification.service";
