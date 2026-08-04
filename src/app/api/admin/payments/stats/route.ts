import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/models/transaction";

function isAdmin(session: any) {
  return String(session?.user?.role || "").toLowerCase() === "admin";
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (!isAdmin(session)) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();

    // Calculate date ranges
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalPayments,
      successfulPayments,
      pendingPayments,
      failedPayments,
      totalVolume,
      todayVolume,
      weekVolume,
      monthVolume,
      pendingDeposits,
    ] = await Promise.all([
      // Total payments (funding transactions)
      Transaction.countDocuments({ category: "funding" }),

      // Successful payments
      Transaction.countDocuments({ category: "funding", status: "success" }),

      // Pending payments
      Transaction.countDocuments({ category: "funding", status: "pending" }),

      // Failed payments
      Transaction.countDocuments({ category: "funding", status: "failed" }),

      // Total volume (successful payments)
      Transaction.aggregate([
        { $match: { category: "funding", status: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),

      // Today's volume
      Transaction.aggregate([
        { $match: { category: "funding", status: "success", createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),

      // This week's volume
      Transaction.aggregate([
        { $match: { category: "funding", status: "success", createdAt: { $gte: startOfWeek } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),

      // This month's volume
      Transaction.aggregate([
        { $match: { category: "funding", status: "success", createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),

      // Pending deposits requiring attention
      Transaction.find({ category: "funding", status: "pending" })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalPayments,
        successfulPayments,
        pendingPayments,
        failedPayments,
        totalVolume: totalVolume[0]?.total || 0,
        todayVolume: todayVolume[0]?.total || 0,
        weekVolume: weekVolume[0]?.total || 0,
        monthVolume: monthVolume[0]?.total || 0,
        pendingDeposits,
      },
    });
  } catch (error) {
    console.error("Admin payments stats error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch payment statistics" },
      { status: 500 }
    );
  }
}
