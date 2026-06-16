import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { sendLoginVerificationCode } from "@/lib/nodemailer";

const LOGIN_CODE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const normalizedEmail = String(body?.email ?? "")
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      return NextResponse.json(
        { error: "Missing email" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    const users = db.connection.collection("users");
    const loginCodes = db.connection.collection(
      "loginVerificationCodes"
    );

    // Find user
    const user = await users.findOne({
      email: normalizedEmail,
    });

    // Prevent email enumeration
    if (!user) {
      return NextResponse.json({
        ok: true,
        message:
          "If the account exists, a verification code has been sent.",
      });
    }

    // Admin only
    if (String(user.role || "").toLowerCase() !== "admin") {
      return NextResponse.json(
        {
          error:
            "Only administrators can request a login verification code.",
        },
        { status: 403 }
      );
    }

    // Email must already be verified
    if (!user.emailVerified) {
      return NextResponse.json(
        {
          error:
            "Please verify your email address first.",
        },
        { status: 403 }
      );
    }

    // Generate new 6-digit code
    const code = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const expiresAt = new Date(
      Date.now() + LOGIN_CODE_TTL_MS
    );

    // Remove previous login codes
    await loginCodes.deleteMany({
      email: normalizedEmail,
      purpose: "verify-login",
    });

    // Save new code
    await loginCodes.insertOne({
      email: normalizedEmail,
      userId: user._id,
      code,
      purpose: "verify-login",
      expiresAt,
      createdAt: new Date(),
      usedAt: null,
    });

    // Send email
    const emailSent =
      await sendLoginVerificationCode(
        normalizedEmail,
        code
      );

    if (!emailSent) {
      console.error(
        `Failed to send login verification email to ${normalizedEmail}`
      );

      return NextResponse.json(
        {
          error:
            "Unable to send verification email. Please try again later.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message:
        "Login verification code sent successfully.",
    });
  } catch (error) {
    console.error(
      "RESEND LOGIN CODE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to resend login verification code.",
      },
      { status: 500 }
    );
  }
}