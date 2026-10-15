import type { Request, Response } from "express";

import { connectToDatabase } from "../../../src/lib/mongodb";
import User from "../../../src/models/User";
import type { AuthenticatedRequest } from "../types/express";

/**
 * GET /api/v1/users/count
 * Get total user count (dev only)
 */
export async function getUserCount(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    await connectToDatabase();

    const count = await User.countDocuments();

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Get user count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user count",
    });
  }
}

/**
 * GET /api/v1/user/profile
 * Get authenticated user's profile
 */
export async function getUserProfile(
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

    await connectToDatabase();

    const user = await User.findById(req.user.id).lean();

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Format phone number
    const phone = user.phone || "";
    let formattedPhone = phone;
    if (phone.startsWith("+234")) {
      formattedPhone = `0${phone.slice(4)}`;
    } else if (phone.startsWith("234")) {
      formattedPhone = `0${phone.slice(3)}`;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name || "",
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        email: user.email || "",
        phone: formattedPhone,
        address: user.address || "",
        walletBalance: user.walletBalance || 0,
        accountType: user.accountType || "user",
        sellerSince: user.sellerSince || null,
        referralCode: user.referralCode || "",
        referralsCount: user.referralsCount || 0,
        referralEarnings: user.referralEarnings || 0,
      },
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load profile",
    });
  }
}

/**
 * GET /api/v1/user/settings
 * Get user settings
 */
export async function getUserSettings(
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

    await connectToDatabase();

    const user = await User.findOne({ _id: req.user.id }).select("-password");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        name: user.name || "",
        email: user.email || "",
      },
      settings: {
        notifications: user.notifications ?? true,
        emailAlerts: user.emailAlerts ?? true,
        hasPaymentPin: !!user.paymentPin,
      },
    });
  } catch (error) {
    console.error("Get user settings error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/**
 * PUT /api/v1/user/settings
 * Update user settings
 */
export async function updateUserSettings(
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

    const { name, notifications, emailAlerts, paymentPin } = req.body ?? {};

    await connectToDatabase();

    const user = await User.findOne({ _id: req.user.id });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Update profile
    if (name) {
      user.name = name;
    }

    if (typeof notifications === "boolean") {
      user.notifications = notifications;
    }

    if (typeof emailAlerts === "boolean") {
      user.emailAlerts = emailAlerts;
    }

    // Update payment pin
    if (paymentPin) {
      const bcrypt = await import("bcryptjs");
      const hashedPin = await bcrypt.hash(paymentPin, 10);
      user.paymentPin = hashedPin;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Update user settings error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
