import mongoose, { Schema, model, models } from "mongoose";

const notificationSchema = new Schema(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    recipientRole: { type: String, enum: ["user", "admin"], index: true },
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation" },
    messageId: { type: Schema.Types.ObjectId, ref: "Message" },
    type: {
      type: String,
      enum: ["admin_reply", "message_read", "new_conversation", "new_message"],
      required: true
    },
    title: { type: String, required: true },
    body: { type: String, default: "" },
    isRead: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientRole: 1, createdAt: -1 });

export const Notification =
  models.Notification || model("Notification", notificationSchema);

export type NotificationDocument = mongoose.InferSchemaType<typeof notificationSchema>;
