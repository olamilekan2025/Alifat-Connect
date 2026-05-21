import { NextResponse } from "next/server";

import crypto from "crypto";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

import { connectToDatabase } from "@/lib/mongodb";

import User from "@/models/User";

import { sendPaymentPinResetCode } from "@/lib/nodemailer";

export async function POST() {
  try {
    await connectToDatabase();

    const session =
      await getServerSession(
        authOptions,
      );

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized",
        },
        {
          status: 401,
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
          success: false,
          message:
            "User not found",
        },
        {
          status: 404,
        },
      );
    }

    // GENERATE TOKEN
    const token =
      crypto
        .randomInt(
          100000,
          999999,
        )
        .toString();

    // SAVE TOKEN
    user.loginVerificationCode =
      token;

    user.loginVerificationExpires =
      new Date(
        Date.now() +
          1000 *
            60 *
            10,
      );

    await user.save();

    // SEND EMAIL
    const emailSent =
      await sendPaymentPinResetCode(
        user.email,
        token,
      );

    // CHECK IF EMAIL FAILED
    if (!emailSent) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Failed to send verification email",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Verification token sent successfully",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "SEND TOKEN ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}