import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";

import User from "@/models/User";

export async function POST(
  req: Request
) {
  try {
    const body = await req.json();

    const email =
      typeof body?.email === "string"
        ? body.email
            .trim()
            .toLowerCase()
        : "";

    const code =
      typeof body?.code === "string"
        ? body.code.trim()
        : "";

    if (!email || !code) {
      return NextResponse.json(
        {
          error:
            "Email and verification code are required",
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

    if (
      !user.loginVerificationCode
    ) {
      return NextResponse.json(
        {
          error:
            "No verification code found",
        },
        {
          status: 400,
        }
      );
    }

    if (
      user.loginVerificationCode !==
      code
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid verification code",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !user.loginVerificationExpires
    ) {
      return NextResponse.json(
        {
          error:
            "Verification code expired",
        },
        {
          status: 400,
        }
      );
    }

    const isExpired =
      new Date(
        user.loginVerificationExpires
      ).getTime() < Date.now();

    if (isExpired) {
      return NextResponse.json(
        {
          error:
            "Verification code expired",
        },
        {
          status: 400,
        }
      );
    }

    user.emailVerified = true;

    user.loginVerificationCode =
      undefined;

    user.loginVerificationExpires =
      undefined;

    await user.save();

    return NextResponse.json(
      {
        success: true,

        message:
          "Email verified successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "VERIFY EMAIL ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Verification failed",
      },
      {
        status: 500,
      }
    );
  }
}