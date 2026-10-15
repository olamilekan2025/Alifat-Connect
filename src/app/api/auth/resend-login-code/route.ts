
import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { sendLoginVerificationCode } from "@/lib/nodemailer";

const LOGIN_CODE_TTL_MS = 5 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase();

    if (
      !email ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    const users = db.connection.collection("users");
    const loginCodes = db.connection.collection(
      "loginVerificationCodes"
    );

    const user = await users.findOne({ email });

    // Avoid revealing whether a particular email has an account.
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "If the account is eligible, a verification code will be sent.",
      });
    }

    if (String(user.role ?? "").toLowerCase() !== "admin") {
      return NextResponse.json(
        { error: "This account cannot request an admin login code." },
        { status: 403 }
      );
    }

    if (user.emailVerified !== true) {
      return NextResponse.json(
        { error: "Please verify your email address first." },
        { status: 403 }
      );
    }

    // Generate a cryptographically secure six-digit code.
    const code = randomInt(100000, 1000000).toString();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + LOGIN_CODE_TTL_MS);

    // Invalidate previous unused codes for this login flow.
    await loginCodes.updateMany(
      {
        email,
        purpose: "verify-login",
        usedAt: null,
      },
      {
        $set: { usedAt: now },
      }
    );

    const inserted = await loginCodes.insertOne({
      email,
      userId: user._id,
      code,
      purpose: "verify-login",
      createdAt: now,
      expiresAt,
      usedAt: null,
    });

    const emailSent = await sendLoginVerificationCode(email, code);

    if (!emailSent) {
      // Do not leave a usable code behind if email delivery fails.
      await loginCodes.updateOne(
        { _id: inserted.insertedId, usedAt: null },
        { $set: { usedAt: new Date() } }
      );

      return NextResponse.json(
        {
          error:
            "Unable to send the verification email. Please try again later.",
        },
        { status: 500 }
      );
    }

    // Never log the OTP itself.
    return NextResponse.json({
      success: true,
      message: "A new login verification code has been sent.",
    });
  } catch (error) {
    console.error("RESEND LOGIN CODE ERROR:", error);

    return NextResponse.json(
      { error: "Failed to resend the login verification code." },
      { status: 500 }
    );
  }
}
