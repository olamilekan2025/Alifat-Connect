import type { Response } from "express";

import { connectToDatabase } from "../../../src/lib/mongodb";
import Wallet from "../../../src/models/Wallet";
import Transaction from "../../../src/models/transaction";
import type { AuthenticatedRequest } from "../types/express";

/**
 * GET /api/v1/dashboard
 * Get dashboard data for authenticated user
 */
export async function getDashboard(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) {
      res.status(500).json({
        success: false,
        message: "Database not connected",
      });
      return;
    }

    // Find user
    const user = await db.collection("users").findOne({
      _id: new (await import("mongodb")).ObjectId(req.user.id),
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Find wallet
    const wallet = await db.collection("wallets").findOne({
      userId: req.user.id,
    });

    // Get transactions
    const transactions = await db
      .collection("transactions")
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    const totalTransactions = transactions.length;
    const successfulTransactions = transactions.filter(
      (trx: any) => trx.status === "Successful",
    ).length;
    const successfulRate =
      totalTransactions > 0
        ? Math.round((successfulTransactions / totalTransactions) * 100)
        : 0;

    // Format transactions
    const formattedTransactions = transactions.map((trx: any) => ({
      id: trx._id?.toString() || "",
      title: trx.title || "Transaction",
      amount: `₦${Number(trx.amount || 0).toLocaleString()}`,
      status: trx.status || "Pending",
      time: formatTimeAgo(trx.createdAt),
    }));

    res.status(200).json({
      user: {
        name:
          user.name ||
          `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim() ||
          "User",
        email: user.email || "",
        membershipLevel: user.membershipLevel || "starter",
      },
      wallet: {
        balance: wallet?.balance || 0,
      },
      stats: {
        totalTransactions,
        successfulRate,
      },
      transactions: formattedTransactions,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

/**
 * Format time ago
 */
function formatTimeAgo(date: Date | string): string {
  if (!date) {
    return "Just now";
  }

  const now = new Date().getTime();
  const created = new Date(date).getTime();
  const diff = Math.floor((now - created) / 1000);

  if (diff < 60) {
    return `${diff} secs ago`;
  }

  if (diff < 3600) {
    return `${Math.floor(diff / 60)} mins ago`;
  }

  if (diff < 86400) {
    return `${Math.floor(diff / 3600)} hours ago`;
  }

  return `${Math.floor(diff / 86400)} days ago`;
}
