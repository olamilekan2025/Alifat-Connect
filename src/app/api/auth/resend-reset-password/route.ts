import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { sendPasswordResetCode } from "@/lib/nodemailer";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email: string | undefined = body?.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "Missing email" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    // Use Mongoose model for users
    const user = await User.findOne({ email });

    // Native MongoDB collection for reset tokens
    const resetTokens =
      db.connection.db!.collection("passwordResetTokens");

    // Don't reveal whether the email exists
    if (!user) {
      return NextResponse.json({
        ok: true,
        message: "If the account exists, a reset email has been sent.",
      });
    }

    const secret =
      process.env.RESET_PASSWORD_SECRET ||
      "reset_password_secret";

    const token = jwt.sign(
      {
        sub: String(user._id),
        email,
      },
      secret,
      {
        expiresIn: "1h",
      }
    );

    await resetTokens.deleteMany({
      email,
      purpose: "reset-password",
    });

    await resetTokens.insertOne({
      email,
      userId: user._id,
      token,
      purpose: "reset-password",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      createdAt: new Date(),
      usedAt: null,
    });

    await sendPasswordResetCode(email, token);

    return NextResponse.json({
      ok: true,
      message: "Reset email resent successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Resend reset password failed",
      },
      { status: 500 }
    );
  }
}