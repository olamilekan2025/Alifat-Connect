import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/models/transaction";
import User from "@/models/User";
import { createUserNotification, createNotificationForAdmins } from "@/lib/notifications/notification.service";
import mongoose from "mongoose";

// Global reference to socket emitters (set by server.ts)
declare global {
  var paymentSocketEmitters: {
    emitPaymentApproved: (data: Record<string, unknown>) => void;
    emitPaymentRejected: (data: Record<string, unknown>) => void;
    emitPaymentUpdate: (data: Record<string, unknown>) => void;
  } | null;
}

function isAdmin(session: { user?: { role?: string } }) {
  return String(session?.user?.role || "").toLowerCase() === "admin";
}

async function logAuditAction(action: string, details: Record<string, unknown>) {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) {
      console.error("Database connection not available for audit logging");
      return;
    }
    await db.collection("admin_audit_logs").insertOne({
      action,
      ...details,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Failed to log audit action:", error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!isAdmin(session)) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const adminId = session.user.id;
  const adminEmail = session.user.email;

  try {
    await connectToDatabase();

    const body = await req.json();
    const { reason } = body;

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json({ success: false, message: "Rejection reason is required" }, { status: 400 });
    }

    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
    }

    // IDEMPOTENCY CHECK: Prevent rejecting already processed payments
    if (transaction.status !== "pending") {
      const message = transaction.status === "failed"
        ? "Payment has already been rejected"
        : "Payment cannot be rejected - current status: " + transaction.status;

      await logAuditAction("PAYMENT_REJECT_FAILED", {
        adminId,
        adminEmail,
        paymentId: id,
        reason: "Idempotency check failed",
        currentStatus: transaction.status,
        ip: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || "",
      });

      return NextResponse.json({ success: false, message }, { status: 400 });
    }

    // Verify user exists
    const user = await User.findById(transaction.userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Verify this is a funding transaction
    if (transaction.category !== "funding") {
      return NextResponse.json({ success: false, message: "Not a funding transaction" }, { status: 400 });
    }

    // Update transaction status
    transaction.status = "failed";
    transaction.rejectionReason = reason;
    await transaction.save();

    // Log audit action
    await logAuditAction("PAYMENT_REJECTED", {
      adminId,
      adminEmail,
      paymentId: id,
      transactionId: transaction.reference,
      userId: transaction.userId,
      amount: transaction.amount,
      previousStatus: "pending",
      newStatus: "failed",
      rejectionReason: reason,
      ip: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "",
    });

    // Notify user
    await createUserNotification(
      transaction.userId,
      "payment_rejected",
      "Payment Rejected",
      `Your wallet funding of ₦${Number(transaction.amount).toLocaleString()} has been rejected. Reason: ${reason}`,
      {
        transactionId: transaction._id.toString(),
        reference: transaction.reference,
        amount: transaction.amount,
        rejectionReason: reason,
      }
    );

    // Notify admins
    await createNotificationForAdmins(
      "payment_rejected",
      "Payment Rejected",
      `Admin ${adminEmail} rejected payment ${transaction.reference} for ₦${Number(transaction.amount).toLocaleString()}`,
      {
        transactionId: transaction._id.toString(),
        reference: transaction.reference,
        amount: transaction.amount,
        rejectedBy: adminEmail || "Unknown Admin",
        rejectionReason: reason,
      }
    );

    // Emit real-time update to admin dashboard
    if (global.paymentSocketEmitters) {
      global.paymentSocketEmitters.emitPaymentRejected({
        paymentId: transaction._id.toString(),
        reference: transaction.reference,
        amount: transaction.amount,
        userId: transaction.userId,
        rejectedBy: adminEmail,
        rejectionReason: reason,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Payment rejected successfully",
      payment: {
        ...transaction.toObject(),
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
        },
      },
    });
  } catch (error) {
    console.error("Payment rejection error:", error);

    await logAuditAction("PAYMENT_REJECT_ERROR", {
      adminId,
      adminEmail,
      paymentId: id,
      error: error instanceof Error ? error.message : "Unknown error",
      ip: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "",
    });

    return NextResponse.json(
      { success: false, message: "Failed to reject payment" },
      { status: 500 }
    );
  }
}
