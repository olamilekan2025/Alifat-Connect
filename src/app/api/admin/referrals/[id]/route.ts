import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Referral from "@/models/Referral";
import User from "@/models/User";
import mongoose from "mongoose";

function isAdmin(session: { user?: { role?: string } } | null) {
  return String(session?.user?.role || "").toLowerCase() === "admin";
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (!isAdmin(session)) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid referral ID" }, { status: 400 });
    }

    await connectToDatabase();

    const referral = await Referral.findById(id).lean();

    if (!referral) {
      return NextResponse.json({ success: false, message: "Referral not found" }, { status: 404 });
    }

    // Fetch referrer and referred user details
    const [referrer, referredUser] = await Promise.all([
      User.findById(referral.referrerId).select(
        "firstname lastname name email referralCode referralsCount referralEarnings createdAt isSuspended"
      ).lean(),
      User.findById(referral.referredUserId).select(
        "firstname lastname name email referralCode createdAt isSuspended"
      ).lean(),
    ]);

    return NextResponse.json({
      success: true,
      referral: {
        ...referral,
        referrer,
        referredUser,
      },
    });
  } catch (error) {
    console.error("Admin referral detail error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch referral details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (!isAdmin(session)) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid referral ID" }, { status: 400 });
    }

    const body = await req.json();
    const { status, cancellationReason } = body;

    await connectToDatabase();

    const referral = await Referral.findById(id);

    if (!referral) {
      return NextResponse.json({ success: false, message: "Referral not found" }, { status: 404 });
    }

    // Validate status transition
    if (status && !["pending", "qualified", "rewarded", "cancelled", "failed"].includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });
    }

    // Update referral
    if (status) {
      referral.status = status;
      
      if (status === "cancelled") {
        referral.cancelledAt = new Date();
        referral.cancellationReason = cancellationReason || "Cancelled by admin";
      }
      
      if (status === "rewarded" && !referral.rewardedAt) {
        referral.rewardedAt = new Date();
      }
      
      if (status === "qualified" && !referral.qualifiedAt) {
        referral.qualifiedAt = new Date();
        referral.qualificationStatus = "qualified";
      }
    }

    await referral.save();

    return NextResponse.json({
      success: true,
      message: "Referral updated successfully",
      referral,
    });
  } catch (error) {
    console.error("Admin referral update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update referral" },
      { status: 500 }
    );
  }
}
