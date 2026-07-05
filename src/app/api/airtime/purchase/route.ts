import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";

import bcrypt from "bcryptjs";

import { authOptions } from "@/lib/auth";

import { connectToDatabase } from "@/lib/mongodb";
import mongoose from "mongoose";

import User from "@/models/User";

import Transaction from "@/models/transaction";
import {
  updateMembership,
  getMembershipBenefits,
  calculateDiscount,
} from "@/lib/membership";

export async function POST(request: Request) {
  const session = await mongoose.startSession();

  try {
    await connectToDatabase();

    const auth =
      await getServerSession(
        authOptions,
      );

    if (!auth?.user?.email) {
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

  const body = await request.json();

const network = String(body.network ?? "")
  .trim()
  .toLowerCase();

const phone = String(body.phone ?? "")
  .replace(/\s+/g, "");

const amount = Number(body.amount);

const pinString = String(body.pin ?? "").trim();

    // VALIDATION
  if (
  !network ||
  !phone ||
  !pinString ||
  !Number.isFinite(amount)
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

    // START ATOMIC TRANSACTION
    session.startTransaction();

    const user =
      await User.findOne({
        email:
          auth.user.email,
      }).session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
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
      await session.abortTransaction();
      session.endSession();
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
      await session.abortTransaction();
      session.endSession();
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

    // Get membership benefits
const benefits = await getMembershipBenefits(
  user._id.toString()
);

const { discount, payable } = calculateDiscount(
  parsedAmount,
  benefits.airtimeDiscount
);

const discountAmount = Number(discount.toFixed(2));

const payableAmount = Number(payable.toFixed(2));

    // CONNECT DB
   const db = mongoose.connection.db;

if (!db) {
  await session.abortTransaction();
  session.endSession();
  return NextResponse.json(
    {
      success: false,
      message: "Database connection failed",
    },
    {
      status: 500,
    }
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

// CREATE WALLET IF MISSING
if (!wallet) {
  const accountNumber =
    Math.floor(
      1000000000 +
        Math.random() *
          9000000000,
    ).toString();

  const initialBalance =
    Number(
      user.walletBalance || 0,
    );

  await db
    .collection("wallets")
    .insertOne({
      userId:
        user._id.toString(),

      balance:
        initialBalance,

      accountNumber,

      bankName:
        "Alifat Connect Pay",

      createdAt:
        new Date(),

      updatedAt:
        new Date(),
    });

  wallet =
    await db
      .collection("wallets")
      .findOne({
        userId:
          user._id.toString(),
      });
}

const currentBalance =
  Math.max(
    0,
    Number(
      wallet?.balance ??
        user.walletBalance ??
        0,
    ),
  );

// CHECK BALANCE
if (
  currentBalance < payableAmount
) {
  await session.abortTransaction();
  session.endSession();
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

// CALCULATE NEW BALANCE
const newBalance = Number(
(currentBalance - payableAmount).toFixed(2)
);

if (newBalance < 0) {
  await session.abortTransaction();
  session.endSession();
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
      message:
        "Balance update failed (possible concurrent request)",
    },
    { status: 409 }
  );
}

// UPDATE WALLET BALANCE
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
          updatedUser.walletBalance,

        updatedAt:
          new Date(),
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
    },
  );

 const reference = `AIR-${Date.now()}-${Math.random()
  .toString(36)
  .substring(2, 8)
  .toUpperCase()}`;

 const transaction = await Transaction.create([{
  userId: user._id.toString(),

  type: "debit",

  category: "airtime",

  amount: parsedAmount,

  chargedAmount: payableAmount,

 discount: discountAmount,

  reference,

status: "success",

  description: `${network} airtime purchase`,

  network,

  phone,

  createdAt: new Date(),
}],
{
  session,
});
// Commit database transaction
await session.commitTransaction();
session.endSession();

// Update membership AFTER successful commit
try {
  await updateMembership(user._id.toString());
} catch (membershipError) {
  console.error(
    "Membership Update Error:",
    membershipError
  );
}

const latestUser =
  await User.findById(user._id).select(
    "membershipLevel lifetimeSavings walletBalance"
  );
return NextResponse.json(
  {
    success: true,
    message: "Airtime purchase successful",

    balance: latestUser?.walletBalance,

    amount: parsedAmount,

    chargedAmount: payableAmount,

    discount: discountAmount,

    reference,

    membership:
      latestUser?.membershipLevel,

    lifetimeSavings:
      latestUser?.lifetimeSavings,

    transaction: transaction[0],
  },
  {
    status: 200,
  }
);
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    session.endSession();

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