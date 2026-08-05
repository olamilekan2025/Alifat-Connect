import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Referral from "@/models/Referral";

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

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") || 10);

    // Get top referrers based on referral count and earnings
    const topReferrers = await User.find({
      referralsCount: { $gt: 0 },
    })
      .select("firstname lastname name email referralCode referralsCount referralEarnings createdAt")
      .sort({ referralsCount: -1, referralEarnings: -1 })
      .limit(limit)
      .lean();

    // Calculate conversion rate for each referrer
    const referrersWithStats = await Promise.all(
      topReferrers.map(async (referrer) => {
        const totalReferrals = await Referral.countDocuments({
          referrerId: String(referrer._id),
        });

        const successfulReferrals = await Referral.countDocuments({
          referrerId: String(referrer._id),
          status: "rewarded",
        });

        const conversionRate = totalReferrals > 0 
          ? (successfulReferrals / totalReferrals) * 100 
          : 0;

        return {
          ...referrer,
          totalReferrals,
          successfulReferrals,
          conversionRate: Math.round(conversionRate * 100) / 100,
        };
      })
    );

    // Add rank
    const rankedReferrers = referrersWithStats.map((referrer, index) => ({
      ...referrer,
      rank: index + 1,
    }));

    return NextResponse.json({
      success: true,
      topReferrers: rankedReferrers,
    });
  } catch (error) {
    console.error("Admin top referrers error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch top referrers" },
      { status: 500 }
    );
  }
}
