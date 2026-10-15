import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/express";

import {
  getUserNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  clearNotifications,
} from "../../../src/lib/notifications";

/**
 * GET /api/v1/notifications
 * Get user notifications with pagination
 */
export async function getNotifications(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const result = await getUserNotifications(req.user.id, page, limit);

    res.status(200).json(result);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/**
 * GET /api/v1/notifications/unread-count
 * Get unread notification count
 */
export async function getUnreadCount(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const count = await getUnreadNotificationCount(req.user.id, "user");

    res.status(200).json({ count });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/**
 * PATCH /api/v1/notifications/read-all
 * Mark all notifications as read
 */
export async function markAllAsRead(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const count = await markAllNotificationsAsRead(req.user.id, "user");

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      count,
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/**
 * DELETE /api/v1/notifications/clear
 * Clear all notifications
 */
export async function clearAllNotifications(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const count = await clearNotifications(req.user.id, "user");

    res.status(200).json({
      success: true,
      message: "All notifications cleared",
      count,
    });
  } catch (error) {
    console.error("Clear notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
