import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import {
  updateMembership,
  getMembershipBenefits,
  calculateDiscount,
} from "@/lib/membership";

import User from "@/models/User";
import Transaction from "@/models/transaction";

export async function POST(request: Request) {
  const session = await mongoose.startSession();

  try {
    await connectToDatabase();

    const auth = await getServerSession(authOptions);

    if (!auth?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

  const provider = String(
  body.provider ?? ""
)
  .trim()
  .toLowerCase();

    const meterNumber = String(
      body.meterNumber || ""
    ).trim();

    const meterType = String(
      body.meterType || ""
    ).trim();

    const customerName = String(
      body.customerName || ""
    ).trim();

    const pin = String(
      body.pin || ""
    ).trim();

    const parsedAmount = Number(body.amount);

    // Validate request
    if (
  !provider ||
  !meterNumber ||
  !meterType ||
  !customerName ||
  !pin ||
  !Number.isFinite(parsedAmount)
){
      return NextResponse.json(
        {
          success: false,
          error: "All fields are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !["prepaid", "postpaid"].includes(
        meterType
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid meter type.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      isNaN(parsedAmount) ||
      parsedAmount < 500
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Minimum electricity purchase is ₦500.",
        },
        {
          status: 400,
        }
      );
    }

    if (!/^\d{10,13}$/.test(meterNumber)) {
  return NextResponse.json(
    {
      success: false,
      error: "Invalid meter number.",
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
          error: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    // Verify payment PIN
    if (!user.paymentPin) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        {
          success: false,
          error:
            "Please set your payment PIN.",
        },
        {
          status: 400,
        }
      );
    }

    if (!/^\d{4}$/.test(pin)) {
  await session.abortTransaction();
  session.endSession();
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

    const isPinCorrect =
      await bcrypt.compare(
        pin,
        user.paymentPin
      );

    if (!isPinCorrect) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        {
          success: false,
          error:
            "Incorrect payment PIN.",
        },
        {
          status: 400,
        }
      );
    }

    // Membership discount
    const benefits =
      await getMembershipBenefits(
        user._id.toString()
      );

    const {
      discount,
      payable,
    } = calculateDiscount(
      parsedAmount,
      benefits.electricityDiscount
    );

    // Wallet balance
    const currentBalance = Number(
      user.walletBalance ?? 0
    );

    if (currentBalance < payable) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient balance. Wallet: ₦${currentBalance}`,
        },
        {
          status: 400,
        }
      );
    }

    const newBalance = Number(
      (currentBalance - payable).toFixed(2)
    );

    /* =========================================
       CRITICAL: ATOMIC BALANCE DEDUCTION
    ========================================= */
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id,
        walletBalance: { $gte: payable },
      },
      {
        $inc: {
          walletBalance: -payable,
          lifetimeSavings: discount,
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

    // Generate prepaid token
    let token: string | undefined;

    if (meterType === "prepaid") {
      token = Array.from(
        { length: 5 },
        () =>
          Math.floor(
            1000 +
              Math.random() * 9000
          ).toString()
      ).join("-");
    }

    // Transaction reference
   const reference = `ELC-${Date.now()}-${Math.random()
  .toString(36)
  .substring(2, 8)
  .toUpperCase()}`;

    // Save transaction
    const transaction =
      await Transaction.create(
        [
          {
            userId:
              user._id.toString(),

            type: "debit",

            category: "electricity",

            amount: parsedAmount,

            chargedAmount: payable,

            discount,

            status: "success",

            provider,

            meterNumber,

            meterType,

            customerName,

            token,

            reference,

            description: `${provider} electricity purchase`,
          }
        ],
        {
          session,
        }
      );

    // Commit database transaction
    await session.commitTransaction();
    session.endSession();

    // Update membership AFTER successful commit
    try {
      await updateMembership(
        user._id.toString()
      );
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

        data: {
          type: "electricity",

          provider,

          meterNumber,

          meterType,

          customerName,

          amount: parsedAmount,

          chargedAmount: payable,

          discount,

          token,

          status: "success",

          reference,

          newBalance: latestUser?.walletBalance,

         membership:
  latestUser?.membershipLevel,

lifetimeSavings:
  latestUser?.lifetimeSavings,

          transaction: transaction[0],

          createdAt:
            new Date().toISOString(),
        },
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
      "ELECTRICITY PURCHASE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}