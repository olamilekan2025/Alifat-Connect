import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

import User from "@/models/User";

function generateAccountNumber() {
  return Math.floor(
    1000000000 + Math.random() * 9000000000,
  ).toString();
}

export async function GET() {
  try {
    const session =
      await getServerSession(
        authOptions,
      );

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const mongoose =
      await connectToDatabase();

    const db =
      mongoose.connection.db;

    if (!db) {
      throw new Error(
        "Database connection failed",
      );
    }

    const user =
      await User.findOne({
        email:
          session.user.email,
      });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User not found",
        },
        {
          status: 404,
        },
      );
    }

    let wallet =
      await db
        .collection("wallets")
        .findOne({
          userId:
            user._id.toString(),
        });

    if (!wallet) {
      let accountNumber = "";
      let exists = true;

      while (exists) {
        accountNumber =
          generateAccountNumber();

        const existingWallet =
          await db
            .collection(
              "wallets",
            )
            .findOne({
              accountNumber,
            });

        exists =
          !!existingWallet;
      }

      const newWallet = {
        userId:
          user._id.toString(),

        balance: 0,

        accountNumber,

        bankName:
          "Alifat Connect Pay",

        createdAt:
          new Date(),

        updatedAt:
          new Date(),
      };

      const insertedWallet =
        await db
          .collection(
            "wallets",
          )
          .insertOne(
            newWallet,
          );

      wallet = {
        _id:
          insertedWallet.insertedId,
        ...newWallet,
      };
    }

    const walletBalance =
      Number(
        wallet?.balance || 0,
      );

    if (
      Number(
        user.walletBalance || 0,
      ) !== walletBalance
    ) {
      user.walletBalance =
        walletBalance;

      await user.save();
    }

    const transactions =
      await db
        .collection(
          "transactions",
        )
        .find({
          userId:
            user._id.toString(),
        })
        .sort({
          createdAt: -1,
        })
        .limit(20)
        .toArray();

    return NextResponse.json(
      {
        success: true,

        wallet: {
          balance:
            walletBalance,

          accountNumber:
            wallet
              ?.accountNumber ||
            "",

          bankName:
            wallet?.bankName ||
            "",
        },

        user: {
          id: user._id,

          name:
            user.name || "",

          email:
            user.email || "",

          walletBalance:
            walletBalance,

          hasPaymentPin:
            !!user.paymentPin,
        },

        transactions,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "GET WALLET ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}