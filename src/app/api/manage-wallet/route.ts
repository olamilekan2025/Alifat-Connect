import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import UserWalletSettings from "@/models/UserWalletSettings";
import bcrypt from "bcryptjs";

// 1. GET: Pull active database telemetry metrics for logged-in user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized access node." }, { status: 401 });
    }

    await connectToDatabase();
    
    let settings = await UserWalletSettings.findOne({ userId: session.user.id });
    
    if (!settings) {
      settings = await UserWalletSettings.create({
        userId: session.user.id,
        loginSessions: [{
          device: "Web Browser Node",
          ipAddress: "Dynamic Detect",
          location: "Nigeria",
          isCurrent: true
        }]
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        dailyLimit: settings.dailySpendLimit,
        twoFactorAuth: settings.twoFactorAuth,
        biometricUnlock: settings.biometricUnlock,
        emailAlerts: settings.emailAlerts,
        tierState: settings.accountTier,
        isVerified: settings.isIdentityVerified,
        loginHistory: settings.loginSessions
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("GET WALLET MANAGEMENT ERR:", error);
    return NextResponse.json({ success: false, message: "Internal server data lookup error." }, { status: 500 });
  }
}

// 2. POST: Secure validation and hashing mutation for active user PIN entries
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized session execution." }, { status: 401 });
    }

    const { action, currentPin, newPin } = await request.json();
    await connectToDatabase();

    // Use explicit projection workaround if default select fields are constrained
    const userSettings = await UserWalletSettings.findOne({ userId: session.user.id }).select("+walletPin");
    if (!userSettings) {
      return NextResponse.json({ success: false, message: "User settings structural footprint missing." }, { status: 404 });
    }

    if (action === "UPDATE_PIN") {
      if (!newPin || newPin.length !== 4 || !/^\d+$/.test(newPin)) {
        return NextResponse.json({ success: false, message: "The new pin structure must be exactly 4 digits." }, { status: 400 });
      }

      if (userSettings.walletPin) {
        const isCurrentPinValid = await bcrypt.compare(currentPin, userSettings.walletPin);
        if (!isCurrentPinValid) {
          return NextResponse.json({ success: false, message: "Authentication failure: Old Transaction PIN is invalid." }, { status: 403 });
        }
      }

      const salt = await bcrypt.genSalt(10);
      userSettings.walletPin = await bcrypt.hash(newPin, salt);
      await userSettings.save();

      return NextResponse.json({ success: true, message: "Cryptographic PIN state modified successfully in database." }, { status: 200 });
    }

    return NextResponse.json({ success: false, message: "Unknown process request sequence." }, { status: 400 });

  } catch (error) {
    console.error("POST PIN ERR:", error);
    return NextResponse.json({ success: false, message: "Critical encryption mutation error encountered." }, { status: 500 });
  }
}

// 3. PATCH: Dynamically alter targeted parameter states inside User record
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized operation sequence." }, { status: 401 });
    }

    const body = await request.json();
    const { dailyLimit, twoFactorAuth, biometricUnlock, emailAlerts } = body;

    await connectToDatabase();

    const updateFields: any = {};
    if (dailyLimit !== undefined) {
      const numericLimit = parseInt(String(dailyLimit).replace(/\D/g, ""), 10);
      if (!isNaN(numericLimit) && numericLimit >= 0) {
        updateFields.dailySpendLimit = numericLimit;
      }
    }
    if (twoFactorAuth !== undefined) updateFields.twoFactorAuth = twoFactorAuth;
    if (biometricUnlock !== undefined) updateFields.biometricUnlock = biometricUnlock;
    if (emailAlerts !== undefined) updateFields.emailAlerts = emailAlerts;

    const updatedDoc = await UserWalletSettings.findOneAndUpdate(
      { userId: session.user.id },
      { $set: updateFields },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Database entry updated successfully.",
      data: updatedDoc
    }, { status: 200 });

  } catch (error) {
    console.error("PATCH PREFERENCES ERR:", error);
    return NextResponse.json({ success: false, message: "Data pipeline failed to apply adjustments." }, { status: 500 });
  }
}