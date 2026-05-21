import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

import { connectToDatabase } from "@/lib/mongodb";

import User from "@/models/User";

export async function POST(
  request: Request,
) {
  try {
    await connectToDatabase();

    const session =
      await getServerSession(
        authOptions,
      );

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          message:
            "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const {
      token,
      newPin,
    } = await request.json();

    if (
      !token ||
      !newPin
    ) {
      return NextResponse.json(
        {
          message:
            "All fields are required",
        },
        {
          status: 400,
        },
      );
    }

    const user =
      await User.findOne({
        email:
          session.user.email,
      });

    if (!user) {
      return NextResponse.json(
        {
          message:
            "User not found",
        },
        {
          status: 404,
        },
      );
    }

    // VERIFY TOKEN
    if (
      user.loginVerificationCode !==
      token
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid verification token",
        },
        {
          status: 400,
        },
      );
    }

    // CHECK EXPIRY
    if (
      !user.loginVerificationExpires ||
      user.loginVerificationExpires <
        new Date()
    ) {
      return NextResponse.json(
        {
          message:
            "Verification token expired",
        },
        {
          status: 400,
        },
      );
    }

    // HASH NEW PIN
    const hashedPin =
      await bcrypt.hash(
        newPin,
        10,
      );

    // UPDATE PIN
    user.paymentPin =
      hashedPin;

    // CLEAR TOKEN
    user.loginVerificationCode =
      undefined;

    user.loginVerificationExpires =
      undefined;

    await user.save();

    return NextResponse.json({
      success: true,

      message:
        "Payment PIN reset successful",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}