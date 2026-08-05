// /app/api/referral/stats/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Referral from "@/models/Referral";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get detailed referral stats from Referral model
    const [
      totalReferrals,
      successfulReferrals,
      pendingReferrals,
      totalRewards,
    ] = await Promise.all([
      Referral.countDocuments({ referrerId: userId }),
      Referral.countDocuments({ referrerId: userId, status: "rewarded" }),
      Referral.countDocuments({ referrerId: userId, status: "pending" }),
      Referral.aggregate([
        { $match: { referrerId: userId, status: "rewarded" } },
        { $group: { _id: null, total: { $sum: "$rewardAmount" } } },
      ]),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        referrals: totalReferrals,
        successfulReferrals,
        pendingReferrals,
        earnings: totalRewards[0]?.total || 0,
        wallet: user.walletBalance,
        referredBy: user.referredBy,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}