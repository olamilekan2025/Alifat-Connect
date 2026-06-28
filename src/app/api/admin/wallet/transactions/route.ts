import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/models/transaction";

export async function GET() {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch recent admin wallet transactions
    const transactions = await Transaction.find({
      userId: "ADMIN_WALLET",
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Build chart data from successful transactions
    const chartAggregations = await Transaction.aggregate([
      {
        $match: {
          userId: "ADMIN_WALLET",
          status: "success",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          Inflow: {
            $sum: {
              $cond: [
                { $eq: ["$type", "credit"] },
                "$amount",
                0,
              ],
            },
          },
          Outflow: {
            $sum: {
              $cond: [
                { $eq: ["$type", "debit"] },
                "$amount",
                0,
              ],
            },
          },
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
      {
        $limit: 30,
      },
    ]).allowDiskUse(true);

    // Reverse so charts display oldest -> newest
    const chartData = chartAggregations
      .reverse()
      .map((item) => ({
        date: item._id,
        Inflow: Number(item.Inflow || 0),
        Outflow: Number(item.Outflow || 0),
      }));

    return NextResponse.json(
      {
        success: true,
        transactions,
        chartData,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Admin wallet transactions error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load wallet transactions.",
      },
      {
        status: 500,
      }
    );
  }
}