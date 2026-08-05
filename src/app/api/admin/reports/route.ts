import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Transaction from "@/models/transaction";
import Referral from "@/models/Referral";

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

    // Overview Statistics
    const [
      totalUsers,
      newUsers,
      activeUsers,
      verifiedUsers,
      totalTransactions,
      successfulTransactions,
      failedTransactions,
      pendingTransactions,
      revenueAgg,
      transactionVolumeAgg,
      walletFundingAgg,
      withdrawalAgg,
      referralRewardsAgg,
    ] = await Promise.all([
      // User stats
      User.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
      User.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
      User.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        lastLoginAt: { $gte: startDate }
      }),
      User.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        kycVerified: true 
      }),
      
      // Transaction stats
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
      
      // Revenue (successful debit transactions = VTU services)
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
      
      // Transaction volume (all successful transactions)
      Transaction.aggregate([
        { 
          $match: { 
            createdAt: { $gte: startDate, $lte: endDate },
            status: "success" 
          } 
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      
      // Wallet funding
      Transaction.aggregate([
        { 
          $match: { 
            createdAt: { $gte: startDate, $lte: endDate },
            status: "success",
            category: "funding",
            type: "credit"
          } 
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      
      // Withdrawals
      Transaction.aggregate([
        { 
          $match: { 
            createdAt: { $gte: startDate, $lte: endDate },
            status: "success",
            category: "withdrawal",
            type: "debit"
          } 
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      
      // Referral rewards
      Referral.aggregate([
        { 
          $match: { 
            createdAt: { $gte: startDate, $lte: endDate },
            status: "rewarded" 
          } 
        },
        { $group: { _id: null, total: { $sum: "$rewardAmount" } } },
      ]),
    ]);

    const successRate = totalTransactions > 0 
      ? ((successfulTransactions / totalTransactions) * 100).toFixed(1) 
      : "0";
    const failureRate = totalTransactions > 0 
      ? ((failedTransactions / totalTransactions) * 100).toFixed(1) 
      : "0";

    return NextResponse.json({
      success: true,
      period,
      overview: {
        totalUsers,
        newUsers,
        activeUsers,
        verifiedUsers,
        totalTransactions,
        successfulTransactions,
        failedTransactions,
        pendingTransactions,
        successRate,
        failureRate,
        revenue: revenueAgg[0]?.total || 0,
        transactionVolume: transactionVolumeAgg[0]?.total || 0,
        walletFunding: walletFundingAgg[0]?.total || 0,
        withdrawals: withdrawalAgg[0]?.total || 0,
        referralRewards: referralRewardsAgg[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Reports overview error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch reports overview" },
      { status: 500 }
    );
  }
}
