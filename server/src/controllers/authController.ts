import type { Request, Response } from "express";
import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";

import { connectToDatabase } from "../../../src/lib/mongodb";
import { sendEmailVerificationCode } from "../../../src/lib/nodemailer";
import { createReservedAccount } from "../../../src/lib/monnify";
import { generateReferralCode } from "../../../src/lib/referral";
import { processReferral } from "../../../src/lib/referral-tracking";

import User from "../../../src/models/User";
import VirtualAccount from "../../../src/models/VirtualAccount";

const EMAIL_CODE_TTL_MS = 10 * 60 * 1000;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function createVerificationCode(): string {
  return randomInt(100000, 1000000).toString();
}

/**
 * POST /api/v1/auth/register
 */
export async function registerUser(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const {
      firstname,
      lastname,
      address,
      phone,
      email,
      password,
      referralCode,
    } = req.body ?? {};

    if (
      typeof firstname !== "string" ||
      typeof lastname !== "string" ||
      typeof address !== "string" ||
      typeof phone !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      res.status(400).json({
        success: false,
        message: "Please provide all required registration fields.",
      });
      return;
    }

    const cleanFirstname = firstname.trim();
    const cleanLastname = lastname.trim();
    const cleanAddress = address.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = normalizeEmail(email);

    if (
      !cleanFirstname ||
      !cleanLastname ||
      !cleanAddress ||
      !cleanPhone ||
      !cleanEmail ||
      !password.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "All registration fields are required.",
      });
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters.",
      });
      return;
    }

    if (cleanFirstname.length > 50 || cleanLastname.length > 50) {
      res.status(400).json({
        success: false,
        message: "First name and last name must not exceed 50 characters.",
      });
      return;
    }

    await connectToDatabase();

    const existingUser = await User.findOne({
      email: cleanEmail,
    }).lean();

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
      return;
    }

    const fullName = `${cleanFirstname} ${cleanLastname}`;
    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationCode = createVerificationCode();
    const verificationExpires = new Date(
      Date.now() + EMAIL_CODE_TTL_MS,
    );

    const user = await User.create({
      firstname: cleanFirstname,
      lastname: cleanLastname,
      name: fullName,
      address: cleanAddress,
      phone: cleanPhone,
      email: cleanEmail,
      password: hashedPassword,
      role: "user",
      accountType: "user",
      walletBalance: 0,
      emailVerified: false,
      referralCode: generateReferralCode(
        `${cleanFirstname}${cleanLastname}`,
      ),
      loginVerificationCode: verificationCode,
      loginVerificationExpires: verificationExpires,
    });

    // Referral processing must not undo a successful registration.
    if (typeof referralCode === "string" && referralCode.trim()) {
      try {
        await processReferral(
          user._id.toString(),
          referralCode.trim(),
        );
      } catch (error: unknown) {
        console.error("Referral processing failed:", error);
      }
    }

    // Monnify account creation is best-effort.
    try {
      const monnifyAccount = await createReservedAccount({
        email: cleanEmail,
        name: fullName,
      });

      if (
        Array.isArray(monnifyAccount?.accounts) &&
        monnifyAccount.accounts.length > 0
      ) {
        const firstBank = monnifyAccount.accounts[0];

        await VirtualAccount.create({
          userId: user._id,
          bankName: firstBank.bankName,
          accountName: monnifyAccount.accountName,
          accountNumber: firstBank.accountNumber,
          provider: "Monnify",
        });
      } else {
        console.warn("Monnify did not return a bank account.");
      }
    } catch (error: unknown) {
      console.error("Monnify account creation failed:", error);
    }

    let verificationEmailSent = false;

    try {
      verificationEmailSent = await sendEmailVerificationCode(
        cleanEmail,
        verificationCode,
      );
    } catch (error: unknown) {
      console.error("Verification email delivery failed:", error);
    }

    if (!verificationEmailSent) {
      res.status(201).json({
        success: true,
        message:
          "Your account was created, but the verification email could not be sent. Please request a new code.",
        data: {
          email: cleanEmail,
          verificationEmailSent: false,
        },
      });
      return;
    }

    res.status(201).json({
      success: true,
      message:
        "Registration successful. Check your email for the verification code.",
      data: {
        email: cleanEmail,
        verificationEmailSent: true,
      },
    });
  } catch (error: unknown) {
    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "An unexpected error occurred during registration.",
    });
  }
}

