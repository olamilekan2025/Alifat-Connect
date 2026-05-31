import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectToDatabase } from "@/lib/mongodb";

import User from "@/models/User";
import PasswordResetCode from "@/models/password-reset-code";

export async function POST(
  req: Request
) {
  try {
    let body;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid request body",
        },
        {
          status: 400,
        }
      );
    }

    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const code =
      typeof body?.code === "string"
        ? body.code.trim()
        : "";

    const password =
      typeof body?.password === "string"
        ? body.password
        : "";

    if (
      !email ||
      !code ||
      !password
    ) {
      return NextResponse.json(
        {
          error: "All fields are required",
        },
        {
          status: 400,
        }
      );
    }

    // Password validation
    if (
      password.length < 6 ||
      !/[A-Z]/.test(password) ||
      !/\d/.test(password) ||
      !/[\W_]/.test(password)
    ) {
      return NextResponse.json(
        {
          error:
            "Password must contain at least 6 characters, one uppercase letter, one number and one special character",
        },
        {
          status: 400,
        }
      );
    }

    await connectToDatabase();

    const user =
      await User.findOne({
        email,
      });

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    const resetCode =
      await PasswordResetCode.findOne(
        {
          email,
          code,
          purpose:
            "reset-password",
          usedAt: null,
        }
      );

    if (!resetCode) {
      return NextResponse.json(
        {
          error:
            "Invalid reset code",
        },
        {
          status: 400,
        }
      );
    }

    if (
      resetCode.expiresAt &&
      new Date() >
        new Date(
          resetCode.expiresAt
        )
    ) {
      return NextResponse.json(
        {
          error:
            "Reset code has expired",
        },
        {
          status: 400,
        }
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    user.password =
      hashedPassword;

    await user.save();

    // Mark all reset codes as used
    await PasswordResetCode.updateMany(
      {
        email,
        purpose:
          "reset-password",
        usedAt: null,
      },
      {
        $set: {
          usedAt: new Date(),
        },
      }
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Password reset successful",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "RESET PASSWORD ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}