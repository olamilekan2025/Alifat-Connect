import mongoose, { Schema, Document, Model } from "mongoose";

export type NotificationAudience =
  | "all"
  | "verified"
  | "unverified"
  | "admins"
  | "user";

export type NotificationPriority =
  | "low"
  | "normal"
  | "high";

export type NotificationStatus =
  | "draft"
  | "scheduled"
  | "sent";

export interface INotification extends Document {
  title: string;
  message: string;

  audience: NotificationAudience;
  targetUserId?: mongoose.Types.ObjectId;

  priority: NotificationPriority;
  status: NotificationStatus;

  actionText?: string;
  actionUrl?: string;

  scheduledFor?: Date;
  sentAt?: Date;

  createdBy?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
  deliveredCount?: number;
  readCount?: number;
  failedCount?: number;
}

const NotificationSchema = new Schema<INotification>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    audience: {
      type: String,
      enum: [
        "all",
        "verified",
        "unverified",
        "admins",
        "user",
      ],
      default: "all",
    },

    targetUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },

    status: {
      type: String,
      enum: ["draft", "scheduled", "sent"],
      default: "draft",
    },

    deliveredCount: {
  type: Number,
  default: 0,
},

readCount: {
  type: Number,
  default: 0,
},

failedCount: {
  type: Number,
  default: 0,
},

    actionText: String,

    actionUrl: String,

    scheduledFor: Date,

    sentAt: Date,

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({
  status: 1,
  createdAt: -1,
});

NotificationSchema.index({
  audience: 1,
});

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>(
    "Notification",
    NotificationSchema
  );

export default Notification;