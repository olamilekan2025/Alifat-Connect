import type { Request, Response } from "express";
import bcrypt from "bcryptjs";

import { connectToDatabase } from "../../../src/lib/mongodb";
import { sendPasswordResetCode } from "../../../src/lib/nodemailer";
import User from "../../../src/models/User";
import PasswordResetCode from "../../../src/models/password-reset-code";

const RESET_CODE_TTL_MS = 10 * 60 * 1000;

/**
 * POST /api/v1/auth/forgot-password
 */
export async function forgotPassword(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { email } = req.body ?? {};

    if (typeof email !== "string" || !email.trim()) {
      res.status(400).json({
        success: false,
        message: "Email is required",
      });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    await connectToDatabase();

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Account does not exist",
      });
      return;
    }

    // Delete old unused codes
    await PasswordResetCode.deleteMany({
      email: cleanEmail,
      usedAt: null,
    });

    // Generate 6 digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + RESET_CODE_TTL_MS);

    // Save reset code
    await PasswordResetCode.create({
      email: cleanEmail,
      code,
      purpose: "reset-password",
      expiresAt,
      createdAt: new Date(),
      usedAt: null,
    });

    // Send email
    await sendPasswordResetCode(cleanEmail, code);

    res.status(200).json({
      success: true,
      email: cleanEmail,
      redirectTo: `/auth/reset-password?email=${encodeURIComponent(cleanEmail)}`,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Forgot password failed",
    });
  }
}

/**
 * POST /api/v1/auth/reset-password
 */
export async function resetPassword(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { email, code, password } = req.body ?? {};

    if (
      typeof email !== "string" ||
      typeof code !== "string" ||
      typeof password !== "string"
    ) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    // Password validation
    if (
      password.length < 6 ||
      !/[A-Z]/.test(password) ||
      !/\d/.test(password) ||
      !/[\W_]/.test(password)
    ) {
      res.status(400).json({
        success: false,
        message:
          "Password must contain at least 6 characters, one uppercase letter, one number and one special character",
      });
      return;
    }

    await connectToDatabase();

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const resetCode = await PasswordResetCode.findOne({
      email: cleanEmail,
      code: cleanCode,
      purpose: "reset-password",
      usedAt: null,
    });

    if (!resetCode) {
      res.status(400).json({
        success: false,
        message: "Invalid reset code",
      });
      return;
    }

    if (resetCode.expiresAt && new Date() > new Date(resetCode.expiresAt)) {
      res.status(400).json({
        success: false,
        message: "Reset code has expired",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save();

    // Mark all reset codes as used
    await PasswordResetCode.updateMany(
      {
        email: cleanEmail,
        purpose: "reset-password",
        usedAt: null,
      },
      {
        $set: {
          usedAt: new Date(),
        },
      },
    );

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
