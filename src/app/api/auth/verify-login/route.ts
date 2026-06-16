import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const {
      email,
      code,
      password,
    } = await req.json();

    if (
      !email ||
      !code ||
      !password
    ) {
      return NextResponse.json(
        {
          error:
            "Email, code and password are required",
        },
        { status: 400 }
      );
    }

    const db =
      await connectToDatabase();

    const users =
      db.connection.collection(
        "users"
      );

    const loginCodes =
      db.connection.collection(
        "loginVerificationCodes"
      );

    const user =
      await users.findOne({
        email: email
          .trim()
          .toLowerCase(),
      });

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // ADMIN ONLY
    const role = String(
      user.role || ""
    ).toLowerCase();

    if (role !== "admin") {
      return NextResponse.json(
        {
          error:
            "Only admins require login verification",
        },
        { status: 403 }
      );
    }

    // ACCOUNT VERIFIED
    if (!user.emailVerified) {
      return NextResponse.json(
        {
          error:
            "Please verify your email first",
        },
        { status: 403 }
      );
    }

    // PASSWORD CHECK
    if (!user.password) {
      return NextResponse.json(
        {
          error:
            "Password not found",
        },
        { status: 400 }
      );
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return NextResponse.json(
        {
          error:
            "Invalid password",
        },
        { status: 401 }
      );
    }

    // FIND OTP
    const codeDoc =
      await loginCodes.findOne({
        email: email
          .trim()
          .toLowerCase(),
        code: code.trim(),
        purpose:
          "verify-login",
        usedAt: null,
      });

    if (!codeDoc) {
      return NextResponse.json(
        {
          error:
            "Invalid verification code",
        },
        { status: 400 }
      );
    }

    // CHECK EXPIRY
    if (
      new Date(
        codeDoc.expiresAt
      ) < new Date()
    ) {
      return NextResponse.json(
        {
          error:
            "Verification code expired",
        },
        { status: 400 }
      );
    }

    // MARK CODE USED
    await loginCodes.updateOne(
      {
        _id: codeDoc._id,
      },
      {
        $set: {
          usedAt:
            new Date(),
        },
      }
    );

    // STORE VERIFIED LOGIN FLAG
    await users.updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          adminLoginVerified:
            true,
          adminLoginVerifiedAt:
            new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      role: "admin",
      redirectTo:
        "/admin",
    });
  } catch (error) {
    console.error(
      "VERIFY LOGIN ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Verification failed",
      },
      { status: 500 }
    );
  }
}