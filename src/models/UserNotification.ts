import mongoose, {
  Schema,
  Document,
  Model,
} from "mongoose";

export interface IUserNotification
  extends Document {
  notificationId: mongoose.Types.ObjectId;

  userId: mongoose.Types.ObjectId;

  isRead: boolean;

  readAt?: Date;

  deliveredAt: Date;
}

const UserNotificationSchema =
  new Schema<IUserNotification>(
    {
      notificationId: {
        type: Schema.Types.ObjectId,
        ref: "Notification",
        required: true,
      },

      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      isRead: {
        type: Boolean,
        default: false,
      },

      readAt: Date,

      deliveredAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

UserNotificationSchema.index({
  notificationId: 1,
  userId: 1,
});

const UserNotification: Model<IUserNotification> =
  mongoose.models.UserNotification ||
  mongoose.model<IUserNotification>(
    "UserNotification",
    UserNotificationSchema
  );

export default UserNotification;