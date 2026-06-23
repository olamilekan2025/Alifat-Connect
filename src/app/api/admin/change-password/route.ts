import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import AdminSettings from "@/models/AdminSettings";
import bcrypt from "bcryptjs";
import User from "@/models/User";

function isAdmin(session: any) {
  return String(session?.user?.role || "").toLowerCase() === "admin";
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 🔐 IMPORTANT: You must store admin password in DB (hashed)
  
const admin = await User.findById(session.user.id).select("+password");

if (!admin) {
  return NextResponse.json(
    { success: false, message: "Admin account not found" },
    { status: 404 }
  );
}

if (!admin.password) {
  return NextResponse.json(
    { success: false, message: "Password is not configured for this account" },
    { status: 400 }
  );
}

    // check current password
const isMatch = await bcrypt.compare(
  currentPassword,
  admin.password!
);

if (!isMatch) {
  return NextResponse.json(
    {
      success: false,
      message: "Current password is incorrect",
    },
    { status: 400 }
  );
}

// Hash the new password
admin.password = await bcrypt.hash(newPassword, 10);

// Update password change timestamp
admin.lastPasswordChange = new Date();

// Save changes
await admin.save();

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}