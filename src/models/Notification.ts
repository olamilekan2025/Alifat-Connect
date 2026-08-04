import mongoose, { Schema, model, models } from "mongoose";

const notificationSchema = new Schema(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    recipientRole: { type: String, enum: ["user", "admin"], index: true },
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation" },
    messageId: { type: Schema.Types.ObjectId, ref: "Message" },
    type: {
      type: String,
      enum: [
        // Chat notifications (existing)
        "admin_reply",
        "message_read",
        "new_conversation",
        "new_message",
        // User transaction notifications
        "transaction_success",
        "transaction_failed",
        "transaction_pending",
        "wallet_funded",
        "wallet_debited",
        "airtime_purchase",
        "data_purchase",
        "electricity_purchase",
        "cable_purchase",
        "exam_pin_purchase",
        "cashback",
        "bonus",
        // User security notifications
        "account_security",
        "login",
        "password_changed",
        "profile_updated",
        // System notifications
        "system",
        // Admin notifications
        "new_user",
        "user_verified",
        "new_transaction",
        "wallet_funding",
        "withdrawal_request",
        "support_message",
        "suspicious_activity",
        "security_alert"
      ],
      required: true
    },
    title: { type: String, required: true },
    body: { type: String, default: "" },
    data: { type: Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date }
  },
  { timestamps: true }
);

notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientRole: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isRead: 1 });

export const Notification =
  models.Notification || model("Notification", notificationSchema);

export type NotificationDocument = mongoose.InferSchemaType<typeof notificationSchema>;
