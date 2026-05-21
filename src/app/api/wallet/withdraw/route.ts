import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

import mongoose from "mongoose";

import { connectToDatabase } from "@/lib/mongodb";

export async function POST(
  request: NextRequest
) {
  try {
    const session =
      await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const {
      amount,
      bankCode,
      accountNumber,
      accountName,
    } = body;

    if (
      !amount ||
      !bankCode ||
      !accountNumber ||
      !accountName
    ) {
      return NextResponse.json(
        {
          message:
            "All fields are required",
        },
        {
          status: 400,
        }
      );
    }

    await connectToDatabase();

    const db =
      mongoose.connection.db;

    if (!db) {
      return NextResponse.json(
        {
          message:
            "Database connection failed",
        },
        {
          status: 500,
        }
      );
    }

    const user =
      await db
        .collection("users")
        .findOne({
          email:
            session.user.email.toLowerCase(),
        });

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    const wallet =
      await db
        .collection("wallets")
        .findOne({
          userId:
            user._id.toString(),
        });

    if (!wallet) {
      return NextResponse.json(
        {
          message: "Wallet not found",
        },
        {
          status: 404,
        }
      );
    }

    if (wallet.balance < amount) {
      return NextResponse.json(
        {
          message:
            "Insufficient balance",
        },
        {
          status: 400,
        }
      );
    }

    // DEBIT WALLET

    await db
      .collection("wallets")
      .updateOne(
        {
          userId:
            user._id.toString(),
        },
        {
          $inc: {
            balance: -amount,
          },
        }
      );

    // SAVE TRANSACTION

    await db
      .collection("transactions")
      .insertOne({
        userId:
          user._id.toString(),

        type: "debit",

        amount,

        description:
          `Withdrawal to ${accountName}`,

        status: "successful",

        bankCode,

        accountNumber,

        accountName,

        createdAt: new Date(),
      });

    return NextResponse.json({
      success: true,

      message:
        "Withdrawal successful",
    });
  } catch (error) {
    console.error(
      "WITHDRAW ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}