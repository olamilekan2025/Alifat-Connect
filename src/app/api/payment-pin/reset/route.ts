import bcrypt from "bcryptjs";

import { NextResponse } from "next/server";

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
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const {
      newPin,
    } = await request.json();

    if (
      !/^\d{4}$/.test(
        newPin,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "PIN must be 4 digits",
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
          success: false,
          message:
            "User not found",
        },
        {
          status: 404,
        },
      );
    }

    if (
      !user.isResetPinVerified
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Verify your account before resetting PIN",
        },
        {
          status: 403,
        },
      );
    }

    const hashedPin =
      await bcrypt.hash(
        newPin,
        10,
      );

    user.paymentPin =
      hashedPin;

    user.isResetPinVerified =
      false;

    user.resetPinVerificationToken =
      null;

    user.resetPinVerificationExpires =
      null;

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
        success: false,
        message:
          "Something went wrong",
      },
      {
        status: 500,
      },
    );
  }
}