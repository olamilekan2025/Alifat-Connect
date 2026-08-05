import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import KYCVerification from "@/models/KYCVerification";
import KYCDocument from "@/models/KYCDocument";
import User from "@/models/User";
import { createUserNotification, createNotificationForAdmins } from "@/lib/notifications/notification.service";
import { NotificationType } from "@/lib/notifications/notification.types";

// GET /api/admin/kyc/[id] - Get specific KYC details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const resolvedParams = await params;
    const kycId = resolvedParams.id;

    const kyc = await KYCVerification.findById(kycId).lean();

    if (!kyc) {
      return NextResponse.json({ error: "KYC not found" }, { status: 404 });
    }

    // Get user information
    const user = await User.findById(kyc.userId).lean();

    // Get documents
    let documents: Array<unknown> = [];
    if (kyc.documentIds && kyc.documentIds.length > 0) {
      documents = await KYCDocument.find({ _id: { $in: kyc.documentIds } }).lean();
    }

    // Get previous versions if any
    let previousVersions: Array<unknown> = [];
    if (kyc.previousVersionId) {
      previousVersions = await KYCVerification.find({
        _id: { $in: [kyc.previousVersionId] },
      })
        .select("status submittedAt reviewedAt reviewedBy")
        .lean();
    }

    return NextResponse.json({
      success: true,
      data: {
        ...kyc,
        _id: kyc._id?.toString(),
        user: user ? {
          id: user._id?.toString(),
          name: user.name || `${user.firstname || ""} ${user.lastname || ""}`.trim(),
          email: user.email,
          phone: user.phone,
          role: user.role,
          accountType: user.accountType,
          createdAt: user.createdAt,
        } : null,
        documents,
        previousVersions,
      },
    });
  } catch (error) {
    console.error("Error fetching KYC details:", error);
    return NextResponse.json(
      { error: "Failed to fetch KYC details" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/kyc/[id]/approve - Approve KYC
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const resolvedParams = await params;
    const kycId = resolvedParams.id;
    const body = await req.json();
    const action = body.action;

    if (action !== "approve" && action !== "reject" && action !== "review") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const kyc = await KYCVerification.findById(kycId);

    if (!kyc) {
      return NextResponse.json({ error: "KYC not found" }, { status: 404 });
    }

    const user = await User.findById(kyc.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const adminId = session.user.id;
    const adminEmail = session.user.email;

    if (action === "approve") {
      // Update KYC status
      kyc.status = "approved";
      kyc.reviewedBy = adminId;
      kyc.reviewedAt = new Date();
      kyc.adminNotes = body.adminNotes || null;
      await kyc.save();

      // Update user verification status
      await User.findByIdAndUpdate(kyc.userId, {
        kycVerified: true,
        kycVerifiedAt: new Date(),
      });

      // Notify user
      await createUserNotification(
        kyc.userId,
        "kyc_approved" as NotificationType,
        "KYC Verification Approved",
        "Your identity verification has been approved successfully",
        { kycId: kyc._id.toString() }
      );

      // Log audit
      await logAuditAction(adminEmail || "admin", "kyc_approved", {
        kycId: kyc._id.toString(),
        userId: kyc.userId || "",
      });

      return NextResponse.json({
        success: true,
        message: "KYC approved successfully",
      });
    }

    if (action === "reject") {
      if (!body.rejectionReason) {
        return NextResponse.json(
          { error: "Rejection reason is required" },
          { status: 400 }
        );
      }

      // Update KYC status
      kyc.status = "rejected";
      kyc.reviewedBy = adminId;
      kyc.reviewedAt = new Date();
      kyc.rejectionReason = body.rejectionReason;
      kyc.adminNotes = body.adminNotes || null;
      await kyc.save();

      // Notify user
      await createUserNotification(
        kyc.userId,
        "kyc_rejected" as NotificationType,
        "KYC Verification Needs Attention",
        `Your identity verification requires updates: ${body.rejectionReason}`,
        { kycId: kyc._id.toString(), rejectionReason: body.rejectionReason }
      );

      // Log audit
      await logAuditAction(adminEmail || "admin", "kyc_rejected", {
        kycId: kyc._id.toString(),
        userId: kyc.userId || "",
        rejectionReason: body.rejectionReason,
      });

      return NextResponse.json({
        success: true,
        message: "KYC rejected successfully",
      });
    }

    if (action === "review") {
      // Update KYC status to under_review
      kyc.status = "under_review";
      kyc.reviewedBy = adminId;
      kyc.reviewedAt = new Date();
      await kyc.save();

      // Log audit
      await logAuditAction(adminEmail || "admin", "kyc_review", {
        kycId: kyc._id.toString(),
        userId: kyc.userId || "",
      });

      return NextResponse.json({
        success: true,
        message: "KYC marked as under review",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating KYC:", error);
    return NextResponse.json(
      { error: "Failed to update KYC" },
      { status: 500 }
    );
  }
}

// Helper function to log audit actions
async function logAuditAction(userEmail: string, action: string, meta: Record<string, unknown>) {
  try {
    const database = (await connectToDatabase())?.connection?.db;
    if (database) {
      await database.collection("admin_audit_logs").insertOne({
        userEmail,
        action,
        meta,
        createdAt: new Date(),
      });
    }
  } catch (error) {
    console.error("Failed to log audit action:", error);
  }
}
