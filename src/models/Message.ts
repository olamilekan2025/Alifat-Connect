import mongoose, { Schema, model, models } from "mongoose";

const attachmentSchema = new Schema(
  {
    url: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true }
  },
  { _id: false }
);

const messageSchema = new Schema(
  {
    clientId: { type: String, index: true },
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User" },
    senderRole: { type: String, enum: ["user", "admin"], required: true },
    message: { type: String, default: "" },
    messageType: { type: String, enum: ["text", "image", "pdf", "file"], default: "text" },
    attachment: attachmentSchema,
    isRead: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, message: "text" });
messageSchema.index({ clientId: 1, senderId: 1 }, { unique: true, sparse: true });

export const Message = models.Message || model("Message", messageSchema);

export type MessageDocument = mongoose.InferSchemaType<typeof messageSchema>;

