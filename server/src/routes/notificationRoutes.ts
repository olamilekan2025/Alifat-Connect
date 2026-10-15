
import { Router } from "express";
import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  clearAllNotifications,
} from "../controllers/notificationController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, getNotifications);
router.get("/unread-count", authenticate, getUnreadCount);
router.patch("/read-all", authenticate, markAllAsRead);
router.delete("/clear", authenticate, clearAllNotifications);

export default router;
