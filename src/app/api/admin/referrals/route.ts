import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Referral from "@/models/Referral";
import User from "@/models/User";
import mongoose from "mongoose";

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
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const sort = searchParams.get("sort") || "newest";

    // Build query
    const query: Record<string, unknown> = {};

    if (status) {
      const s = String(status).toLowerCase();
      if (['pending', 'qualified', 'rewarded', 'cancelled', 'failed'].includes(s)) {
        query.status = s;
      }
    }

    // Build sort
    let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "oldest") sortObj = { createdAt: 1 };
    else if (sort === "highest_reward") sortObj = { rewardAmount: -1 };
    else if (sort === "lowest_reward") sortObj = { rewardAmount: 1 };

    // Fetch referrals
    const referrals = await Referral.find(query)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Get all unique user IDs
    const userIds = [
      ...new Set(
        [
          ...referrals.map((r) => String(r.referrerId)),
          ...referrals.map((r) => String(r.referredUserId)),
        ].filter((id) => mongoose.Types.ObjectId.isValid(id))
      ),
    ].map((id) => new mongoose.Types.ObjectId(id));

    // Fetch users
    const users = await User.find({
      _id: { $in: userIds },
    })
      .select("firstname lastname name email referralCode referralsCount referralEarnings createdAt isSuspended")
      .lean();

    const userMap = new Map(
      users.map((u) => [String(u._id), u])
    );

    // Map users to referrals
    let results = referrals.map((referral) => ({
      ...referral,
      referrer: userMap.get(String(referral.referrerId)) || null,
      referredUser: userMap.get(String(referral.referredUserId)) || null,
    }));

    // Client-side search for text fields
    if (search) {
      const q = search.toLowerCase();
      results = results.filter((item) => {
        const referrer = item.referrer;
        const referred = item.referredUser;
        return (
          item.referralCode?.toLowerCase().includes(q) ||
          item.reference?.toLowerCase().includes(q) ||
          referrer?.email?.toLowerCase().includes(q) ||
          referrer?.name?.toLowerCase().includes(q) ||
          referrer?.firstname?.toLowerCase().includes(q) ||
          referrer?.lastname?.toLowerCase().includes(q) ||
          referred?.email?.toLowerCase().includes(q) ||
          referred?.name?.toLowerCase().includes(q) ||
          referred?.firstname?.toLowerCase().includes(q) ||
          referred?.lastname?.toLowerCase().includes(q)
        );
      });
    }

    const totalReferrals = await Referral.countDocuments(query);
    const totalFiltered = results.length;

    return NextResponse.json({
      success: true,
      page,
      limit,
      totalReferrals,
      totalFiltered,
      referrals: results,
    });
  } catch (error) {
    console.error("Admin referrals error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch referrals" },
      { status: 500 }
    );
  }
}
