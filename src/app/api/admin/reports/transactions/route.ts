import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/models/transaction";

function isAdmin(session: { user?: { role?: string } } | null) {
  return String(session?.user?.role || "").toLowerCase() === "admin";
}

function getDateRange(period: string) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case "today":
      return { startDate: startOfDay, endDate: now };
    case "7days":
      return { 
        startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), 
        endDate: now 
      };
    case "30days":
      return { 
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), 
        endDate: now 
      };
    case "90days":
      return { 
        startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), 
        endDate: now 
      };
    case "thismonth":
      return { 
        startDate: new Date(now.getFullYear(), now.getMonth(), 1), 
        endDate: now 
      };
    case "lastmonth":
      return { 
        startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1), 
        endDate: new Date(now.getFullYear(), now.getMonth(), 0) 
      };
    case "thisyear":
      return { 
        startDate: new Date(now.getFullYear(), 0, 1), 
        endDate: now 
      };
    case "alltime":
    default:
      return { startDate: new Date(0), endDate: now };
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (!isAdmin(session)) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "30days";
    const granularity = searchParams.get("granularity") || "daily";
    const { startDate, endDate } = getDateRange(period);

    await connectToDatabase();

    // Transaction status breakdown
    const statusBreakdown = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    // Transaction volume over time
    let groupBy;
    switch (granularity) {
      case "hourly":
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
          hour: { $hour: "$createdAt" }
        };
        break;
      case "weekly":
        groupBy = {
          year: { $year: "$createdAt" },
          week: { $week: "$createdAt" }
        };
        break;
      case "monthly":
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        };
        break;
      case "daily":
      default:
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" }
        };
    }

    const volumeOverTime = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          totalTransactions: { $sum: 1 },
          totalVolume: { $sum: "$amount" },
          successfulTransactions: {
            $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] }
          },
          failedTransactions: {
            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] }
          }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    // Summary statistics
    const [
      totalTransactions,
      successfulTransactions,
      failedTransactions,
      pendingTransactions,
      processingTransactions,
      totalVolume,
      avgTransactionValue,
    ] = await Promise.all([
      Transaction.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
      Transaction.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        status: "success" 
      }),
      Transaction.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        status: "failed" 
      }),
      Transaction.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        status: "pending" 
      }),
      Transaction.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        status: "processing" 
      }),
      Transaction.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: "success"
          }
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: "success"
          }
        },
        { $group: { _id: null, avg: { $avg: "$amount" } } },
      ]),
    ]);

    const successRate = totalTransactions > 0 
      ? ((successfulTransactions / totalTransactions) * 100).toFixed(1) 
      : "0";
    const failureRate = totalTransactions > 0 
      ? ((failedTransactions / totalTransactions) * 100).toFixed(1) 
      : "0";
    const pendingRate = totalTransactions > 0 
      ? ((pendingTransactions / totalTransactions) * 100).toFixed(1) 
      : "0";

    return NextResponse.json({
      success: true,
      period,
      granularity,
      summary: {
        totalTransactions,
        successfulTransactions,
        failedTransactions,
        pendingTransactions,
        processingTransactions,
        totalVolume: totalVolume[0]?.total || 0,
        avgTransactionValue: avgTransactionValue[0]?.avg || 0,
        successRate,
        failureRate,
        pendingRate,
      },
      statusBreakdown,
      volumeOverTime,
    });
  } catch (error) {
    console.error("Transaction reports error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch transaction reports" },
      { status: 500 }
    );
  }
}
