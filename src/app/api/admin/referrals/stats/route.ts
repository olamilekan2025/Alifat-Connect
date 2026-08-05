import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Referral from "@/models/Referral";
import User from "@/models/User";

function isAdmin(session: { user?: { role?: string } } | null) {
  return String(session?.user?.role || "").toLowerCase() === "admin";
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

    await connectToDatabase();

    const [
      totalReferrals,
      successfulReferrals,
      pendingReferrals,
      failedReferrals,
      cancelledReferrals,
      totalRewards,
      qualifiedReferrals,
    ] = await Promise.all([
      Referral.countDocuments(),
      Referral.countDocuments({ status: "rewarded" }),
      Referral.countDocuments({ status: "pending" }),
      Referral.countDocuments({ status: "failed" }),
      Referral.countDocuments({ status: "cancelled" }),
      Referral.aggregate([
        { $match: { status: "rewarded" } },
        { $group: { _id: null, total: { $sum: "$rewardAmount" } } },
      ]),
      Referral.countDocuments({ qualificationStatus: "qualified" }),
    ]);

    const totalRewardAmount = totalRewards[0]?.total || 0;
    const averageReward = successfulReferrals > 0 ? totalRewardAmount / successfulReferrals : 0;
    const conversionRate = totalReferrals > 0 ? (successfulReferrals / totalReferrals) * 100 : 0;

    // Get pending referrals that need attention
    const pendingReferralsList = await Referral.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({
      success: true,
      stats: {
        totalReferrals,
        successfulReferrals,
        pendingReferrals,
        failedReferrals,
        cancelledReferrals,
        qualifiedReferrals,
        totalRewards: totalRewardAmount,
        averageReward,
        conversionRate: Math.round(conversionRate * 100) / 100,
        pendingReferralsList,
      },
    });
  } catch (error) {
    console.error("Admin referral stats error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch referral stats" },
      { status: 500 }
    );
  }
}
