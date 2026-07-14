import mongoose, { Schema, model, models } from "mongoose";

const unreadCountSchema = new Schema(
  {
    user: { type: Number, default: 0 },
    admin: { type: Number, default: 0 }
  },
  { _id: false }
);

const conversationSchema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true, index: true }],
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    admin: { type: Schema.Types.ObjectId, ref: "User" },
    lastMessage: { type: String, default: "" },
    lastMessageTime: { type: Date },
    unreadCount: { type: unreadCountSchema, default: () => ({ user: 0, admin: 0 }) },
    status: { type: String, enum: ["active", "waiting", "resolved"], default: "active", index: true },
    isPinned: { type: Boolean, default: false, index: true },
    resolvedAt: { type: Date }
  },
  { timestamps: true }
);


conversationSchema.index({ isPinned: -1, lastMessageTime: -1 });

export const Conversation =
  models.Conversation || model("Conversation", conversationSchema);

export type ConversationDocument = mongoose.InferSchemaType<typeof conversationSchema>;

