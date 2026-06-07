import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

import User from "@/models/User";

const plans = {
  monthly: {
    price: 2500,
    durationDays: 30,
  },

  quarterly: {
    price: 6500,
    durationDays: 90,
  },

  yearly: {
    price: 22000,
    durationDays: 365,
  },
};

export async function POST(
  request: Request
) {
  try {
    await connectToDatabase();

    const session =
      await getServerSession(
        authOptions
      );

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { planId } =
      await request.json();

    if (
      !planId ||
      !(planId in plans)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid subscription plan.",
        },
        { status: 400 }
      );
    }

    const user =
      await User.findOne({
        email: session.user.email,
      });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User not found",
        },
        { status: 404 }
      );
    }

    const plan =
      plans[
        planId as keyof typeof plans
      ];

    const walletBalance =
      user.walletBalance || 0;

    if (
      walletBalance <
      plan.price
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Insufficient wallet balance",
        },
        { status: 400 }
      );
    }

    user.walletBalance =
      walletBalance -
      plan.price;

    user.subscriptionType =
      planId;

    user.subscriptionActive =
      true;

    const expiryDate =
      new Date();

    expiryDate.setDate(
      expiryDate.getDate() +
        plan.durationDays
    );

    user.subscriptionExpires =
      expiryDate;

    await user.save();

    return NextResponse.json({
      success: true,

      message:
        "Subscription activated successfully",

      data: {
        walletBalance:
          user.walletBalance,

        subscriptionType:
          planId,

        expiryDate,
      },
    });
  } catch (error) {
    console.error(
      "Subscription Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Internal server error",
      },
      { status: 500 }
    );
  }
}