import type { NotificationType } from "./notification.types";

/**
 * Get notification icon based on type
 */
export function getNotificationIcon(type: NotificationType): string {
  const iconMap: Record<NotificationType, string> = {
    // Chat notifications
    admin_reply: "MessageSquare",
    message_read: "Check",
    new_conversation: "MessageCircle",
    new_message: "MessageSquare",
    // User transaction notifications
    transaction_success: "CheckCircle",
    transaction_failed: "XCircle",
    transaction_pending: "Clock",
    wallet_funded: "Wallet",
    wallet_debited: "CreditCard",
    airtime_purchase: "Phone",
    data_purchase: "Wifi",
    electricity_purchase: "Zap",
    cable_purchase: "Tv",
    exam_pin_purchase: "Book",
    cashback: "Gift",
    bonus: "Star",
    // User security notifications
    account_security: "ShieldAlert",
    login: "LogIn",
    password_changed: "Key",
    profile_updated: "User",
    // System notifications
    system: "Info",
    // Admin notifications
    new_user: "UserPlus",
    user_verified: "UserCheck",
    new_transaction: "Receipt",
    wallet_funding: "Wallet",
    withdrawal_request: "ArrowUp",
    support_message: "MessageSquare",
    suspicious_activity: "AlertTriangle",
    security_alert: "ShieldAlert",
    // Payment notifications
    payment_approved: "CheckCircle",
    payment_rejected: "XCircle",
  };

  return iconMap[type] || "Bell";
}

/**
 * Get notification color based on type
 */
export function getNotificationColor(type: NotificationType): string {
  const colorMap: Record<NotificationType, string> = {
    // Chat notifications
    admin_reply: "blue",
    message_read: "gray",
    new_conversation: "blue",
    new_message: "blue",
    // User transaction notifications
    transaction_success: "green",
    transaction_failed: "red",
    transaction_pending: "yellow",
    wallet_funded: "green",
    wallet_debited: "orange",
    airtime_purchase: "blue",
    data_purchase: "blue",
    electricity_purchase: "yellow",
    cable_purchase: "purple",
    exam_pin_purchase: "indigo",
    cashback: "green",
    bonus: "yellow",
    // User security notifications
    account_security: "red",
    login: "blue",
    password_changed: "yellow",
    profile_updated: "blue",
    // System notifications
    system: "gray",
    // Admin notifications
    new_user: "blue",
    user_verified: "green",
    new_transaction: "blue",
    wallet_funding: "green",
    withdrawal_request: "orange",
    support_message: "blue",
    suspicious_activity: "red",
    security_alert: "red",
    // Payment notifications
    payment_approved: "green",
    payment_rejected: "red",
  };

  return colorMap[type] || "gray";
}

/**
 * Format notification time
 */
export function formatNotificationTime(date: Date): string {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return notificationDate.toLocaleDateString();
}

/**
 * Get notification priority for sorting
 */
export function getNotificationPriority(type: NotificationType): number {
  const priorityMap: Record<NotificationType, number> = {
    // High priority
    security_alert: 10,
    suspicious_activity: 9,
    account_security: 8,
    transaction_failed: 7,
    withdrawal_request: 6,
    // Medium priority
    new_user: 5,
    new_transaction: 4,
    wallet_funding: 4,
    support_message: 4,
    transaction_success: 3,
    transaction_pending: 3,
    wallet_funded: 3,
    payment_approved: 4,
    payment_rejected: 5,
    // Low priority
    new_message: 2,
    admin_reply: 2,
    new_conversation: 2,
    message_read: 1,
    login: 1,
    password_changed: 1,
    profile_updated: 1,
    cashback: 1,
    bonus: 1,
    airtime_purchase: 1,
    data_purchase: 1,
    electricity_purchase: 1,
    cable_purchase: 1,
    exam_pin_purchase: 1,
    wallet_debited: 1,
    user_verified: 1,
    system: 0,
  };

  return priorityMap[type] || 0;
}
