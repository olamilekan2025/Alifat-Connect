import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

import User from "@/models/User";

export async function GET() {
  try {
    await connectToDatabase();

    const session = await getServerSession(
      authOptions
    );

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const user = await User.findOne({
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      balance: Number(
        user.walletBalance || 0
      ),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch balance",
      },
      { status: 500 }
    );
  }
}