/**
 * POST /api/v1/auth/verify-email
 */
export async function verifyUserEmail(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { email, code } = req.body ?? {};

    if (typeof email !== "string" || typeof code !== "string") {
      res.status(400).json({
        success: false,
        message: "Email and verification code are required.",
      });
      return;
    }

    const cleanEmail = normalizeEmail(email);
    const cleanCode = code.trim();

    if (!isValidEmail(cleanEmail)) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
      return;
    }

    if (!/^\d{6}$/.test(cleanCode)) {
      res.status(400).json({
        success: false,
        message: "The verification code must contain exactly 6 digits.",
      });
      return;
    }

    await connectToDatabase();

    const user = await User.findOne({
      email: cleanEmail,
    }).select("+loginVerificationCode +loginVerificationExpires");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "No account was found with this email address.",
      });
      return;
    }

    if (user.emailVerified) {
      res.status(200).json({
        success: true,
        message: "Your email address is already verified.",
      });
      return;
    }

    const savedCode = user.loginVerificationCode;
    const expiresAt = user.loginVerificationExpires;

    if (!savedCode || !expiresAt) {
      res.status(400).json({
        success: false,
        message:
          "No active email verification code was found. Please request a new one.",
      });
      return;
    }

    if (new Date(expiresAt).getTime() <= Date.now()) {
      res.status(400).json({
        success: false,
        message:
          "Your verification code has expired. Please request a new one.",
      });
      return;
    }

    if (savedCode !== cleanCode) {
      res.status(400).json({
        success: false,
        message: "The verification code is incorrect.",
      });
      return;
    }

    user.emailVerified = true;
    user.loginVerificationCode = undefined;
    user.loginVerificationExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully. Your account is now verified.",
    });
  } catch (error: unknown) {
    console.error("Email verification error:", error);

    res.status(500).json({
      success: false,
      message: "An unexpected error occurred while verifying your email.",
    });
  }
}

/**
 * POST /api/v1/auth/resend-verification
 */
export async function resendVerificationCode(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { email } = req.body ?? {};

    if (typeof email !== "string" || !email.trim()) {
      res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
      return;
    }

    const cleanEmail = normalizeEmail(email);

    if (!isValidEmail(cleanEmail)) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
      return;
    }

    await connectToDatabase();

    const user = await User.findOne({
      email: cleanEmail,
    }).select("+loginVerificationCode +loginVerificationExpires");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "No account was found with this email address.",
      });
      return;
    }

    if (user.emailVerified) {
      res.status(400).json({
        success: false,
        message: "This email address has already been verified.",
      });
      return;
    }

    const verificationCode = createVerificationCode();
    let emailSent = false;

    // Send first; only replace the saved code if delivery succeeds.
    try {
      emailSent = await sendEmailVerificationCode(
        cleanEmail,
        verificationCode,
      );
    } catch (error: unknown) {
      console.error("Resend verification email failed:", error);
    }

    if (!emailSent) {
      res.status(503).json({
        success: false,
        message:
          "We could not send the verification email. Please try again later.",
      });
      return;
    }

    user.loginVerificationCode = verificationCode;
    user.loginVerificationExpires = new Date(
      Date.now() + EMAIL_CODE_TTL_MS,
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: "A new verification code has been sent to your email.",
    });
  } catch (error: unknown) {
    console.error("Resend verification code error:", error);

    res.status(500).json({
      success: false,
      message:
        "An unexpected error occurred while resending the verification code.",
    });
  }
}

/**
 * POST /api/v1/auth/check-email-verification
 */
export async function checkEmailVerification(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { email } = req.body ?? {};

    if (typeof email !== "string" || !email.trim()) {
      res.status(400).json({
        error: "Email is required",
      });
      return;
    }

    const cleanEmail = normalizeEmail(email);

    if (!isValidEmail(cleanEmail)) {
      res.status(400).json({
        error: "Please provide a valid email address.",
      });
      return;
    }

    await connectToDatabase();

    const user = await User.findOne({
      email: cleanEmail,
    }).select("emailVerified");

    if (!user) {
      res.status(404).json({
        error: "User not found",
      });
      return;
    }

    res.status(200).json({
      emailVerified: user.emailVerified === true,
    });
  } catch (error: unknown) {
    console.error("Check email verification error:", error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
}
