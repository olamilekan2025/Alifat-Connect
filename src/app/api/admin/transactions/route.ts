// app/api/admin/transactions/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/models/transaction";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const type = searchParams.get("type") || "";
    const category = searchParams.get("category") || "";

    const query: Record<string, unknown> = {};


    

    // Normalize to match DB schema:
    // - status in DB: pending | success | failed
    // - type in DB: credit | debit
    // - category in DB: airtime | data | transfer | funding | withdrawal
    if (status) {
      const s = String(status).toLowerCase();
      if (['pending', 'success', 'failed'].includes(s)) query.status = s;
    }

    if (type) {
      const t = String(type).toLowerCase();
      if (['credit', 'debit'].includes(t)) query.type = t;
    }

    if (category) {
      const c = String(category).toLowerCase();
      if (['airtime', 'data', 'transfer', 'funding', 'withdrawal'].includes(c)) query.category = c;
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
      .select(
        "firstname lastname name email phone accountType role"
      )
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

    // NOTE: we already applied `status/type/category` in `query`.
    // We apply `search` in-memory after fetching the current page.
    // For correct pagination totals, we return `totalTransactions` based on `query` only
    // and also return `totalFiltered` based on the in-memory filtered results.
    const totalTransactions = await Transaction.countDocuments(query);
    const totalFiltered = results.length;

    const successfulVolume =

      await Transaction.aggregate([
        {
          $match: {
            status: "success",
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amount",
            },
          },
        },
      ]);

    const failedCount =
      await Transaction.countDocuments({
        status: "failed",
      });

    const pendingCount =
      await Transaction.countDocuments({
        status: "pending",
      });

      const successfulCount =
  await Transaction.countDocuments({
    status: "success",
  });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayVolume =
      await Transaction.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfToday,
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amount",
            },
          },
        },
      ]);

    return NextResponse.json({
      success: true,
      page,
      limit,
      totalTransactions,
      totalFiltered,
    summary: {
  successfulCount,
  successfulVolume:
    successfulVolume[0]?.total || 0,
  todayVolume:
    todayVolume[0]?.total || 0,
  pendingCount,
  failedCount,
},
      transactions: results,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch transactions.",
      },
      {
        status: 500,
      }
    );
  }
}