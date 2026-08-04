import { connectToDatabase } from "@/lib/mongodb";
import { Notification } from "@/models/Notification";
import type {
  CreateNotificationInput,
  NotificationData,
  NotificationListResponse,
  NotificationResponse,
  NotificationRecipientRole,
  NotificationType,
} from "./notification.types";
import type { Server as SocketIOServer } from "socket.io";

// Get Socket.IO server instance (will be set by the socket server)
let io: SocketIOServer | null = null;

export function setSocketIO(socketIO: SocketIOServer) {
  io = socketIO;
}

/**
 * Emit notification via Socket.IO
 */
function emitNotification(notification: {
  _id: { toString: () => string };
  recipientId?: { toString: () => string };
  recipientRole: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}) {
  if (!io) return;

  const room = notification.recipientId
    ? `user:${notification.recipientId}`
    : notification.recipientRole === "admin"
    ? "admins"
    : null;

  if (room) {
    io.to(room).emit("notification:new", {
      id: notification._id.toString(),
      recipientId: notification.recipientId?.toString(),
      recipientRole: notification.recipientRole,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    });
  }
}

/**
 * Create a notification and emit it via Socket.IO
 */
export async function createNotification(
  input: CreateNotificationInput
): Promise<NotificationResponse | null> {
  try {
    await connectToDatabase();

    const notification = await Notification.create({
      recipientId: input.recipientId,
      recipientRole: input.recipientRole,
      type: input.type,
      title: input.title,
      body: input.body,
      data: input.data || {},
      conversationId: input.conversationId,
      messageId: input.messageId,
    });

    // Emit via Socket.IO if available
    emitNotification(notification);

    return notification.toJSON() as NotificationResponse;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

/**
 * Create a notification for a specific user
 */
export async function createUserNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  data?: NotificationData
): Promise<NotificationResponse | null> {
  return createNotification({
    recipientId: userId,
    recipientRole: "user",
    type,
    title,
    body,
    data,
  });
}

/**
 * Create a notification for a specific admin
 */
export async function createAdminNotification(
  adminId: string,
  type: NotificationType,
  title: string,
  body: string,
  data?: NotificationData
): Promise<NotificationResponse | null> {
  return createNotification({
    recipientId: adminId,
    recipientRole: "admin",
    type,
    title,
    body,
    data,
  });
}

/**
 * Create a notification for all admins
 */
export async function createNotificationForAdmins(
  type: NotificationType,
  title: string,
  body: string,
  data?: NotificationData
): Promise<NotificationResponse | null> {
  return createNotification({
    recipientRole: "admin",
    type,
    title,
    body,
    data,
  });
}

/**
 * Get notifications for a user with pagination
 */
export async function getUserNotifications(
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<NotificationListResponse> {
  try {
    await connectToDatabase();

    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ recipientId: userId, recipientRole: "user" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ recipientId: userId, recipientRole: "user" }),
      Notification.countDocuments({
        recipientId: userId,
        recipientRole: "user",
        isRead: false,
      }),
    ]);

    return {
      notifications: notifications.map((n) => ({
        ...n,
        _id: n._id.toString(),
        recipientId: n.recipientId?.toString(),
      })) as NotificationResponse[],
      total,
      unreadCount,
    };
  } catch (error) {
    console.error("Error getting user notifications:", error);
    return { notifications: [], total: 0, unreadCount: 0 };
  }
}

/**
 * Get notifications for an admin with pagination
 */
export async function getAdminNotifications(
  adminId: string,
  page: number = 1,
  limit: number = 20
): Promise<NotificationListResponse> {
  try {
    await connectToDatabase();

    const skip = (page - 1) * limit;

    // Fetch notifications for this specific admin OR notifications for all admins (no recipientId)
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({
        $or: [
          { recipientId: adminId, recipientRole: "admin" },
          { recipientId: { $exists: false }, recipientRole: "admin" },
        ],
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({
        $or: [
          { recipientId: adminId, recipientRole: "admin" },
          { recipientId: { $exists: false }, recipientRole: "admin" },
        ],
      }),
      Notification.countDocuments({
        $or: [
          { recipientId: adminId, recipientRole: "admin", isRead: false },
          { recipientId: { $exists: false }, recipientRole: "admin", isRead: false },
        ],
      }),
    ]);

    return {
      notifications: notifications.map((n) => ({
        ...n,
        _id: n._id.toString(),
        recipientId: n.recipientId?.toString(),
      })) as NotificationResponse[],
      total,
      unreadCount,
    };
  } catch (error) {
    console.error("Error getting admin notifications:", error);
    return { notifications: [], total: 0, unreadCount: 0 };
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(
  userId: string,
  role: NotificationRecipientRole
): Promise<number> {
  try {
    await connectToDatabase();

    const count = await Notification.countDocuments({
      recipientId: userId,
      recipientRole: role,
      isRead: false,
    });

    return count;
  } catch (error) {
    console.error("Error getting unread notification count:", error);
    return 0;
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId: string,
  role: NotificationRecipientRole
): Promise<boolean> {
  try {
    await connectToDatabase();

    // Import mongoose for ObjectId validation
    const mongoose = require("mongoose");

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      console.log("Invalid notification ID:", notificationId);
      return false;
    }

    // First, check if the notification exists and belongs to this user/role
    const notification = await Notification.findOne({
      _id: notificationId,
      recipientRole: role,
      $or: [
        { recipientId: userId },
        { recipientId: { $exists: false } },
      ],
    });

    if (!notification) {
      console.log("Notification not found for marking as read:", {
        notificationId,
        userId,
        role,
      });
      // Try to find the notification without role restriction to debug
      const anyNotification = await Notification.findById(notificationId);
      if (anyNotification) {
        console.log("Notification exists but doesn't match conditions:", {
          notificationId,
          notificationRole: anyNotification.recipientRole,
          notificationRecipientId: anyNotification.recipientId,
          requestedRole: role,
          requestedUserId: userId,
        });
      }
      return false;
    }

    // For global admin notifications (no recipientId), we mark them as read
    // This is a simplification - in a more complex system, you might want to track
    // which specific admin has read it
    const result = await Notification.updateOne(
      { _id: notificationId },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(
  userId: string,
  role: NotificationRecipientRole
): Promise<number> {
  try {
    await connectToDatabase();

    const result = await Notification.updateMany(
      {
        recipientId: userId,
        recipientRole: role,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    return result.modifiedCount;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return 0;
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  notificationId: string,
  userId: string,
  role: NotificationRecipientRole
): Promise<boolean> {
  try {
    await connectToDatabase();

    const result = await Notification.deleteOne({
      _id: notificationId,
      recipientRole: role,
      $or: [
        { recipientId: userId },
        { recipientId: { $exists: false } },
      ],
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting notification:", error);
    return false;
  }
}

/**
 * Delete all notifications for a user
 */
export async function clearNotifications(
  userId: string,
  role: NotificationRecipientRole
): Promise<number> {
  try {
    await connectToDatabase();

    const result = await Notification.deleteMany({
      recipientId: userId,
      recipientRole: role,
    });

    return result.deletedCount;
  } catch (error) {
    console.error("Error clearing notifications:", error);
    return 0;
  }
}
