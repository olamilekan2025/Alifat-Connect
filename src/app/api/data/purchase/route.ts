// app/api/data/purchase/route.ts

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
      plan,
      pin,
    } = body;

    // VALIDATION
    if (
      !network ||
      !phone ||
      !amount ||
      !plan ||
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
            "Invalid amount",
        },
        {
          status: 400,
        },
      );
    }

    // VALIDATE PHONE
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

    // VALIDATE PIN
    if (
      !/^\d{4}$/.test(
        String(pin),
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

    // CHECK PAYMENT PIN
    if (!user.paymentPin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please set payment PIN in settings",
        },
        {
          status: 400,
        },
      );
    }

    // VERIFY PIN
    const isPinCorrect =
      await bcrypt.compare(
        String(pin),
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

    // CHECK BALANCE
    const currentBalance =
      Number(
        user.walletBalance || 0,
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
            "Insufficient wallet balance",
        },
        {
          status: 400,
        },
      );
    }

    // DEDUCT BALANCE
    user.walletBalance =
      currentBalance -
      parsedAmount;

    await user.save();

    // SAVE TRANSACTION
    await Transaction.create({
      userId:
        user._id.toString(),

      type: "debit",

      category: "data",

      network,

      phone,

      plan,

      amount:
        parsedAmount,

      status: "success",

      description: `${network} ${plan} data purchase`,
    });

    // READY FOR REAL API INTEGRATION
    /*
      CONNECT VTU API HERE

      Example:

      const apiResponse = await fetch(...)

      if failed:
        refund user
        update transaction status
    */

    return NextResponse.json(
      {
        success: true,

        message:
          "Data purchase successful",

        balance:
          user.walletBalance,
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