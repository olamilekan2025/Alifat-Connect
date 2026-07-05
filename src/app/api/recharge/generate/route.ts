import { NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import Transaction from "@/models/transaction";
import RechargeCardHistory from "@/models/RechargeCardHistory";
import {
  updateMembership,
  getMembershipBenefits,
  calculateDiscount,
} from "@/lib/membership";

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
  const session = await mongoose.startSession();

  try {
    await connectToDatabase();

    const auth =
      await getServerSession(authOptions);

    if (!auth?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const network = String(body.network ?? "")
  .trim()
  .toLowerCase();

const numericAmount = Number(body.amount);

const numericQuantity = Number(body.quantity);

const businessName = String(
  body.businessName ?? ""
).trim();

const pin = String(body.pin ?? "").trim();
if (!/^\d{4}$/.test(pin)) {
  return NextResponse.json(
    {
      success: false,
      error: "PIN must be 4 digits.",
    },
    {
      status: 400,
    }
  );
}
    if (
  !network ||
  !pin ||
  !Number.isFinite(numericAmount) ||
  !Number.isFinite(numericQuantity)
) {
  return NextResponse.json(
    {
      success: false,
      error: "All fields are required.",
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
  !Number.isInteger(numericAmount) ||
  !allowedAmounts.includes(numericAmount)
) {
  return NextResponse.json(
    {
      success: false,
      error: "Invalid recharge amount.",
    },
    {
      status: 400,
    }
  );
}

   if (
  !Number.isInteger(numericQuantity) ||
  numericQuantity < 1 ||
  numericQuantity > 100
) {
  return NextResponse.json(
    {
      success: false,
      error: "Quantity must be between 1 and 100.",
    },
    {
      status: 400,
    }
  );
}

    // START ATOMIC TRANSACTION
    session.startTransaction();

 const user = await User.findOne({
  email: auth.user.email,
}).session(session);

if (!user) {
  await session.abortTransaction();
  session.endSession();
  return NextResponse.json(
    {
      success: false,
      error: "User not found",
    },
    {
      status: 404,
    }
  );
}

if (!user.paymentPin) {
  await session.abortTransaction();
  session.endSession();
  return NextResponse.json(
    {
      success: false,
      error: "Please set your payment PIN.",
    },
    {
      status: 400,
    }
  );
}



const validPin = await bcrypt.compare(
  pin,
  user.paymentPin
);

if (!validPin) {
  await session.abortTransaction();
  session.endSession();
  return NextResponse.json(
    {
      success: false,
      error: "Incorrect payment PIN.",
    },
    {
      status: 400,
    }
  );
}

const benefits = await getMembershipBenefits(
  user._id.toString()
);

    const totalCost =
  numericAmount *
  numericQuantity;

const {
  discount,
  payable: chargedAmount,
} = calculateDiscount(
  totalCost,
  benefits.rechargeCardDiscount
);

const discountAmount = Number(
  discount.toFixed(2)
);

const payableAmount = Number(
  chargedAmount.toFixed(2)
);

const balanceBefore = Number(
  user.walletBalance || 0
);

if (balanceBefore < payableAmount) {
  await session.abortTransaction();
  session.endSession();
  return NextResponse.json(
    {
      success: false,
      error: "Insufficient wallet balance",
    },
    { status: 400 }
  );
}

    const generatedPins =
      generatePinsArray(
        network,
        numericQuantity
      );

    const batchId = `BCH-${Date.now()}-${crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()}`;

/* =========================================
   CRITICAL: ATOMIC BALANCE DEDUCTION
========================================= */
const updatedUser = await User.findOneAndUpdate(
  {
    _id: user._id,
    walletBalance: { $gte: payableAmount },
  },
  {
    $inc: {
      walletBalance: -payableAmount,
      lifetimeSavings: discountAmount,
    },
  },
  {
    new: true,
    session,
  }
);

if (!updatedUser) {
  await session.abortTransaction();
  session.endSession();
  return NextResponse.json(
    {
      success: false,
      error:
        "Balance update failed (possible concurrent request)",
    },
    { status: 409 }
  );
}

/* =========================================
   WALLET UPDATE
========================================= */
const db = mongoose.connection.db;

if (!db) {
  await session.abortTransaction();
  session.endSession();
  return NextResponse.json(
    {
      success: false,
      error: "Database connection failed",
    },
    { status: 500 }
  );
}

await db.collection("wallets").updateOne(
  {
    userId: user._id.toString(),
  },
  {
    $set: {
      balance: updatedUser.walletBalance,
      updatedAt: new Date(),
    },
    $setOnInsert: {
      accountNumber: Math.floor(
        1000000000 + Math.random() * 9000000000
      ).toString(),
      bankName: "Alifat Connect Pay",
      createdAt: new Date(),
    },
  },
  {
    upsert: true,
    session,
  }
);

  await RechargeCardHistory.create(
    [
      {
        userId: user._id.toString(),

        batchId,

        network: network as "mtn" | "airtel" | "glo" | "9mobile",

        discount: discountAmount,

        amount: numericAmount,

        quantity: numericQuantity,

        totalCost,

        chargedAmount: payableAmount,

        businessName:
          businessName?.trim() ||
          "COMMERCIAL VENDOR",

        status: "success",

        pins: generatedPins,
      }
    ],
    {
      session,
    }
  );

   let transaction = null;

try {
  transaction = await Transaction.create(
    [
      {
        userId: user._id.toString(),

        type: "debit",

        category: "recharge-card",
        provider: network,

        amount: totalCost,

        chargedAmount: payableAmount,

        discount: discountAmount,

        status: "success",

        description: `${network.toUpperCase()} Recharge Card Purchase`,

        reference: batchId,
      }
    ],
    {
      session,
    }
  );
} catch (transactionError) {
  await session.abortTransaction();
  session.endSession();
  console.error(
    "Transaction Save Error:",
    transactionError
  );
  return NextResponse.json(
    {
      success: false,
      error: "Failed to save transaction",
    },
    { status: 500 }
  );
}

    // Commit database transaction
    await session.commitTransaction();
    session.endSession();

// Update membership after a successful purchase.
// Don't fail the purchase if membership update fails.
try {
  await updateMembership(user._id.toString());
} catch (membershipError) {
  console.error(
    "Membership Update Error:",
    membershipError
  );
}

const latestUser = await User.findById(user._id).select(
  "membershipLevel lifetimeSavings walletBalance"
);



return NextResponse.json({
      success: true,

      data: {
  batchId,

  network,

  amount: numericAmount,

  quantity: numericQuantity,

  totalCost,

  chargedAmount: payableAmount,

discount: discountAmount,

 membership: latestUser?.membershipLevel,

  lifetimeSavings: latestUser?.lifetimeSavings,

  items: generatedPins,

  newBalance: latestUser?.walletBalance,

  transaction: transaction ? transaction[0] : null,

  timestamp: new Date().toISOString(),
},
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    session.endSession();

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