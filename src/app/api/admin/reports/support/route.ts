import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import SupportTicket from "@/models/SupportTicket";

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

    // Support ticket statistics
    const [
      totalTickets,
      openTickets,
      pendingTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      urgentTickets,
    ] = await Promise.all([
      SupportTicket.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
      SupportTicket.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        status: "Open" 
      }),
      SupportTicket.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        status: "Pending" 
      }),
      SupportTicket.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        status: "In Progress" 
      }),
      SupportTicket.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        status: "Resolved" 
      }),
      SupportTicket.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        status: "Closed" 
      }),
      SupportTicket.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        priority: "Urgent" 
      }),
    ]);

    // Response and resolution time statistics
    const responseTimeStats = await SupportTicket.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          firstResponseAt: { $exists: true }
        }
      },
      {
        $project: {
          responseHours: {
            $divide: [
              { $subtract: ["$firstResponseAt", "$createdAt"] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResponseHours: { $avg: "$responseHours" },
          minResponseHours: { $min: "$responseHours" },
          maxResponseHours: { $max: "$responseHours" }
        }
      }
    ]);

    const resolutionTimeStats = await SupportTicket.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          resolvedAt: { $exists: true }
        }
      },
      {
        $project: {
          resolutionHours: {
            $divide: [
              { $subtract: ["$resolvedAt", "$createdAt"] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResolutionHours: { $avg: "$resolutionHours" },
          minResolutionHours: { $min: "$resolutionHours" },
          maxResolutionHours: { $max: "$resolutionHours" }
        }
      }
    ]);

    // Tickets by category
    const ticketsByCategory = await SupportTicket.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Tickets by priority
    const ticketsByPriority = await SupportTicket.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Admin performance (if assignedAdminId exists)
    const adminPerformance = await SupportTicket.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          assignedAdminId: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: "$assignedAdminId",
          ticketsAssigned: { $sum: 1 },
          ticketsResolved: {
            $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] }
          }
        }
      },
      {
        $sort: { ticketsResolved: -1 }
      }
    ]);

    // Support ticket trends over time
    const ticketTrends = await SupportTicket.aggregate([
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
          totalTickets: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] }
          },
          open: {
            $sum: { $cond: [{ $eq: ["$status", "Open"] }, 1, 0] }
          }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    const resolutionRate = totalTickets > 0 
      ? ((resolvedTickets / totalTickets) * 100).toFixed(1) 
      : "0";

    return NextResponse.json({
      success: true,
      period,
      summary: {
        totalTickets,
        openTickets,
        pendingTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
        urgentTickets,
        resolutionRate,
        avgResponseTime: responseTimeStats[0]?.avgResponseHours || 0,
        avgResolutionTime: resolutionTimeStats[0]?.avgResolutionHours || 0,
      },
      ticketsByCategory,
      ticketsByPriority,
      adminPerformance,
      ticketTrends,
    });
  } catch (error) {
    console.error("Support reports error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch support reports" },
      { status: 500 }
    );
  }
}
