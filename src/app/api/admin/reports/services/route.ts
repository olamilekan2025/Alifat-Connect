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
    const { startDate, endDate } = getDateRange(period);

    await connectToDatabase();

    // Service performance breakdown
    const servicePerformance = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          category: { $in: ["airtime", "data", "electricity", "cable", "recharge-card", "education"] }
        }
      },
      {
        $group: {
          _id: "$category",
          totalTransactions: { $sum: 1 },
          totalVolume: { $sum: "$amount" },
          successfulTransactions: {
            $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] }
          },
          failedTransactions: {
            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] }
          },
          pendingTransactions: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
          },
          revenue: {
            $sum: { $cond: [{ $eq: ["$status", "success"] }, "$amount", 0] }
          }
        }
      },
      {
        $addFields: {
          successRate: {
            $cond: [
              { $eq: ["$totalTransactions", 0] },
              0,
              { $multiply: [{ $divide: ["$successfulTransactions", "$totalTransactions"] }, 100] }
            ]
          },
          failureRate: {
            $cond: [
              { $eq: ["$totalTransactions", 0] },
              0,
              { $multiply: [{ $divide: ["$failedTransactions", "$totalTransactions"] }, 100] }
            ]
          }
        }
      },
      {
        $sort: { revenue: -1 }
      }
    ]);

    // Network performance for airtime and data
    const networkPerformance = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          category: { $in: ["airtime", "data"] },
          network: { $exists: true, $ne: "" }
        }
      },
      {
        $group: {
          _id: { category: "$category", network: "$network" },
          totalTransactions: { $sum: 1 },
          totalVolume: { $sum: "$amount" },
          successfulTransactions: {
            $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] }
          },
          failedTransactions: {
            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] }
          },
          revenue: {
            $sum: { $cond: [{ $eq: ["$status", "success"] }, "$amount", 0] }
          }
        }
      },
      {
        $addFields: {
          successRate: {
            $cond: [
              { $eq: ["$totalTransactions", 0] },
              0,
              { $multiply: [{ $divide: ["$successfulTransactions", "$totalTransactions"] }, 100] }
            ]
          }
        }
      },
      {
        $sort: { revenue: -1 }
      }
    ]);

    // Popular data plans
    const popularDataPlans = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          category: "data",
          plan: { $exists: true, $ne: "" },
          status: "success"
        }
      },
      {
        $group: {
          _id: "$plan",
          transactions: { $sum: 1 },
          totalVolume: { $sum: "$amount" },
          revenue: { $sum: "$amount" }
        }
      },
      {
        $sort: { transactions: -1 }
      },
      {
        $limit: 20
      }
    ]);

    // Provider performance (if provider field exists)
    const providerPerformance = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          provider: { $exists: true, $ne: "" }
        }
      },
      {
        $group: {
          _id: "$provider",
          totalRequests: { $sum: 1 },
          successfulRequests: {
            $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] }
          },
          failedRequests: {
            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] }
          },
          pendingRequests: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
          }
        }
      },
      {
        $addFields: {
          successRate: {
            $cond: [
              { $eq: ["$totalRequests", 0] },
              0,
              { $multiply: [{ $divide: ["$successfulRequests", "$totalRequests"] }, 100] }
            ]
          }
        }
      },
      {
        $sort: { totalRequests: -1 }
      }
    ]);

    return NextResponse.json({
      success: true,
      period,
      servicePerformance,
      networkPerformance,
      popularDataPlans,
      providerPerformance,
    });
  } catch (error) {
    console.error("Service reports error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch service reports" },
      { status: 500 }
    );
  }
}
