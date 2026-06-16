import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

import User from "@/models/User";
import Transaction from "@/models/transaction";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (
      String(session.user.role).toLowerCase() !==
      "admin"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden",
        },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const [
      totalUsers,
      totalAdmins,
      verifiedUsers,

      totalTransactions,
      successfulTransactions,
      failedTransactions,
      pendingTransactions,

      walletAgg,
      revenueAgg,

      recentTransactions,
    ] = await Promise.all([
      User.countDocuments(),

      User.countDocuments({
        role: /admin/i,
      }),

      User.countDocuments({
        emailVerified: true,
      }),

      Transaction.countDocuments(),

      Transaction.countDocuments({
        status: "success",
      }),

      Transaction.countDocuments({
        status: "failed",
      }),

      Transaction.countDocuments({
        status: "pending",
      }),

      User.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: "$walletBalance",
            },
          },
        },
      ]),

      Transaction.aggregate([
        {
          $match: {
            status: "success",
            type: "debit",
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amount",
            },
          },
        },
      ]),

      Transaction.find()
        .sort({
          createdAt: -1,
        })
        .limit(10)
        .select(
          "_id reference category amount status createdAt user"
        )
        .lean(),
    ]);

    const successRate =
      totalTransactions > 0
        ? Number(
            (
              (successfulTransactions /
                totalTransactions) *
              100
            ).toFixed(2)
          )
        : 0;

    return NextResponse.json({
      success: true,

      totalUsers,

      totalAdmins,

      verifiedUsers,

      unverifiedUsers:
        totalUsers - verifiedUsers,

      totalTransactions,

      successfulTransactions,

      failedTransactions,

      pendingTransactions,

      successRate,

      totalWalletBalance:
        walletAgg?.[0]?.total ?? 0,

      totalRevenue:
        revenueAgg?.[0]?.total ?? 0,

      recentTransactions,

      lastUpdated:
        new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "Admin stats error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to load admin statistics.",
      },
      {
        status: 500,
      }
    );
  }
}