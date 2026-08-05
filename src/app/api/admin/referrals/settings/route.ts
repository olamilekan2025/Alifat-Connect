import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import AdminSettings from "@/models/AdminSettings";

function isAdmin(session: { user?: { role?: string } } | null) {
  return String(session?.user?.role || "").toLowerCase() === "admin";
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

    await connectToDatabase();

    let settings = await AdminSettings.findOne();

    if (!settings) {
      settings = await AdminSettings.create({});
    }

    // Extract referral-specific settings
    const referralSettings = settings.referral || {
      enabled: false,
      rewardType: "fixed",
      fixedRewardAmount: 0,
      percentageReward: 0,
      minimumQualificationAmount: 0,
      maximumReward: 0,
      autoCreditReward: true,
      qualificationCondition: "first_transaction",
    };

    return NextResponse.json({
      success: true,
      settings: referralSettings,
    });
  } catch (error) {
    console.error("Admin referral settings error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch referral settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (!isAdmin(session)) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      enabled,
      rewardType,
      fixedRewardAmount,
      percentageReward,
      minimumQualificationAmount,
      maximumReward,
      autoCreditReward,
      qualificationCondition,
    } = body;

    // Validate inputs
    if (typeof enabled !== "boolean") {
      return NextResponse.json({ success: false, message: "Invalid enabled value" }, { status: 400 });
    }

    if (!["fixed", "percentage"].includes(rewardType)) {
      return NextResponse.json({ success: false, message: "Invalid reward type" }, { status: 400 });
    }

    if (fixedRewardAmount !== undefined && (typeof fixedRewardAmount !== "number" || fixedRewardAmount < 0)) {
      return NextResponse.json({ success: false, message: "Invalid fixed reward amount" }, { status: 400 });
    }

    if (percentageReward !== undefined && (typeof percentageReward !== "number" || percentageReward < 0 || percentageReward > 100)) {
      return NextResponse.json({ success: false, message: "Invalid percentage reward" }, { status: 400 });
    }

    if (minimumQualificationAmount !== undefined && (typeof minimumQualificationAmount !== "number" || minimumQualificationAmount < 0)) {
      return NextResponse.json({ success: false, message: "Invalid minimum qualification amount" }, { status: 400 });
    }

    if (maximumReward !== undefined && (typeof maximumReward !== "number" || maximumReward < 0)) {
      return NextResponse.json({ success: false, message: "Invalid maximum reward" }, { status: 400 });
    }

    if (typeof autoCreditReward !== "boolean") {
      return NextResponse.json({ success: false, message: "Invalid auto credit reward value" }, { status: 400 });
    }

    await connectToDatabase();

    let settings = await AdminSettings.findOne();

    if (!settings) {
      settings = await AdminSettings.create({});
    }

    // Update referral settings
    settings.referral = {
      enabled: enabled !== undefined ? enabled : settings.referral?.enabled || false,
      rewardType: rewardType || settings.referral?.rewardType || "fixed",
      fixedRewardAmount: fixedRewardAmount !== undefined ? fixedRewardAmount : settings.referral?.fixedRewardAmount || 0,
      percentageReward: percentageReward !== undefined ? percentageReward : settings.referral?.percentageReward || 0,
      minimumQualificationAmount: minimumQualificationAmount !== undefined ? minimumQualificationAmount : settings.referral?.minimumQualificationAmount || 0,
      maximumReward: maximumReward !== undefined ? maximumReward : settings.referral?.maximumReward || 0,
      autoCreditReward: autoCreditReward !== undefined ? autoCreditReward : settings.referral?.autoCreditReward !== undefined ? settings.referral.autoCreditReward : true,
      qualificationCondition: qualificationCondition || settings.referral?.qualificationCondition || "first_transaction",
    };

    await settings.save();

    return NextResponse.json({
      success: true,
      message: "Referral settings updated successfully",
      settings: settings.referral,
    });
  } catch (error) {
    console.error("Admin referral settings update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update referral settings" },
      { status: 500 }
    );
  }
}
