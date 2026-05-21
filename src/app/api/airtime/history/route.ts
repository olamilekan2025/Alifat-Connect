import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

import { connectToDatabase } from "@/lib/mongodb";

import Transaction from "@/models/transaction";

export async function GET() {
  try {
    await connectToDatabase();

    const session =
      await getServerSession(
        authOptions
      );

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const transactions =
      await Transaction.find({
        email:
          session.user.email,
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    return NextResponse.json({
      ok: true,
      transactions,
    });
  } catch (error) {
    console.error(
      "AIRTIME HISTORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch history",
      },
      {
        status: 500,
      }
    );
  }
}