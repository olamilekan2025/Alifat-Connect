import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import KYCVerification from "@/models/KYCVerification";

function isAdmin(session: { user?: { role?: string } } | null) {
  return String(session?.user?.role || "").toLowerCase() === "admin";
}

function getDateRange(period: string) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case "today":
      return { startDate: startOfDay, endDate: now };
    case "7days":
      return { 
        startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), 
        endDate: now 
      };
    case "30days":
      return { 
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), 
        endDate: now 
      };
    case "90days":
      return { 
        startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), 
        endDate: now 
      };
    case "thismonth":
      return { 
        startDate: new Date(now.getFullYear(), now.getMonth(), 1), 
        endDate: now 
      };
    case "lastmonth":
      return { 
        startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1), 
        endDate: new Date(now.getFullYear(), now.getMonth(), 0) 
      };
    case "thisyear":
      return { 
        startDate: new Date(now.getFullYear(), 0, 1), 
        endDate: now 
      };
    case "alltime":
    default:
      return { startDate: new Date(0), endDate: now };
  }
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

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "30days";
    const { startDate, endDate } = getDateRange(period);

    await connectToDatabase();

    // KYC status breakdown
    const statusBreakdown = await KYCVerification.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate statistics
    const [
      totalSubmissions,
      pendingSubmissions,
      underReviewSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
      requiresResubmission,
      notStarted,
    ] = await Promise.all([
      KYCVerification.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
      KYCVerification.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        status: "pending" 
      }),
      KYCVerification.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        status: "under_review" 
      }),
      KYCVerification.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        status: "approved" 
      }),
      KYCVerification.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        status: "rejected" 
      }),
      KYCVerification.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        status: "requires_resubmission" 
      }),
      KYCVerification.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        status: "not_started" 
      }),
    ]);

    const totalProcessed = approvedSubmissions + rejectedSubmissions;
    const approvalRate = totalProcessed > 0 
      ? ((approvedSubmissions / totalProcessed) * 100).toFixed(1) 
      : "0";
    const rejectionRate = totalProcessed > 0 
      ? ((rejectedSubmissions / totalProcessed) * 100).toFixed(1) 
      : "0";

    // Average review time (for approved/rejected)
    const reviewTimeStats = await KYCVerification.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ["approved", "rejected"] },
          reviewedAt: { $exists: true }
        }
      },
      {
        $project: {
          reviewHours: {
            $divide: [
              { $subtract: ["$reviewedAt", "$createdAt"] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgReviewHours: { $avg: "$reviewHours" },
          minReviewHours: { $min: "$reviewHours" },
          maxReviewHours: { $max: "$reviewHours" }
        }
      }
    ]);

    // KYC trends over time
    const kycTrends = await KYCVerification.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          totalSubmissions: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
          }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    // ID type distribution
    const idTypeDistribution = await KYCVerification.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          "identityInformation.idType": { $exists: true, $ne: "" }
        }
      },
      {
        $group: {
          _id: "$identityInformation.idType",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    return NextResponse.json({
      success: true,
      period,
      summary: {
        totalSubmissions,
        pendingSubmissions,
        underReviewSubmissions,
        approvedSubmissions,
        rejectedSubmissions,
        requiresResubmission,
        notStarted,
        approvalRate,
        rejectionRate,
        avgReviewTime: reviewTimeStats[0]?.avgReviewHours || 0,
      },
      statusBreakdown,
      kycTrends,
      idTypeDistribution,
    });
  } catch (error) {
    console.error("KYC reports error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch KYC reports" },
      { status: 500 }
    );
  }
}
