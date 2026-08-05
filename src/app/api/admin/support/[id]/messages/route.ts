import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import SupportTicket from "@/models/SupportTicket";
import SupportMessage from "@/models/SupportMessage";
import User from "@/models/User";
import { createNotificationForAdmins, createUserNotification } from "@/lib/notifications/notification.service";

// POST /api/admin/support/[id]/messages - Send a message (reply or internal note)
export async function POST(
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

    // Validate required fields
    if (!body.message || typeof body.message !== "string" || body.message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

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

    // Check if ticket is closed - prevent adding messages to closed tickets unless reopening
    if (ticket.status === "Closed" && !body.reopenTicket) {
      return NextResponse.json(
        { error: "Cannot add messages to closed tickets. Reopen the ticket first." },
        { status: 400 }
      );
    }

    // Reopen ticket if requested
    if (body.reopenTicket && ticket.status === "Closed") {
      ticket.status = "Open";
      ticket.closedAt = undefined;
    }

    // Handle attachments
    let attachments = [];
    if (body.attachments && Array.isArray(body.attachments)) {
      attachments = body.attachments;
    }

    // Create message
    const message = await SupportMessage.create({
      ticketId: ticket._id,
      senderId: session.user.id,
      senderType: "ADMIN",
      message: body.message.trim(),
      isInternal: body.isInternal || false,
      attachments,
      isRead: false,
    });

    // Update ticket
    ticket.messageCount = (ticket.messageCount || 0) + 1;
    ticket.lastMessageAt = new Date();

    // Set first response time if this is the first admin response
    if (!ticket.firstResponseAt) {
      ticket.firstResponseAt = new Date();
    }

    // Update status based on context
    if (!body.isInternal) {
      if (ticket.status === "Open") {
        ticket.status = "In Progress";
      }
    }

    await ticket.save();

    // Send notifications
    if (!body.isInternal) {
      // Notify user about admin reply
      await createUserNotification(
        ticket.userId.toString(),
        "support_message",
        "New Response to Your Support Ticket",
        `An admin has replied to your support ticket ${ticket.ticketNumber}`,
        { ticketId: ticket._id.toString(), ticketNumber: ticket.ticketNumber }
      );

      // Notify other admins about the reply
      await createNotificationForAdmins(
        "support_message",
        "Admin Replied to Support Ticket",
        `Admin replied to ticket ${ticket.ticketNumber}`,
        { ticketId: ticket._id.toString(), ticketNumber: ticket.ticketNumber }
      );
    }

    // Get populated message for response
    const populatedMessage = await SupportMessage.findById(message._id)
      .populate("senderId", "name firstname lastname email image")
      .lean();

    return NextResponse.json({
      success: true,
      message: populatedMessage,
      ticket,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating support message:", error);
    return NextResponse.json(
      { error: "Failed to create support message", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// GET /api/admin/support/[id]/messages - Get all messages for a ticket
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

    // Get messages (admins can see both regular and internal messages)
    const messages = await SupportMessage.find({ ticketId: id })
      .populate("senderId", "name firstname lastname email image")
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Error fetching support messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch support messages", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
