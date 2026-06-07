import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import RechargeCardHistory from "@/models/RechargeCardHistory";

export async function GET(request: Request) {
  try {
    await connectToDatabase();


    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const query: any = { userId: user._id.toString() };
    if (status && status !== "all") {
      query.status = status;
    }

    const history = await RechargeCardHistory.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Map internal DB schema models perfectly to the frontend structure parameters
    const formatted = history.map((item: any) => ({
      id: item.batchId,
      batchReference: item.batchId,
      network: item.network.toUpperCase(),
      denomination: item.amount,
      quantity: item.quantity,
      totalValue: item.totalCost,
      status: item.status,
      createdAt: item.createdAt ? item.createdAt.toISOString() : new Date().toISOString(),
      pins: item.pins || [],
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Recharge Card History Query Node Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load recharge card history" },
      { status: 500 }
    );
  }
}