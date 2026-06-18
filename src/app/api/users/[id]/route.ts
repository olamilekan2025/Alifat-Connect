import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

type Params = { params: Promise<{ id: string }> };

// ==========================================
// 1. PATCH: EDIT USER OR TOGGLE SUSPEND
// ==========================================
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    // Whitelist updates to prevent arbitrary data pollution
    const allowedUpdates: Record<string, any> = {};
    
    if (typeof body.isSuspended === "boolean") allowedUpdates.isSuspended = body.isSuspended;
    if (body.role) allowedUpdates.role = body.role;
    if (body.accountType) allowedUpdates.accountType = body.accountType;
    if (body.name) allowedUpdates.name = body.name;
    if (typeof body.walletBalance === "number") allowedUpdates.walletBalance = body.walletBalance;

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json({ success: false, message: "No valid modifications provided" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: "User targeted does not exist" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("USER PATCH ROUTE ERROR:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to update user" }, { status: 500 });
  }
}

// ==========================================
// 2. DELETE: PERMANENTLY REMOVE USER
// ==========================================
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ success: false, message: "User targeted does not exist" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "User completely expunged from records" });
  } catch (error: any) {
    console.error("USER DELETE ROUTE ERROR:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to delete user" }, { status: 500 });
  }
}