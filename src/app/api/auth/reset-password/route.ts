

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
          error:
            "Invalid request body",
        },
        {
          status: 400,
        }
      );
    }

    const email =
      body?.email
        ?.trim()
        ?.toLowerCase();

    const code =
      body?.code?.trim();

    const password =
      body?.password;

    if (
      !email ||
      !code ||
      !password
    ) {
      return NextResponse.json(
        {
          error:
            "All fields are required",
        },
        {
          status: 400,
        }
      );
    }

    await connectToDatabase();

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
      new Date() >
      new Date(
        resetCode.expiresAt
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Reset code expired",
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

    await User.updateOne(
      { email },
      {
        $set: {
          password:
            hashedPassword,
        },
      }
    );

    resetCode.usedAt =
      new Date();

    await resetCode.save();

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(
      "RESET PASSWORD ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Reset failed",
      },
      {
        status: 500,
      }
    );
  }
}