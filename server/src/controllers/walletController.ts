import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/express";

import { connectToDatabase } from "../../../src/lib/mongodb";
import { createUserNotification } from "../../../src/lib/notifications";
import User from "../../../src/models/User";

function generateAccountNumber(): string {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

/**
 * GET /api/v1/wallet
 * Get user wallet details
 */
export async function getWallet(
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
        message: "Database connection failed",
      });
      return;
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    let wallet = await db.collection("wallets").findOne({
      userId: req.user.id,
    });

    if (!wallet) {
      let accountNumber = "";
      let exists = true;

      while (exists) {
        accountNumber = generateAccountNumber();

        const existingWallet = await db.collection("wallets").findOne({
          accountNumber,
        });

        exists = !!existingWallet;
      }

      const newWallet = {
        userId: req.user.id,
        balance: 0,
        accountNumber,
        bankName: "Alifat Connect Pay",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const insertedWallet = await db.collection("wallets").insertOne(newWallet);

      wallet = {
        _id: insertedWallet.insertedId,
        ...newWallet,
      };
    }

    const walletBalance = Number(wallet?.balance || 0);

    if (Number(user.walletBalance || 0) !== walletBalance) {
      user.walletBalance = walletBalance;
      await user.save();
    }

    const transactions = await db
      .collection("transactions")
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    res.status(200).json({
      success: true,
      wallet: {
        balance: walletBalance,
        accountNumber: wallet?.accountNumber || "",
        bankName: wallet?.bankName || "",
      },
      user: {
        id: user._id,
        name: user.name || "",
        email: user.email || "",
        walletBalance,
        hasPaymentPin: !!user.paymentPin,
      },
      transactions,
    });
  } catch (error) {
    console.error("Get wallet error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/**
 * POST /api/v1/wallet/fund
 * Fund user wallet
 */
export async function fundWallet(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }

    const { amount } = req.body ?? {};

    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      res.status(400).json({
        message: "Invalid amount",
      });
      return;
    }

    if (numAmount < 100) {
      res.status(400).json({
        message: "Minimum funding amount is ₦100",
      });
      return;
    }

    const mongooseConnection = await connectToDatabase();
    const db = mongooseConnection.connection.db;

    if (!db) {
      res.status(500).json({
        message: "Database connection failed",
      });
      return;
    }

    const user = await db.collection("users").findOne({
      _id: new (await import("mongodb")).ObjectId(req.user.id),
    });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    let wallet = await db.collection("wallets").findOne({
      userId: req.user.id,
    });

    if (!wallet) {
      res.status(404).json({
        message: "Wallet not found",
      });
      return;
    }

    const newBalance = Number(wallet.balance || 0) + numAmount;

    await db.collection("wallets").updateOne(
      { _id: wallet._id },
      {
        $set: {
          balance: newBalance,
          updatedAt: new Date(),
        },
      },
    );

    const transactionResult = await db.collection("transactions").insertOne({
      userId: req.user.id,
      walletId: wallet._id.toString(),
      type: "credit",
      amount: numAmount,
      description: "Wallet funding",
      status: "successful",
      createdAt: new Date(),
    });

    try {
      await createUserNotification(
        req.user.id,
        "wallet_funded",
        "Wallet Funded",
        `₦${numAmount.toLocaleString()} has been added to your wallet.`,
        {
          transactionId: transactionResult.insertedId.toString(),
          amount: numAmount,
        },
      );
    } catch (notificationError) {
      console.error("Notification creation error:", notificationError);
    }

    res.status(200).json({
      message: "Wallet funded successfully",
      balance: newBalance,
    });
  } catch (error) {
    console.error("Fund wallet error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

/**
 * POST /api/v1/wallet/withdraw
 * Withdraw from user wallet
 */
export async function withdrawWallet(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }

    const { amount, bankCode, accountNumber, accountName } = req.body ?? {};

    if (!amount || !bankCode || !accountNumber || !accountName) {
      res.status(400).json({
        message: "All fields are required",
      });
      return;
    }

    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) {
      res.status(500).json({
        message: "Database connection failed",
      });
      return;
    }

    const user = await db.collection("users").findOne({
      _id: new (await import("mongodb")).ObjectId(req.user.id),
    });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    const wallet = await db.collection("wallets").findOne({
      userId: req.user.id,
    });

    if (!wallet) {
      res.status(404).json({
        message: "Wallet not found",
      });
      return;
    }

    if (wallet.balance < amount) {
      res.status(400).json({
        message: "Insufficient balance",
      });
      return;
    }

    await db.collection("wallets").updateOne(
      { userId: req.user.id },
      { $inc: { balance: -amount } },
    );

    await db.collection("transactions").insertOne({
      userId: req.user.id,
      type: "debit",
      amount,
      description: `Withdrawal to ${accountName}`,
      status: "successful",
      bankCode,
      accountNumber,
      accountName,
      createdAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Withdrawal successful",
    });
  } catch (error) {
    console.error("Withdraw error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}
