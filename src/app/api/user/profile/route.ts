import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await connectToDatabase();

    const session =
      await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const user = await User.findOne({
      email: session.user.email,
    }).lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        walletBalance:
          user.walletBalance || 0,
        accountType:
          user.accountType || "user",
        sellerSince:
          user.sellerSince || null,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load profile",
      },
      { status: 500 }
    );
  }
}