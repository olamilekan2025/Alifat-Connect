import mongoose, { Schema, model, models } from "mongoose";

export interface ISupportMessage {
  ticketId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderType: "USER" | "ADMIN" | "SYSTEM";
  message: string;
  
  // Internal notes (only visible to admins)
  isInternal: boolean;
  
  // Attachments
  attachments?: Array<{
    url: string;
    name: string;
    mimeType: string;
    size: number;
  }>;
  
  // Read status
  isRead: boolean;
  readBy?: Array<{
    userId: mongoose.Types.ObjectId;
    readAt: Date;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

const SupportMessageSchema = new Schema<ISupportMessage>(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupportTicket",
      required: true,
      index: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    senderType: {
      type: String,
      enum: ["USER", "ADMIN", "SYSTEM"],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    isInternal: {
      type: Boolean,
      default: false,
      index: true,
    },

    attachments: [{
      url: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      mimeType: {
        type: String,
        required: true,
      },
      size: {
        type: Number,
        required: true,
      },
    }],

    isRead: {
      type: Boolean,
      default: false,
    },

    readBy: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      readAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
SupportMessageSchema.index({ ticketId: 1, createdAt: 1 });
SupportMessageSchema.index({ senderId: 1, createdAt: -1 });
SupportMessageSchema.index({ ticketId: 1, isInternal: 1 });
SupportMessageSchema.index({ isRead: 1 });

const SupportMessage =
  models.SupportMessage ||
  model<ISupportMessage>("SupportMessage", SupportMessageSchema);

export default SupportMessage;
