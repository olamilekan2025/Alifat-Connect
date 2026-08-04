import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/models/transaction";
import User from "@/models/User";

function isAdmin(session: any) {
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

    await connectToDatabase();

    const { id } = await params;

    const transaction = await Transaction.findById(id).lean();

    if (!transaction) {
      return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
    }

    const user = await User.findById(transaction.userId)
      .select("firstname lastname name email phone accountType role walletBalance")
      .lean();

    return NextResponse.json({
      success: true,
      payment: {
        ...transaction,
        user,
      },
    });
  } catch (error) {
    console.error("Admin payment details error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch payment details" },
      { status: 500 }
    );
  }
}
