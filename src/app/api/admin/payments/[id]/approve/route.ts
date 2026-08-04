import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/models/transaction";
import User from "@/models/User";
import { creditWallet } from "@/services/wallet.service";
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
    const { note } = body;

    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
    }

    // IDEMPOTENCY CHECK: Prevent duplicate approval
    if (transaction.status !== "pending") {
      const message = transaction.status === "success" 
        ? "Payment has already been approved and processed"
        : "Payment cannot be approved - current status: " + transaction.status;
      
      await logAuditAction("PAYMENT_APPROVE_FAILED", {
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

    // Verify it's a credit transaction
    if (transaction.type !== "credit") {
      return NextResponse.json({ success: false, message: "Not a credit transaction" }, { status: 400 });
    }

    // ATOMIC OPERATION: Use MongoDB session for transaction
    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();

    try {
      // Update transaction status
      transaction.status = "success";
      transaction.approvedAt = new Date();
      transaction.approvedBy = adminId;
      transaction.description = note || transaction.description;
      await transaction.save({ session: mongoSession });

      // Credit user wallet
      const newBalance = await creditWallet({
        userId: transaction.userId,
        amount: transaction.amount,
      });

      // Commit transaction
      await mongoSession.commitTransaction();
      mongoSession.endSession();

      // Log audit action (outside transaction)
      await logAuditAction("PAYMENT_APPROVED", {
        adminId,
        adminEmail,
        paymentId: id,
        transactionId: transaction.reference,
        userId: transaction.userId,
        amount: transaction.amount,
        previousStatus: "pending",
        newStatus: "success",
        note,
        ip: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || "",
      });

      // Notify user
      await createUserNotification(
        transaction.userId,
        "payment_approved",
        "Payment Approved",
        `Your wallet funding of ₦${Number(transaction.amount).toLocaleString()} has been successfully approved.`,
        {
          transactionId: transaction._id.toString(),
          reference: transaction.reference,
          amount: transaction.amount,
          newBalance,
        }
      );

      // Notify admins
      await createNotificationForAdmins(
        "payment_approved",
        "Payment Approved",
        `Admin ${adminEmail} approved payment ${transaction.reference} for ₦${Number(transaction.amount).toLocaleString()}`,
        {
          transactionId: transaction._id.toString(),
          reference: transaction.reference,
          amount: transaction.amount,
          approvedBy: adminEmail || "Unknown Admin",
        }
      );

      // Emit real-time update to admin dashboard
      if (global.paymentSocketEmitters) {
        global.paymentSocketEmitters.emitPaymentApproved({
          paymentId: transaction._id.toString(),
          reference: transaction.reference,
          amount: transaction.amount,
          userId: transaction.userId,
          approvedBy: adminEmail,
        });
      }

      return NextResponse.json({
        success: true,
        message: "Payment approved successfully",
        payment: {
          ...transaction.toObject(),
          user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            walletBalance: newBalance,
          },
        },
      });
    } catch (error) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Payment approval error:", error);

    await logAuditAction("PAYMENT_APPROVE_ERROR", {
      adminId,
      adminEmail,
      paymentId: id,
      error: error instanceof Error ? error.message : "Unknown error",
      ip: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "",
    });

    return NextResponse.json(
      { success: false, message: "Failed to approve payment" },
      { status: 500 }
    );
  }
}
