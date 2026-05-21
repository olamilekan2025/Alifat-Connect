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

    const { token } =
      await request.json();

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
      user.resetPinVerificationToken !==
      token
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid token",
        },
        {
          status: 400,
        },
      );
    }

    if (
      user.resetPinVerificationExpires &&
      user.resetPinVerificationExpires <
        new Date()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Token expired",
        },
        {
          status: 400,
        },
      );
    }

    user.isResetPinVerified =
      true;

    await user.save();

    return NextResponse.json({
      success: true,
      message:
        "Verification successful",
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