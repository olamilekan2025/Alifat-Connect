import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import SupportTicket from "@/models/SupportTicket";
import SupportMessage from "@/models/SupportMessage";
import User from "@/models/User";
import Transaction from "@/models/transaction";
import { createNotificationForAdmins, createUserNotification } from "@/lib/notifications/notification.service";

// GET /api/admin/support/[id] - Get single ticket details with messages
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { id } = await params;

    // Validate ObjectId
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid ticket ID" },
        { status: 400 }
      );
    }

    // Get ticket with populated data
    const ticket = await SupportTicket.findById(id)
      .populate("userId", "name firstname lastname email phone walletBalance emailVerified referralCode")
      .populate("assignedAdminId", "name firstname lastname email")
      .lean();

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    // Get messages (exclude internal notes if needed, but for admin show all)
    const messages = await SupportMessage.find({ ticketId: id })
      .populate("senderId", "name firstname lastname email image")
      .sort({ createdAt: 1 })
      .lean();

    // Get transaction details if linked
    let transaction = null;
    if (ticket.transactionId) {
      transaction = await Transaction.findById(ticket.transactionId).lean();
    }

    return NextResponse.json({
      success: true,
      ticket,
      messages,
      transaction,
    });
  } catch (error) {
    console.error("Error fetching support ticket:", error);
    return NextResponse.json(
      { error: "Failed to fetch support ticket", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/support/[id] - Update ticket (status, priority, assignment)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { id } = await params;
    const body = await req.json();

    // Validate ObjectId
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid ticket ID" },
        { status: 400 }
      );
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    // Track changes for notifications
    const changes: string[] = [];

    // Update status
    if (body.status && body.status !== ticket.status) {
      const validStatuses = ["Open", "Pending", "In Progress", "Resolved", "Closed"];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid status value" },
          { status: 400 }
        );
      }

      // Set timestamps based on status
      if (body.status === "Resolved" && !ticket.resolvedAt) {
        ticket.resolvedAt = new Date();
      }
      if (body.status === "Closed" && !ticket.closedAt) {
        ticket.closedAt = new Date();
      }
      if (body.status === "In Progress" && ticket.status === "Open" && !ticket.firstResponseAt) {
        ticket.firstResponseAt = new Date();
      }

      ticket.status = body.status;
      changes.push(`status changed to ${body.status}`);
    }

    // Update priority
    if (body.priority && body.priority !== ticket.priority) {
      const validPriorities = ["Low", "Medium", "High", "Urgent"];
      if (!validPriorities.includes(body.priority)) {
        return NextResponse.json(
          { error: "Invalid priority value" },
          { status: 400 }
        );
      }
      ticket.priority = body.priority;
      changes.push(`priority changed to ${body.priority}`);
    }

    // Update assignment
    if (body.assignedAdminId !== undefined) {
      if (body.assignedAdminId === null) {
        ticket.assignedAdminId = undefined;
        changes.push("ticket unassigned");
      } else {
        if (!mongoose.Types.ObjectId.isValid(body.assignedAdminId)) {
          return NextResponse.json(
            { error: "Invalid admin ID" },
            { status: 400 }
          );
        }

        const admin = await User.findOne({
          _id: body.assignedAdminId,
          role: "admin",
        });
        if (!admin) {
          return NextResponse.json(
            { error: "Admin not found" },
            { status: 404 }
          );
        }

        ticket.assignedAdminId = body.assignedAdminId;
        changes.push(`assigned to ${admin.name || admin.email}`);
      }
    }

    await ticket.save();

    // Send notifications for changes
    if (changes.length > 0) {
      await createNotificationForAdmins(
        "support_message",
        `Support Ticket Updated`,
        `Ticket ${ticket.ticketNumber}: ${changes.join(", ")}`,
        { ticketId: ticket._id.toString(), ticketNumber: ticket.ticketNumber }
      );

      // Notify user if status changed
      if (body.status && body.status !== "Open") {
        await createUserNotification(
          ticket.userId.toString(),
          "support_message",
          `Support Ticket Update`,
          `Your support ticket ${ticket.ticketNumber} status has been updated to ${body.status}`,
          { ticketId: ticket._id.toString(), ticketNumber: ticket.ticketNumber }
        );
      }
    }

    return NextResponse.json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error("Error updating support ticket:", error);
    return NextResponse.json(
      { error: "Failed to update support ticket", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/support/[id] - Delete ticket (with confirmation)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { id } = await params;

    // Validate ObjectId
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid ticket ID" },
        { status: 400 }
      );
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    // Delete all messages first
    await SupportMessage.deleteMany({ ticketId: id });

    // Delete ticket
    await SupportTicket.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Ticket deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting support ticket:", error);
    return NextResponse.json(
      { error: "Failed to delete support ticket", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
