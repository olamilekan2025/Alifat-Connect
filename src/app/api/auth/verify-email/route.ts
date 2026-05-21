import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";

import User from "@/models/User";

export async function POST(
  req: Request
) {
  try {
    const body = await req.json();

    const email = body?.email
      ?.trim()
      ?.toLowerCase();

    const code =
      body?.code?.trim();

    if (!email || !code) {
      return NextResponse.json(
        {
          error:
            "Email and code are required",
        },
        {
          status: 400,
        }
      );
    }

    await connectToDatabase();

    // FIND USER

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

    // CHECK CODE

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

    // CHECK EXPIRATION

    if (
      !user.loginVerificationExpires ||
      new Date() >
        user.loginVerificationExpires
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

    // VERIFY USER

    user.emailVerified = true;

    user.loginVerificationCode =
      undefined;

    user.loginVerificationExpires =
      undefined;

    await user.save();

    return NextResponse.json(
      {
        ok: true,

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