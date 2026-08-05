import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
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
    const period = searchParams.get("period") || "30days";

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "7days":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "30days":
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case "90days":
        startDate = new Date(now.setDate(now.getDate() - 90));
        break;
      case "thisyear":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "alltime":
      default:
        startDate = new Date(0);
        break;
    }

    // Aggregate data by date
    const analytics = await Referral.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          totalReferrals: { $sum: 1 },
          successfulReferrals: {
            $sum: { $cond: [{ $eq: ["$status", "rewarded"] }, 1, 0] },
          },
          pendingReferrals: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          totalRewards: {
            $sum: {
              $cond: [
                { $eq: ["$status", "rewarded"] },
                "$rewardAmount",
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Get summary for the period
    const summary = await Referral.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalReferrals: { $sum: 1 },
          successfulReferrals: {
            $sum: { $cond: [{ $eq: ["$status", "rewarded"] }, 1, 0] },
          },
          pendingReferrals: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          totalRewards: {
            $sum: {
              $cond: [
                { $eq: ["$status", "rewarded"] },
                "$rewardAmount",
                0,
              ],
            },
          },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      period,
      analytics,
      summary: summary[0] || {
        totalReferrals: 0,
        successfulReferrals: 0,
        pendingReferrals: 0,
        totalRewards: 0,
      },
    });
  } catch (error) {
    console.error("Admin referral analytics error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch referral analytics" },
      { status: 500 }
    );
  }
}
