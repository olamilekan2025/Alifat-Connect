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

    // Revenue breakdown by service
    const serviceRevenue = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: "success",
          type: "debit",
          category: { $in: ["airtime", "data", "electricity", "cable", "recharge-card", "education"] }
        }
      },
      {
        $group: {
          _id: "$category",
          revenue: { $sum: "$amount" },
          transactions: { $sum: 1 },
          avgTransaction: { $avg: "$amount" }
        }
      },
      {
        $sort: { revenue: -1 }
      }
    ]);

    // Revenue over time for chart
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

    const revenueOverTime = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: "success",
          type: "debit",
          category: { $in: ["airtime", "data", "electricity", "cable", "recharge-card", "education"] }
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: "$amount" },
          transactions: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    // Total revenue metrics
    const [totalRevenue, grossVolume, feesAgg] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: "success",
            type: "debit",
            category: { $in: ["airtime", "data", "electricity", "cable", "recharge-card", "education"] }
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
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: "success",
            discount: { $exists: true, $gt: 0 }
          }
        },
        { $group: { _id: null, total: { $sum: "$discount" } } },
      ]),
    ]);

    return NextResponse.json({
      success: true,
      period,
      granularity,
      summary: {
        totalRevenue: totalRevenue[0]?.total || 0,
        grossVolume: grossVolume[0]?.total || 0,
        fees: feesAgg[0]?.total || 0,
      },
      serviceRevenue,
      revenueOverTime,
    });
  } catch (error) {
    console.error("Revenue reports error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch revenue reports" },
      { status: 500 }
    );
  }
}
