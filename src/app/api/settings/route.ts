import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

import { connectToDatabase } from "@/lib/mongodb";

import User from "@/models/User";


// GET SETTINGS
export async function GET() {
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

    const user =
      await User.findOne({
        email:
          session.user.email,
      }).select("-password");

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

    return NextResponse.json({
      success: true,

      user: {
        name:
          user.name || "",

        email:
          user.email || "",
      },

      settings: {
        notifications:
          user.notifications ??
          true,

        emailAlerts:
          user.emailAlerts ??
          true,

        hasPaymentPin:
          !!user.paymentPin,
      },
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


// UPDATE SETTINGS
export async function PUT(
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

    const body =
      await request.json();

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

    // UPDATE PROFILE
    if (body.name) {
      user.name =
        body.name;
    }

    if (
      typeof body.notifications ===
      "boolean"
    ) {
      user.notifications =
        body.notifications;
    }

    if (
      typeof body.emailAlerts ===
      "boolean"
    ) {
      user.emailAlerts =
        body.emailAlerts;
    }

    // UPDATE PAYMENT PIN
    if (body.paymentPin) {
      const hashedPin =
        await bcrypt.hash(
          body.paymentPin,
          10,
        );

      user.paymentPin =
        hashedPin;
    }

    await user.save();

    return NextResponse.json({
      success: true,

      message:
        "Settings updated successfully",
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