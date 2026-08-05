import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/models/transaction";
import User from "@/models/User";
import Wallet from "@/models/Wallet";

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

    // Wallet funding statistics
    const [
      totalFunding,
      successfulFunding,
      pendingFunding,
      failedFunding,
      totalFundingAmount,
      avgFundingAmount,
    ] = await Promise.all([
      Transaction.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        category: "funding",
        type: "credit"
      }),
      Transaction.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        category: "funding",
        type: "credit",
        status: "success"
      }),
      Transaction.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        category: "funding",
        type: "credit",
        status: "pending"
      }),
      Transaction.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        category: "funding",
        type: "credit",
        status: "failed"
      }),
      Transaction.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            category: "funding",
            type: "credit",
            status: "success"
          }
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            category: "funding",
            type: "credit",
            status: "success"
          }
        },
        { $group: { _id: null, avg: { $avg: "$amount" } } },
      ]),
    ]);

    // Withdrawal statistics
    const [
      totalWithdrawals,
      successfulWithdrawals,
      pendingWithdrawals,
      failedWithdrawals,
      totalWithdrawalAmount,
      avgWithdrawalAmount,
    ] = await Promise.all([
      Transaction.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        category: "withdrawal",
        type: "debit"
      }),
      Transaction.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        category: "withdrawal",
        type: "debit",
        status: "success"
      }),
      Transaction.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        category: "withdrawal",
        type: "debit",
        status: "pending"
      }),
      Transaction.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        category: "withdrawal",
        type: "debit",
        status: "failed"
      }),
      Transaction.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            category: "withdrawal",
            type: "debit",
            status: "success"
          }
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            category: "withdrawal",
            type: "debit",
            status: "success"
          }
        },
        { $group: { _id: null, avg: { $avg: "$amount" } } },
      ]),
    ]);

    // Funding by method (if provider field indicates payment method)
    const fundingByMethod = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          category: "funding",
          type: "credit"
        }
      },
      {
        $group: {
          _id: { $ifNull: ["$provider", "Other"] },
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          successful: {
            $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] }
          }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);

    // Overall wallet statistics
    const [totalWalletBalance, walletData] = await Promise.all([
      User.aggregate([
        { $group: { _id: null, total: { $sum: "$walletBalance" } } },
      ]),
      Wallet.findOne({ walletType: "SYSTEM" }).select("totalInflow totalOutflow"),
    ]);

    const totalInflow = walletData?.totalInflow || 0;
    const totalOutflow = walletData?.totalOutflow || 0;

    // Funding trends over time
    const fundingTrends = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          category: "funding",
          type: "credit",
          status: "success"
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          totalAmount: { $sum: "$amount" },
          transactions: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    const fundingSuccessRate = totalFunding > 0 
      ? ((successfulFunding / totalFunding) * 100).toFixed(1) 
      : "0";
    const withdrawalSuccessRate = totalWithdrawals > 0 
      ? ((successfulWithdrawals / totalWithdrawals) * 100).toFixed(1) 
      : "0";

    return NextResponse.json({
      success: true,
      period,
      funding: {
        totalFunding,
        successfulFunding,
        pendingFunding,
        failedFunding,
        totalFundingAmount: totalFundingAmount[0]?.total || 0,
        avgFundingAmount: avgFundingAmount[0]?.avg || 0,
        successRate: fundingSuccessRate,
      },
      withdrawals: {
        totalWithdrawals,
        successfulWithdrawals,
        pendingWithdrawals,
        failedWithdrawals,
        totalWithdrawalAmount: totalWithdrawalAmount[0]?.total || 0,
        avgWithdrawalAmount: avgWithdrawalAmount[0]?.avg || 0,
        successRate: withdrawalSuccessRate,
      },
      fundingByMethod,
      walletStats: {
        totalWalletBalance: totalWalletBalance[0]?.total || 0,
        totalInflow: totalInflow?.totalInflow || 0,
        totalOutflow: totalInflow?.totalOutflow || 0,
      },
      fundingTrends,
    });
  } catch (error) {
    console.error("Wallet reports error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch wallet reports" },
      { status: 500 }
    );
  }
}
