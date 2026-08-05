import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Referral from "@/models/Referral";
import User from "@/models/User";

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

    // Referral summary statistics
    const [
      totalReferrals,
      successfulReferrals,
      pendingReferrals,
      failedReferrals,
      cancelledReferrals,
      qualifiedReferrals,
      totalRewards,
    ] = await Promise.all([
      Referral.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
      Referral.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        status: "rewarded" 
      }),
      Referral.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        status: "pending" 
      }),
      Referral.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        status: "failed" 
      }),
      Referral.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        status: "cancelled" 
      }),
      Referral.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        qualificationStatus: "qualified" 
      }),
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

    const totalRewardAmount = totalRewards[0]?.total || 0;
    const averageReward = successfulReferrals > 0 ? totalRewardAmount / successfulReferrals : 0;
    const conversionRate = totalReferrals > 0 ? ((successfulReferrals / totalReferrals) * 100).toFixed(1) : "0";

    // Top referrers
    const topReferrers = await User.aggregate([
      {
        $match: {
          referralsCount: { $gt: 0 }
        }
      },
      {
        $sort: { referralEarnings: -1 }
      },
      {
        $limit: 20
      },
      {
        $project: {
          _id: 1,
          name: 1,
          firstname: 1,
          lastname: 1,
          email: 1,
          referralCode: 1,
          referralsCount: 1,
          referralEarnings: 1,
          createdAt: 1
        }
      }
    ]);

    // Add rank to top referrers
    const rankedReferrers = topReferrers.map((referrer, index) => ({
      ...referrer,
      rank: index + 1,
      conversionRate: referrer.referralsCount > 0 
        ? ((referrer.referralsCount / referrer.referralsCount) * 100).toFixed(1) 
        : "0"
    }));

    // Referral trends over time
    const referralTrends = await Referral.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          totalReferrals: { $sum: 1 },
          successfulReferrals: {
            $sum: { $cond: [{ $eq: ["$status", "rewarded"] }, 1, 0] }
          },
          pendingReferrals: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
          },
          totalRewards: {
            $sum: { $cond: [{ $eq: ["$status", "rewarded"] }, "$rewardAmount", 0] }
          }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    return NextResponse.json({
      success: true,
      period,
      summary: {
        totalReferrals,
        successfulReferrals,
        pendingReferrals,
        failedReferrals,
        cancelledReferrals,
        qualifiedReferrals,
        totalRewards: totalRewardAmount,
        averageReward,
        conversionRate,
      },
      topReferrers: rankedReferrers,
      referralTrends,
    });
  } catch (error) {
    console.error("Referral reports error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch referral reports" },
      { status: 500 }
    );
  }
}
