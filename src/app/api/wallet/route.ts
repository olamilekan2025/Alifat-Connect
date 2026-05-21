import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

import { connectToDatabase } from "@/lib/mongodb";

import User from "@/models/User";

function generateAccountNumber() {
  return Math.floor(
    1000000000 +
      Math.random() * 9000000000,
  ).toString();
}

export async function GET() {
  try {
    const session =
      await getServerSession(
        authOptions,
      );

    // CHECK AUTH
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

    // CONNECT DATABASE
    const mongooseConnection =
      await connectToDatabase();

    const db =
      mongooseConnection.connection.db;

    if (!db) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Database connection failed",
        },
        {
          status: 500,
        },
      );
    }

    // FIND USER
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

    // FIND WALLET
    let wallet =
      await db
        .collection("wallets")
        .findOne({
          userId:
            user._id.toString(),
        });

    // CREATE WALLET IF NOT EXIST
    if (!wallet) {
      let accountNumber = "";

      let existingWallet =
        null;

      // GENERATE UNIQUE ACCOUNT NUMBER
      do {
        accountNumber =
          generateAccountNumber();

        existingWallet =
          await db
            .collection(
              "wallets",
            )
            .findOne({
              accountNumber,
            });
      } while (
        existingWallet
      );

      const newWallet = {
        userId:
          user._id.toString(),

        balance:
          user.walletBalance ||
          0,

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

    // GET RECENT TRANSACTIONS
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
          ...wallet,

          balance:
            wallet.balance ||
            0,
        },

        user: {
          name:
            user.name || "",

          email:
            user.email || "",

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