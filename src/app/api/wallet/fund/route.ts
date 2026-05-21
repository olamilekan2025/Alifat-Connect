import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

import { connectToDatabase } from "@/lib/mongodb";

export async function POST(
  request: Request
) {
  try {
    const session =
      await getServerSession(
        authOptions
      );

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

    const body =
      await request.json();

    const amount = Number(
      body.amount
    );

    if (
      !amount ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid amount",
        },
        {
          status: 400,
        }
      );
    }

    if (amount < 100) {
      return NextResponse.json(
        {
          message:
            "Minimum funding amount is ₦100",
        },
        {
          status: 400,
        }
      );
    }

    const mongooseConnection =
      await connectToDatabase();

    const db =
      mongooseConnection.connection.db;

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

    // FIND USER
    const user =
      await db.collection("users").findOne({
        email: session.user.email,
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

    // FIND WALLET
    let wallet =
      await db.collection("wallets").findOne({
        userId:
          user._id.toString(),
      });

    if (!wallet) {
      return NextResponse.json(
        {
          message:
            "Wallet not found",
        },
        {
          status: 404,
        }
      );
    }

    const newBalance =
      Number(wallet.balance || 0) +
      amount;

    // UPDATE WALLET
    await db
      .collection("wallets")
      .updateOne(
        {
          _id: wallet._id,
        },
        {
          $set: {
            balance:
              newBalance,

            updatedAt:
              new Date(),
          },
        }
      );

    // CREATE TRANSACTION
    await db
      .collection("transactions")
      .insertOne({
        userId:
          user._id.toString(),

        walletId:
          wallet._id.toString(),

        type: "credit",

        amount,

        description:
          "Wallet funding",

        status: "successful",

        createdAt:
          new Date(),
      });

    return NextResponse.json({
      message:
        "Wallet funded successfully",

      balance:
        newBalance,
    });
  } catch (error) {
    console.error(
      "FUND WALLET ERROR:",
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