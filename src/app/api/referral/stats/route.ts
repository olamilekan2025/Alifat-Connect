// /app/api/referral/stats/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

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

    return NextResponse.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        referrals: user.referralsCount,
        earnings: user.referralEarnings,
        wallet: user.walletBalance,
        referredBy: user.referredBy,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}