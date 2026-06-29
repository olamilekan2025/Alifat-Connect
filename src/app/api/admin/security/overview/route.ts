import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

import User from "@/models/User";
import AdminLoginLog from "@/models/AdminLoginLog";
import AdminSecuritySettings from "@/models/AdminSecuritySettings";

export async function GET() {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const admin = await User.findById(
      (session.user as any).id
    ).lean();

    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    let settings = await AdminSecuritySettings.findOne({
      adminId: admin._id,
    }).lean();

    if (!settings) {
      const created = await AdminSecuritySettings.create({
        adminId: admin._id,
      });

      settings = created.toObject();
    }

    const loginHistory = await AdminLoginLog.find({
      adminId: admin._id,
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const failedLogins = await AdminLoginLog.countDocuments({
      adminId: admin._id,
      success: false,
    });

    // Count unique IPs as active devices
    const activeDevices = await AdminLoginLog.distinct(
      "ip",
      {
        adminId: admin._id,
        success: true,
      }
    );

    let score = 60;

    if (settings.twoFA) score += 10;
    if (settings.emailVerification) score += 5;
    if (settings.smsOtp) score += 5;
    if (settings.biometric) score += 5;
    if (settings.adminPin) score += 5;

    score += Math.round(settings.passwordPolicy / 20);
    score += Math.round(settings.apiSecurity / 20);

    if (admin.emailVerified) score += 5;

    score -= failedLogins * 2;

    score = Math.max(0, Math.min(score, 100));

    return NextResponse.json({
      overview: {
        securityScore: score,

        authentication:
          score >= 90
            ? "Excellent"
            : score >= 75
            ? "Protected"
            : "Needs Attention",

        activeDevices: activeDevices.length,

        alerts: failedLogins,

        totalAdmins: await User.countDocuments({
          role: "admin",
        }),

        lastLogin: admin.lastLoginAt ?? null,

        lastIp: admin.lastLoginIp ?? null,

        lastDevice: admin.lastDevice ?? null,
      },

      authentication: {
        twoFA: settings.twoFA,
        emailVerification: settings.emailVerification,
        smsOtp: settings.smsOtp,
        biometric: settings.biometric,
        adminPin: settings.adminPin,
        sessionTimeout: settings.sessionTimeout,
        passwordPolicy: settings.passwordPolicy,
        apiSecurity: settings.apiSecurity,
        lockdown: settings.lockdown,
        loginNotifications: settings.loginNotifications,
        rememberDevices: settings.rememberDevices,
        maxFailedAttempts: settings.maxFailedAttempts,
        accountLockDuration: settings.accountLockDuration,

        emailVerified: admin.emailVerified,
        adminOtp: admin.adminLoginVerified,
        lastPasswordChange: admin.lastPasswordChange,
        sessionCreatedAt: admin.sessionCreatedAt,
      },

      loginHistory,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}