import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import KYCVerification from "@/models/KYCVerification";

// GET /api/admin/kyc/stats - Get KYC statistics
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const stats = await KYCVerification.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statsMap = {
      total: 0,
      not_started: 0,
      pending: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      requires_resubmission: 0,
    };

    stats.forEach((stat) => {
      statsMap[stat._id as keyof typeof statsMap] = stat.count;
      statsMap.total += stat.count;
    });

    return NextResponse.json({
      success: true,
      stats: statsMap,
    });
  } catch (error) {
    console.error("Error fetching KYC stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch KYC statistics" },
      { status: 500 }
    );
  }
}
