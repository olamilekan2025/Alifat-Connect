import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/models/transaction";
import User from "@/models/User";
import mongoose from "mongoose";

function isAdmin(session: any) {
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

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const type = searchParams.get("type") || "";

    // Only fetch funding transactions (payments)
    const query: Record<string, unknown> = { category: "funding" };

    if (status) {
      const s = String(status).toLowerCase();
      if (['pending', 'success', 'failed'].includes(s)) query.status = s;
    }

    if (type) {
      const t = String(type).toLowerCase();
      if (['credit', 'debit'].includes(t)) query.type = t;
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const userIds = [
      ...new Set(
        transactions
          .map((t) => String(t.userId))
          .filter((id) => mongoose.Types.ObjectId.isValid(id))
      ),
    ].map((id) => new mongoose.Types.ObjectId(id));

    const users = await User.find({
      _id: { $in: userIds },
    })
      .select("firstname lastname name email phone accountType role walletBalance")
      .lean();

    const userMap = new Map(
      users.map((u) => [String(u._id), u])
    );

    let results = transactions.map((tx) => ({
      ...tx,
      user: userMap.get(String(tx.userId)) || null,
    }));

    if (search) {
      const q = search.toLowerCase();
      results = results.filter((item) => {
        const user = item.user;
        return (
          item.reference?.toLowerCase().includes(q) ||
          item.phone?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          user?.email?.toLowerCase().includes(q) ||
          user?.firstname?.toLowerCase().includes(q) ||
          user?.lastname?.toLowerCase().includes(q) ||
          user?.name?.toLowerCase().includes(q)
        );
      });
    }

    const totalTransactions = await Transaction.countDocuments(query);
    const totalFiltered = results.length;

    return NextResponse.json({
      success: true,
      page,
      limit,
      totalTransactions,
      totalFiltered,
      payments: results,
    });
  } catch (error) {
    console.error("Admin payments error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
