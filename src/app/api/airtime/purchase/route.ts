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
    await connectToDatabase();

    const session =
      await getServerSession(
        authOptions,
      );

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const body =
      await request.json();

    const {
      network,
      phone,
      amount,
      pin,
    } = body;

    // VALIDATION
    if (
      !network ||
      !phone ||
      !amount ||
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

    const parsedAmount =
      Number(amount);

    const pinString =
      String(pin);

    if (
      !/^\d{4}$/.test(
        pinString,
      )
    ) {
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

    if (
      isNaN(
        parsedAmount,
      ) ||
      parsedAmount < 50
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Minimum airtime is ₦50",
        },
        {
          status: 400,
        },
      );
    }

    // VALIDATE NIGERIAN PHONE
    if (
      !/^0\d{10}$/.test(
        String(phone),
      )
    ) {
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

    // CHECK PIN
    if (!user.paymentPin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please set your payment PIN",
        },
        {
          status: 400,
        },
      );
    }

    // VERIFY PIN
    const isPinCorrect =
      await bcrypt.compare(
        pinString,
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

    // CONNECT DB
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

    // FIND WALLET
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
          success: false,
          message:
            "Wallet not found",
        },
        {
          status: 404,
        },
      );
    }

    const currentBalance =
      Number(
        wallet.balance || 0,
      );

    // FIXED BUG HERE
    if (
      currentBalance <
      parsedAmount
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Insufficient balance",
        },
        {
          status: 400,
        },
      );
    }

    // NEW BALANCE
    const newBalance =
      currentBalance -
      parsedAmount;

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
        },
      );

    // SAVE TRANSACTION
    await Transaction.create({
      userId:
        user._id.toString(),

      type: "debit",

      amount:
        parsedAmount,

      status: "success",

      description: `${network} airtime purchase`,

      network,

      phone,

      createdAt:
        new Date(),
    });

    return NextResponse.json(
      {
        success: true,

        message:
          "Airtime purchase successful",

        balance:
          newBalance,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "AIRTIME PURCHASE ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong",
      },
      {
        status: 500,
      },
    );
  }
}