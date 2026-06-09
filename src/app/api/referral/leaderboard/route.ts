// /app/api/referral/leaderboard/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await connectToDatabase();

    const topUsers = await User.find({})
      .sort({ referralEarnings: -1 })
      .limit(10)
      .select("name referralsCount referralEarnings");

    return NextResponse.json({
      success: true,
      data: topUsers.map((u) => ({
        name: u.name,
        referrals: u.referralsCount,
        earnings: u.referralEarnings,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}