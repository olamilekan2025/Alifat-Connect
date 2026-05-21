import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

import { connectToDatabase } from "@/lib/mongodb";

import User from "@/models/User";

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
          message: "Unauthorized",
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

    const verificationToken =
      Math.floor(
        100000 +
          Math.random() * 900000,
      ).toString();

    user.resetPinVerificationToken =
      verificationToken;

    user.resetPinVerificationExpires =
      new Date(
        Date.now() +
          10 * 60 * 1000,
      );

    user.isResetPinVerified =
      false;

    await user.save();

    // SEND EMAIL HERE

    return NextResponse.json({
      success: true,
      message:
        "Verification token sent",
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