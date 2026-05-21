import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { sendLoginVerificationCode } from "@/lib/nodemailer";

const LOGIN_CODE_TTL_MS = 5 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email: string | undefined = body?.email;

    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

    const db = await connectToDatabase();
    const users = db.collection("users");
    const loginCodes = db.collection("loginVerificationCodes");

    const user = await users.findOne({ email });
    if (!user) return NextResponse.json({ ok: true, message: "If account exists, code sent" });

    if (!user.emailVerified) {
      return NextResponse.json({ error: "Please verify your email" }, { status: 403 });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + LOGIN_CODE_TTL_MS);

    await loginCodes.deleteMany({ email, purpose: "verify-login" });

    await loginCodes.insertOne({
      email,
      userId: user._id,
      code,
      purpose: "verify-login",
      expiresAt,
      createdAt: new Date(),
      usedAt: null,
    });

    await sendLoginVerificationCode(email, code);

    return NextResponse.json({ ok: true, message: "Login code resent" });
  } catch {
    return NextResponse.json({ error: "Resend login code failed" }, { status: 500 });
  }
}

