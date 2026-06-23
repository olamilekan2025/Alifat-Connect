import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import AdminSettings from "@/models/AdminSettings";

function isAdmin(session: any) {
  return String(session?.user?.role || "").toLowerCase() === "admin";
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!isAdmin(session)) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const settings = await AdminSettings.findOne({}).lean();

    return NextResponse.json(
      {
        success: true,
        settings: settings || {},
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    if (!isAdmin(session)) {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    const body = await req.json();

    await connectToDatabase();

   const doc = await AdminSettings.findOneAndUpdate(
  {},
  {
    $set: {
      ...(body.notifications && {
        notifications: {
          enableEmailNotifications: false,
          enablePushNotifications: false,
          enableLoginAlerts: false,
          enableWithdrawalAlerts: false,
          enableDepositAlerts: false,
          ...body.notifications,
        },
      }),

      ...(body.adminProfile && {
  adminProfile: {
    adminName: body.adminProfile.adminName ?? "",
    email: body.adminProfile.email ?? "",
    phone: body.adminProfile.phone ?? "",
    role: body.adminProfile.role ?? "Administrator",

    twoFactorEnabled:
      body.adminProfile.twoFactorEnabled ?? false,

    lastLoginAt:
      body.adminProfile.lastLoginAt ?? null,

    lastPasswordChange:
      body.adminProfile.lastPasswordChange ?? null,

    lastLoginIp:
      body.adminProfile.lastLoginIp ?? "",

    lastDevice:
      body.adminProfile.lastDevice ?? "",

    sessionCreatedAt:
      body.adminProfile.sessionCreatedAt ?? null,
  },
}),
    },
  },
  {
    upsert: true,
    new: true,
  }
);

    return NextResponse.json({ success: true, settings: doc });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}