import { NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

import User from "@/models/User";
import Transaction from "@/models/transaction";
import RechargeCardHistory from "@/models/RechargeCardHistory";

interface GeneratedPin {
  id: string;
  pin: string;
  serial: string;
  expiryDate: string;
}

function generatePinsArray(
  network: string,
  quantity: number
): GeneratedPin[] {
  const pins: GeneratedPin[] = [];

  for (let i = 0; i < quantity; i++) {
    const length = network === "mtn" ? 17 : 15;

    let pin = "";

    while (pin.length < length) {
      pin += crypto.randomInt(0, 10).toString();
    }

    pins.push({
      id: `PIN-${crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase()}`,
      pin,
      serial: `SN-${crypto.randomInt(
        100000,
        999999
      )}`,
      expiryDate: new Date(
        Date.now() +
          365 * 24 * 60 * 60 * 1000
      ).toLocaleDateString("en-NG"),
    });
  }

  return pins;
}

export async function POST(
  request: Request
) {
  try {
    await connectToDatabase();

    const session =
      await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      network,
      amount,
      quantity,
      businessName,
    } = body;

    if (
      !network ||
      !amount ||
      !quantity
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields",
        },
        { status: 400 }
      );
    }

    const allowedNetworks = [
      "mtn",
      "airtel",
      "glo",
      "9mobile",
    ];

    const allowedAmounts = [
      100,
      200,
      500,
      1000,
    ];

    const numericAmount =
      Number(amount);

    const numericQuantity =
      Number(quantity);

    if (
      !allowedNetworks.includes(
        network
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid network selected",
        },
        { status: 400 }
      );
    }

    if (
      !allowedAmounts.includes(
        numericAmount
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid recharge amount",
        },
        { status: 400 }
      );
    }

    if (
      numericQuantity < 1 ||
      numericQuantity > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Quantity must be between 1 and 100",
        },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    const totalCost =
      numericAmount *
      numericQuantity;

    const balanceBefore =
      Number(
        user.walletBalance || 0
      );

    if (
      balanceBefore < totalCost
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Insufficient wallet balance",
        },
        { status: 400 }
      );
    }

    const balanceAfter =
      balanceBefore - totalCost;

    const generatedPins =
      generatePinsArray(
        network,
        numericQuantity
      );

    const batchId = `BCH-${Date.now()}-${crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()}`;

    user.walletBalance =
      balanceAfter;

    await user.save();

    await RechargeCardHistory.create({
      userId:
        user._id.toString(),

      batchId,

      network,

      amount:
        numericAmount,

      quantity:
        numericQuantity,

      totalCost,

      businessName:
        businessName?.trim() ||
        "COMMERCIAL VENDOR",

      status: "success",

      pins: generatedPins,
    });

    try {
      await Transaction.create({
        userId:
          user._id.toString(),

        type: "debit",

        amount: totalCost,

        status: "success",

        description: `${network.toUpperCase()} Recharge Card Purchase`,

        reference: batchId,
      });
    } catch (transactionError) {
      console.error(
        "Transaction Save Error:",
        transactionError
      );
    }

    return NextResponse.json({
      success: true,

      data: {
        batchId,

        network,

        amount:
          numericAmount,

        quantity:
          numericQuantity,

        totalCost,

        items:
          generatedPins,

        newBalance:
          balanceAfter,

        timestamp:
          new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error(
      "Recharge Card Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate recharge cards",
      },
      {
        status: 500,
      }
    );
  }
}