import { NextResponse } from "next/server";
import { compare } from "bcrypt-ts"; // Safe for all Production/Serverless/Edge runtimes
import { connectToDatabase } from "@/lib/mongodb";
import { sendLoginVerificationCode } from "@/lib/nodemailer";

// ==========================================
// 1. POST: VERIFY CODE & PASSWORD
// ==========================================
export async function POST(req: Request) {
  try {
    const { email, code, password } = await req.json();

    if (!email || !code || !password) {
      return NextResponse.json(
        { error: "Email, code and password are required" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const users = db.connection.collection("users");
    const loginCodes = db.connection.collection("loginVerificationCodes");

    const user = await users.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ADMIN ONLY
    const role = String(user.role || "").toLowerCase();
    if (role !== "admin") {
      return NextResponse.json(
        { error: "Only admins require login verification" },
        { status: 403 }
      );
    }

    // ACCOUNT VERIFIED
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email first" },
        { status: 403 }
      );
    }

    // PASSWORD CHECK
    if (!user.password) {
      return NextResponse.json(
        { error: "Password not found" },
        { status: 400 }
      );
    }

    // Fixed compare using production-stable package
    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // FIND OTP
    const codeDoc = await loginCodes.findOne({
      email: email.trim().toLowerCase(),
      code: code.trim(),
      purpose: "verify-login",
      usedAt: null,
    });

    if (!codeDoc) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // CHECK EXPIRY
    if (new Date(codeDoc.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Verification code expired" },
        { status: 400 }
      );
    }

    // MARK CODE USED
    await loginCodes.updateOne(
      { _id: codeDoc._id },
      { $set: { usedAt: new Date() } }
    );

    // STORE VERIFIED LOGIN FLAG
    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          adminLoginVerified: true,
          adminLoginVerifiedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      role: "admin",
      redirectTo: "/admin",
    });
  } catch (error) {
    console.error("VERIFY LOGIN ERROR:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}

// ==========================================
// 2. GET: RESEND VERIFICATION CODE
// ==========================================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const db = await connectToDatabase();

    const users = db.connection.collection("users");
    const loginCodes = db.connection.collection(
      "loginVerificationCodes"
    );

    // Verify user exists
    const user = await users.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Admin only
    if (String(user.role || "").toLowerCase() !== "admin") {
      return NextResponse.json(
        {
          error:
            "Only admins can receive login verification codes",
        },
        { status: 403 }
      );
    }

    // Email must already be verified
    if (!user.emailVerified) {
      return NextResponse.json(
        {
          error: "Please verify your email first",
        },
        { status: 403 }
      );
    }

    // Generate OTP
    const newCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // Invalidate previous unused codes
    await loginCodes.updateMany(
      {
        email: normalizedEmail,
        purpose: "verify-login",
        usedAt: null,
      },
      {
        $set: {
          usedAt: new Date(),
        },
      }
    );

    // Save new code
    await loginCodes.insertOne({
      email: normalizedEmail,
      code: newCode,
      purpose: "verify-login",
      createdAt: new Date(),
      expiresAt,
      usedAt: null,
    });


    const sent =
  await sendLoginVerificationCode(
    normalizedEmail,
    newCode
  );

if (!sent) {
  return NextResponse.json(
    {
      error:
        "Failed to send verification email.",
    },
    { status: 500 }
  );
}

    // ==================================================
    // SEND EMAIL HERE USING YOUR EXISTING EMAIL FUNCTION
    //
    // Example:
    //
    // await sendEmail({
    //   to: normalizedEmail,
    //   subject: "Admin Login Verification Code",
    //   html: `<p>Your verification code is <strong>${newCode}</strong></p>`,
    // });
    //
    // ==================================================

    // Temporary development log
    console.log(
      `Admin login OTP for ${normalizedEmail}: ${newCode}`
    );

    return NextResponse.json({
      success: true,
      message: "Verification code generated successfully.",
    });
  } catch (error) {
    console.error(
      "RESEND CODE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to resend code",
      },
      { status: 500 }
    );
  }
}