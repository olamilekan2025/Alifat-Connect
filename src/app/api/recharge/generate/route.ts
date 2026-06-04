import { NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

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
  const pinsList: GeneratedPin[] = [];

  for (let i = 0; i < quantity; i++) {
    const length = network === "mtn" ? 17 : 15;

    let pinNumber = "";

    while (pinNumber.length < length) {
      pinNumber += crypto.randomInt(0, 10).toString();
    }

    pinsList.push({
      id: `PIN-${crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase()}`,
      pin: pinNumber,
      serial: `SN-${crypto.randomInt(
        100000,
        999999
      )}-${crypto.randomInt(10, 99)}`,
      expiryDate: new Date(
        Date.now() +
          365 * 24 * 60 * 60 * 1000
      ).toLocaleDateString("en-NG"),
    });
  }

  return pinsList;
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

    if (!network || !amount || !quantity) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    const numericAmount = Number(amount);
    const numericQuantity =
      Number(quantity);

    if (
      !Number.isFinite(numericAmount) ||
      !Number.isFinite(numericQuantity)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Amount and quantity must be numbers",
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

    if (
      !allowedNetworks.includes(network)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid network selected",
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

    const allowedAmounts = [
      100, 200, 500, 1000,
    ];

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

    const walletBalance = Number(
      user.walletBalance || 0
    );

    const totalCost =
      numericAmount * numericQuantity;

    if (totalCost > walletBalance) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Insufficient wallet balance",
        },
        { status: 400 }
      );
    }

    const items = generatePinsArray(
      network,
      numericQuantity
    );

    user.walletBalance =
      walletBalance - totalCost;

    await user.save();

    const batchId = `BCH-${crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()}`;

    return NextResponse.json(
      {
        success: true,
        data: {
          batchId,
          network,
          amount: numericAmount,
          quantity: numericQuantity,
          businessName:
            businessName?.trim() ||
            "COMMERCIAL VENDOR",
          items,
          totalCost,
          newBalance:
            user.walletBalance,
          timestamp:
            new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Recharge generation error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}