export type NotificationType =
  // Chat notifications
  | "admin_reply"
  | "message_read"
  | "new_conversation"
  | "new_message"
  // User transaction notifications
  | "transaction_success"
  | "transaction_failed"
  | "transaction_pending"
  | "wallet_funded"
  | "wallet_debited"
  | "airtime_purchase"
  | "data_purchase"
  | "electricity_purchase"
  | "cable_purchase"
  | "exam_pin_purchase"
  | "cashback"
  | "bonus"
  // User security notifications
  | "account_security"
  | "login"
  | "password_changed"
  | "profile_updated"
  // System notifications
  | "system"
  // Admin notifications
  | "new_user"
  | "user_verified"
  | "new_transaction"
  | "wallet_funding"
  | "withdrawal_request"
  | "support_message"
  | "suspicious_activity"
  | "security_alert"
  // Payment notifications
  | "payment_approved"
  | "payment_rejected"
  // KYC notifications
  | "kyc_submitted"
  | "kyc_resubmitted"
  | "kyc_approved"
  | "kyc_rejected";

export type NotificationRecipientRole = "user" | "admin";

export interface NotificationData {
  transactionId?: string;
  amount?: number;
  phone?: string;
  network?: string;
  plan?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  newBalance?: number;
  reference?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface CreateNotificationInput {
  recipientId?: string;
  recipientRole: NotificationRecipientRole;
  type: NotificationType;
  title: string;
  body: string;
  data?: NotificationData;
  conversationId?: string;
  messageId?: string;
}

export interface NotificationResponse {
  _id: string;
  recipientId?: string;
  recipientRole: NotificationRecipientRole;
  type: NotificationType;
  title: string;
  body: string;
  data: NotificationData;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  conversationId?: string;
  messageId?: string;
}

export interface NotificationListResponse {
  notifications: NotificationResponse[];
  total: number;
  unreadCount: number;
}
