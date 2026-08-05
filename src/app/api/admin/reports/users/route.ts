import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
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

    // User growth over time
    let groupBy;
    switch (granularity) {
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

    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          newUsers: { $sum: 1 },
          verifiedUsers: {
            $sum: { $cond: [{ $eq: ["$kycVerified", true] }, 1, 0] }
          }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    // User statistics
    const [
      totalUsers,
      newUsers,
      verifiedUsers,
      suspendedUsers,
      activeUsers,
      usersWithTransactions,
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
      User.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
      User.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        kycVerified: true 
      }),
      User.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        isSuspended: true 
      }),
      User.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        lastLoginAt: { $gte: startDate }
      }),
      Transaction.distinct("userId", {
        createdAt: { $gte: startDate, $lte: endDate }
      }).then(userIds => userIds.length),
    ]);

    // User registration sources (if referredBy exists)
    const registrationSources = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $and: [{ $ne: ["$referredBy", null] }, { $ne: ["$referredBy", ""] }] },
              "referral",
              "direct"
            ]
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Membership level distribution
    const membershipDistribution = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$membershipLevel",
          count: { $sum: 1 }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      period,
      granularity,
      summary: {
        totalUsers,
        newUsers,
        verifiedUsers,
        suspendedUsers,
        activeUsers,
        usersWithTransactions,
        verificationRate: totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(1) : "0",
        suspensionRate: totalUsers > 0 ? ((suspendedUsers / totalUsers) * 100).toFixed(1) : "0",
      },
      userGrowth,
      registrationSources,
      membershipDistribution,
    });
  } catch (error) {
    console.error("User reports error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch user reports" },
      { status: 500 }
    );
  }
}
