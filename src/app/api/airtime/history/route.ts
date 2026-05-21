import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

import { connectToDatabase } from "@/lib/mongodb";

import User from "@/models/User";

import Transaction from "@/models/transaction";

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
          message:
            "User not found",
        },
        {
          status: 404,
        },
      );
    }

   const transactions =
  await Transaction.find({
    userId:
      user._id.toString(),

    description: {
      $regex: "airtime",
      $options: "i",
    },
  })
    .sort({
      createdAt: -1,
    })
    .limit(20)
    .lean();

return NextResponse.json(
  {
    success: true,
    transactions,
  },
  {
    status: 200,
  },
);
  } catch (error) {
    console.error(
      "Airtime History Error:",
      error,
    );

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