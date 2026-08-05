import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import SupportTicket from "@/models/SupportTicket";
import SupportMessage from "@/models/SupportMessage";
import User from "@/models/User";
import Transaction from "@/models/transaction";
import { z } from "zod";

// Validation schema for query parameters
const querySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("25"),
  search: z.string().optional(),
  status: z.enum(["Open", "Pending", "In Progress", "Resolved", "Closed"]).optional(),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]).optional(),
  category: z.string().optional(),
  assignedAdminId: z.string().optional(),
  dateRange: z.enum(["today", "7days", "30days", "90days"]).optional(),
  sort: z.enum(["newest", "oldest", "priority", "recently_updated"]).optional().default("newest"),
});

// Helper function to generate ticket number
function generateTicketNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
  return `SUP-${year}-${random}`;
}

// Helper function to calculate date range
function getDateRange(range?: string) {
  const now = new Date();
  const startDate = new Date();

  switch (range) {
    case "today":
      startDate.setHours(0, 0, 0, 0);
      break;
    case "7days":
      startDate.setDate(now.getDate() - 7);
      break;
    case "30days":
      startDate.setDate(now.getDate() - 30);
      break;
    case "90days":
      startDate.setDate(now.getDate() - 90);
      break;
    default:
      return null;
  }

  return startDate;
}

// GET /api/admin/support - List tickets with filters, search, sorting, pagination
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const page = Math.max(1, parseInt(query.page));
    const limit = Math.min(100, Math.max(10, parseInt(query.limit)));
    const skip = (page - 1) * limit;

    // Build query
    const filter: any = {};

    // Search across multiple fields
    if (query.search) {
      const searchRegex = new RegExp(query.search, "i");
      filter.$or = [
        { ticketNumber: searchRegex },
        { subject: searchRegex },
        { description: searchRegex },
        { transactionReference: searchRegex },
      ];
    }

    // Status filter
    if (query.status) {
      filter.status = query.status;
    }

    // Priority filter
    if (query.priority) {
      filter.priority = query.priority;
    }

    // Category filter
    if (query.category) {
      filter.category = query.category;
    }

    // Assigned admin filter
    if (query.assignedAdminId) {
      filter.assignedAdminId = query.assignedAdminId;
    }

    // Date range filter
    const dateRange = getDateRange(query.dateRange);
    if (dateRange) {
      filter.createdAt = { $gte: dateRange };
    }

    // Build sort
    let sort: any = {};
    switch (query.sort) {
      case "oldest":
        sort = { createdAt: 1 };
        break;
      case "priority":
        sort = { priority: -1, createdAt: -1 };
        break;
      case "recently_updated":
        sort = { lastMessageAt: -1 };
        break;
      case "newest":
      default:
        sort = { createdAt: -1 };
        break;
    }

    // Execute queries
    const [tickets, total] = await Promise.all([
      SupportTicket.find(filter)
        .populate("userId", "name firstname lastname email phone walletBalance emailVerified")
        .populate("assignedAdminId", "name firstname lastname email")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      SupportTicket.countDocuments(filter),
    ]);

    // Get statistics
    const [
      totalTickets,
      openTickets,
      pendingTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      urgentTickets,
    ] = await Promise.all([
      SupportTicket.countDocuments(),
      SupportTicket.countDocuments({ status: "Open" }),
      SupportTicket.countDocuments({ status: "Pending" }),
      SupportTicket.countDocuments({ status: "In Progress" }),
      SupportTicket.countDocuments({ status: "Resolved" }),
      SupportTicket.countDocuments({ status: "Closed" }),
      SupportTicket.countDocuments({ priority: "Urgent" }),
    ]);

    // Calculate average response and resolution times
    const resolvedTicketsData = await SupportTicket.find({
      status: "Resolved",
      firstResponseAt: { $exists: true },
      resolvedAt: { $exists: true },
    }).select("firstResponseAt resolvedAt createdAt");

    let avgResponseTime = 0;
    let avgResolutionTime = 0;

    if (resolvedTicketsData.length > 0) {
      const totalResponseTime = resolvedTicketsData.reduce((sum, ticket) => {
        return sum + (ticket.firstResponseAt!.getTime() - ticket.createdAt.getTime());
      }, 0);
      
      const totalResolutionTime = resolvedTicketsData.reduce((sum, ticket) => {
        return sum + (ticket.resolvedAt!.getTime() - ticket.createdAt.getTime());
      }, 0);

      avgResponseTime = totalResponseTime / resolvedTicketsData.length;
      avgResolutionTime = totalResolutionTime / resolvedTicketsData.length;
    }

    const stats = {
      totalTickets,
      openTickets,
      pendingTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      urgentTickets,
      avgResponseTime: Math.round(avgResponseTime / (1000 * 60)), // in minutes
      avgResolutionTime: Math.round(avgResolutionTime / (1000 * 60)), // in minutes
    };

    return NextResponse.json({
      success: true,
      tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    });
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch support tickets", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/support - Create a new support ticket
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await req.json();

    // Validate required fields
    if (!body.userId || !body.subject || !body.description) {
      return NextResponse.json(
        { error: "Missing required fields: userId, subject, description" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await User.findById(body.userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if transaction exists if provided
    if (body.transactionId) {
      const transaction = await Transaction.findById(body.transactionId);
      if (!transaction) {
        return NextResponse.json(
          { error: "Transaction not found" },
          { status: 404 }
        );
      }
    }

    // Generate unique ticket number
    let ticketNumber = generateTicketNumber();
    const existingTicket = await SupportTicket.findOne({ ticketNumber });
    if (existingTicket) {
      ticketNumber = generateTicketNumber(); // Try again
    }

    // Create ticket
    const ticket = await SupportTicket.create({
      ticketNumber,
      userId: body.userId,
      subject: body.subject,
      description: body.description,
      category: body.category || "Other",
      priority: body.priority || "Medium",
      status: "Open",
      assignedAdminId: body.assignedAdminId || null,
      transactionId: body.transactionId || null,
      transactionReference: body.transactionReference || null,
      transactionType: body.transactionType || null,
      transactionAmount: body.transactionAmount || null,
      transactionStatus: body.transactionStatus || null,
      lastMessageAt: new Date(),
      messageCount: 0,
    });

    // Create initial message if provided
    if (body.message) {
      await SupportMessage.create({
        ticketId: ticket._id,
        senderId: session.user.id,
        senderType: "ADMIN",
        message: body.message,
        isInternal: false,
        isRead: false,
      });

      ticket.messageCount = 1;
      await ticket.save();
    }

    // Create notification for admins
    const { createNotificationForAdmins } = await import("@/lib/notifications/notification.service");
    await createNotificationForAdmins(
      "support_message",
      "New Support Ticket Created",
      `Ticket ${ticketNumber} has been created by admin`,
      { ticketId: ticket._id.toString(), ticketNumber }
    );

    return NextResponse.json({
      success: true,
      ticket,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating support ticket:", error);
    return NextResponse.json(
      { error: "Failed to create support ticket", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}