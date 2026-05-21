import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { sendPasswordResetCode } from "@/lib/nodemailer";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email: string | undefined = body?.email;

    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

    const db = await connectToDatabase();
    const users = db.collection("users");
    const resetTokens = db.collection("passwordResetTokens");

    const user = await users.findOne({ email });
    if (!user) return NextResponse.json({ ok: true, message: "If account exists, email sent" });

    const secret = process.env.RESET_PASSWORD_SECRET || "reset_password_secret";
    const token = jwt.sign({ sub: String(user._id), email }, secret, { expiresIn: 60 * 60 });

    await resetTokens.deleteMany({ email, purpose: "reset-password" });

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

    return NextResponse.json({ ok: true, message: "Reset email resent" });
  } catch {
    return NextResponse.json({ error: "Resend reset password failed" }, { status: 500 });
  }
}

