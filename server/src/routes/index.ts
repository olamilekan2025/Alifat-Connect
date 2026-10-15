import { Router } from "express";
import mongoose from "mongoose";

import userRoutes from "./userRoutes";
import authRoutes from "./authRoutes";
import dashboardRoutes from "./dashboardRoutes";
import walletRoutes from "./walletRoutes";
import notificationRoutes from "./notificationRoutes";

const router = Router();

// API information.
router.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Alifat Connect API v1",
    endpoints: {
      health: "/api/health",
      database: "/api/v1/database",
      userCount: "/api/v1/users/count",
      auth: {
        register: "POST /api/v1/auth/register",
        verifyEmail: "POST /api/v1/auth/verify-email",
      },
      user: {
        profile: "GET /api/v1/user/profile",
        settings: "GET /api/v1/user/settings",
      },
      dashboard: {
        overview: "GET /api/v1/dashboard",
      },
      wallet: {
        get: "GET /api/v1/wallet",
        fund: "POST /api/v1/wallet/fund",
        withdraw: "POST /api/v1/wallet/withdraw",
      },
      notifications: {
        list: "GET /api/v1/notifications",
        unreadCount: "GET /api/v1/notifications/unread-count",
        readAll: "PATCH /api/v1/notifications/read-all",
        clear: "DELETE /api/v1/notifications/clear",
      },
    },
  });
});

// Database connection status.
router.get("/database", (_req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    success: connected,
    database: connected ? "connected" : "disconnected",
  });
});

// Mount feature routes.
router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/wallet", walletRoutes);
router.use("/notifications", notificationRoutes);

export default router;