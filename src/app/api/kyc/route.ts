import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import KYCVerification from "@/models/KYCVerification";
import KYCDocument from "@/models/KYCDocument";
import User from "@/models/User";
import { createNotificationForAdmins } from "@/lib/notifications/notification.service";
import { NotificationType } from "@/lib/notifications/notification.types";

// GET /api/kyc - Get user's KYC status
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const userId = session.user.id;

    // Get the latest KYC submission for this user
    const kyc = await KYCVerification.findOne({ userId })
      .sort({ version: -1 })
      .lean();

    if (!kyc) {
      return NextResponse.json({
        success: true,
        status: "not_started",
        data: null,
      });
    }

    // Get documents if they exist
    let documents: Array<unknown> = [];
    if (kyc.documentIds && kyc.documentIds.length > 0) {
      documents = await KYCDocument.find({ _id: { $in: kyc.documentIds } })
        .select("documentType storageReference.originalFileName verificationStatus createdAt")
        .lean();
    }

    // Mask sensitive identity information
    const maskedKyc = {
      ...kyc,
      identityInformation: kyc.identityInformation?.idNumber
        ? {
            ...kyc.identityInformation,
            idNumber: maskSensitiveId(kyc.identityInformation.idNumber),
          }
        : kyc.identityInformation,
    };

    return NextResponse.json({
      success: true,
      status: kyc.status,
      data: {
        ...maskedKyc,
        documents,
      },
    });
  } catch (error) {
    console.error("Error fetching KYC:", error);
    return NextResponse.json(
      { error: "Failed to fetch KYC status" },
      { status: 500 }
    );
  }
}

// POST /api/kyc - Submit or update KYC
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const userId = session.user.id;
    const body = await req.json();

    // Validate required fields
    if (!body.personalInformation || !body.identityInformation) {
      return NextResponse.json(
        { error: "Personal and identity information are required" },
        { status: 400 }
      );
    }

    // Check if there's a pending or under_review KYC
    const existingKYC = await KYCVerification.findOne({
      userId,
      status: { $in: ["pending", "under_review"] },
    }).sort({ version: -1 });

    if (existingKYC) {
      return NextResponse.json(
        { error: "You already have a KYC submission under review" },
        { status: 400 }
      );
    }

    // Get user information for pre-fill
    const user = await User.findById(userId).select("email phone firstname lastname").lean();

    // If KYC was rejected, create a new version
    let previousVersionId: string | undefined = undefined;
    let version = 1;

    const lastKYC = await KYCVerification.findOne({ userId }).sort({ version: -1 });
    if (lastKYC) {
      version = lastKYC.version + 1;
      previousVersionId = lastKYC._id?.toString();
    }

    // Create new KYC verification
    const kyc = await KYCVerification.create({
      userId,
      status: "pending",
      personalInformation: {
        firstName: body.personalInformation.firstName || user?.firstname,
        middleName: body.personalInformation.middleName,
        lastName: body.personalInformation.lastName || user?.lastname,
        dateOfBirth: body.personalInformation.dateOfBirth,
        gender: body.personalInformation.gender,
        phone: body.personalInformation.phone || user?.phone,
      },
      identityInformation: {
        idType: body.identityInformation.idType,
        idNumber: body.identityInformation.idNumber,
      },
      addressInformation: body.addressInformation,
      documentIds: body.documentIds || [],
      version,
      previousVersionId,
      submittedAt: new Date(),
    });

    // Update documents with kycId
    if (body.documentIds && body.documentIds.length > 0) {
      await KYCDocument.updateMany(
        { _id: { $in: body.documentIds } },
        { kycId: (kyc as any)._id.toString() }
      );
    }

    // Notify admins about new KYC submission
    await createNotificationForAdmins(
      "kyc_submitted" as NotificationType,
      "New KYC Submission",
      `A new KYC verification has been submitted by ${user?.email || "a user"}`,
      { kycId: (kyc as any)._id.toString(), userId }
    );

    return NextResponse.json({
      success: true,
      message: "KYC submitted successfully",
      data: {
        id: (kyc as any)._id.toString(),
        status: (kyc as any).status,
        version: (kyc as any).version,
      },
    });
  } catch (error) {
    console.error("Error submitting KYC:", error);
    return NextResponse.json(
      { error: "Failed to submit KYC" },
      { status: 500 }
    );
  }
}

// PATCH /api/kyc - Update KYC (for resubmission)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const userId = session.user.id;
    const body = await req.json();

    // Find the latest KYC
    const existingKYC = await KYCVerification.findOne({ userId }).sort({ version: -1 });

    if (!existingKYC) {
      return NextResponse.json(
        { error: "No KYC found for this user" },
        { status: 404 }
      );
    }

    // Only allow updates if status is rejected or requires_resubmission
    if (
      existingKYC.status !== "rejected" &&
      existingKYC.status !== "requires_resubmission"
    ) {
      return NextResponse.json(
        { error: "Cannot update KYC in current status" },
        { status: 400 }
      );
    }

    // Create new version for resubmission
    const version = existingKYC.version + 1;

    const kyc = await KYCVerification.create({
      userId,
      status: "pending",
      personalInformation: body.personalInformation || existingKYC.personalInformation,
      identityInformation: body.identityInformation || existingKYC.identityInformation,
      addressInformation: body.addressInformation || existingKYC.addressInformation,
      documentIds: body.documentIds || existingKYC.documentIds,
      version,
      previousVersionId: existingKYC._id?.toString(),
      submittedAt: new Date(),
    });

    // Update documents with new kycId
    const documentIds = body.documentIds || existingKYC.documentIds;
    if (documentIds && documentIds.length > 0) {
      await KYCDocument.updateMany(
        { _id: { $in: documentIds } },
        { kycId: (kyc as any)._id.toString() }
      );
    }

    // Notify admins about resubmission
    const user = await User.findById(userId).select("email").lean();
    await createNotificationForAdmins(
      "kyc_resubmitted" as NotificationType,
      "KYC Resubmitted",
      `KYC verification has been resubmitted by ${user?.email || "a user"}`,
      { kycId: (kyc as any)._id.toString(), userId }
    );

    return NextResponse.json({
      success: true,
      message: "KYC updated successfully",
      data: {
        id: (kyc as any)._id.toString(),
        status: (kyc as any).status,
        version: (kyc as any).version,
      },
    });
  } catch (error) {
    console.error("Error updating KYC:", error);
    return NextResponse.json(
      { error: "Failed to update KYC" },
      { status: 500 }
    );
  }
}

// Helper function to mask sensitive IDs
function maskSensitiveId(id: string): string {
  if (!id || id.length <= 4) return "****";
  return id.slice(0, 4) + "****" + id.slice(-4);
}
