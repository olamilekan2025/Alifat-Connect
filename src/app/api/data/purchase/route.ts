import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

import User from "@/models/User";
import Transaction from "@/models/transaction";

export async function POST(
  request: Request,
) {
  try {
    const mongoose =
      await connectToDatabase();

    const db =
      mongoose.connection.db;

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

    // SESSION
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

    // BODY
    const body =
      await request.json();

    const network =
      String(
        body.network || "",
      ).trim();

    const phone = String(
      body.phone || "",
    ).trim();

    const planName = String(
      body.planName || "",
    ).trim();

    const pin = String(
      body.pin || "",
    ).trim();

    const amount = Number(
      body.amount,
    );

    // VALIDATION
    if (
      !network ||
      !phone ||
      !planName ||
      !pin
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "All fields are required",
        },
        {
          status: 400,
        },
      );
    }

    if (
      isNaN(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid amount",
        },
        {
          status: 400,
        },
      );
    }

    if (!/^0\d{10}$/.test(phone)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid phone number",
        },
        {
          status: 400,
        },
      );
    }

    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "PIN must be 4 digits",
        },
        {
          status: 400,
        },
      );
    }

    // USER
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

    // PIN CHECK
    if (!user.paymentPin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Set payment PIN first",
        },
        {
          status: 400,
        },
      );
    }

    const isPinCorrect =
      await bcrypt.compare(
        pin,
        user.paymentPin,
      );

    if (!isPinCorrect) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Incorrect payment PIN",
        },
        {
          status: 400,
        },
      );
    }

    // SAFE BALANCE
    const currentBalance =
      Math.max(
        0,
        Number(
          user.walletBalance,
        ) || 0,
      );

    // CHECK BALANCE
    if (
      currentBalance < amount
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `Insufficient balance. Wallet: ₦${currentBalance}`,
        },
        {
          status: 400,
        },
      );
    }

    // NEW BALANCE
    const newBalance =
      currentBalance - amount;

    // FINAL SAFETY
    if (newBalance < 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid balance calculation",
        },
        {
          status: 400,
        },
      );
    }

    // UPDATE USER BALANCE
    user.walletBalance =
      newBalance;

    await user.save();

    // UPDATE WALLET COLLECTION
    await db
      .collection("wallets")
      .updateOne(
        {
          userId:
            user._id.toString(),
        },
        {
          $set: {
            balance:
              newBalance,

            updatedAt:
              new Date(),
          },
        },
      );

    // TRANSACTION
    const transaction =
      await Transaction.create({
        userId:
          user._id.toString(),

        type: "debit",

        category: "data",

        network,

        phone,

        amount,

        status: "success",

        description: `${network} ${planName} data purchase`,
      });

    // RESPONSE
    return NextResponse.json(
      {
        success: true,

        message:
          "Data purchase successful",

        balance:
          newBalance,

        transaction,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "DATA PURCHASE ERROR:",
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