// /app/api/referral/leaderboard/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Referral from "@/models/Referral";

export async function GET() {
  try {
    await connectToDatabase();

    // Get top referrers based on actual referral data
    const topReferrers = await Referral.aggregate([
      {
        $match: { status: "rewarded" },
      },
      {
        $group: {
          _id: "$referrerId",
          totalReferrals: { $sum: 1 },
          successfulReferrals: { $sum: 1 },
          totalRewards: { $sum: "$rewardAmount" },
        },
      },
      {
        $sort: { totalRewards: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    const userIds = topReferrers.map((r) => r._id);
    const users = await User.find({ _id: { $in: userIds } })
      .select("name firstname lastname referralCode")
      .lean();

    const userMap = new Map(users.map((u) => [String(u._id), u]));

    const leaderboard = topReferrers.map((item, index) => {
      const user = userMap.get(String(item._id));
      return {
        rank: index + 1,
        name: user?.name || `${user?.firstname || ""} ${user?.lastname || ""}`.trim() || "Unknown",
        referrals: item.totalReferrals,
        earnings: item.totalRewards,
        referralCode: user?.referralCode || "",
      };
    });

    return NextResponse.json({
      success: true,
      data: leaderboard,
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}