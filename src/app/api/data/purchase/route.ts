import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

import User from "@/models/User";
import Transaction from "@/models/transaction";
import {
  updateMembership,
  getMembershipBenefits,
  calculateDiscount,
} from "@/lib/membership";

/* =========================
   ATOMIC DATA PURCHASE
========================= */
export async function POST(request: Request) {
  const session = await mongoose.startSession();
  

  try {
    await connectToDatabase();

    const auth = await getServerSession(authOptions);

    if (!auth?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

   const network = String(body.network ?? "")
  .trim()
  .toLowerCase();
  const phone = String(body.phone ?? "").replace(/\s+/g, "");
    const planName = String(body.planName || "").trim();
    const pin = String(body.pin || "").trim();
    const amount = Number(body.amount);
    const reference = `DATA-${Date.now()}-${Math.random()
  .toString(36)
  .substring(2, 8)
  .toUpperCase()}`;

    if (!network || !phone || !planName || !pin) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

  if (!Number.isFinite(amount) || amount <= 0) {
  return NextResponse.json(
    {
      success: false,
      message: "Invalid amount",
    },
    {
      status: 400,
    }
  );
}

    if (!/^0\d{10}$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: "Invalid phone number" },
        { status: 400 }
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
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // PIN CHECK
    if (!user.paymentPin) {
      await session.abortTransaction();
      session.endSession();

      return NextResponse.json(
        { success: false, message: "No payment PIN set for user" },
        { status: 400 }
      );
    }

    if (!/^\d{4}$/.test(pin)) {
  await session.abortTransaction();
  session.endSession();

  return NextResponse.json(
    {
      success: false,
      message: "PIN must be 4 digits",
    },
    {
      status: 400,
    }
  );
}

    const isPinCorrect = await bcrypt.compare(
      pin,
      user.paymentPin as string
    );

    if (!isPinCorrect) {
      await session.abortTransaction();
      session.endSession();

      return NextResponse.json(
        { success: false, message: "Incorrect payment PIN" },
        { status: 400 }
      );
    }

   // Get membership benefits
const benefits = await getMembershipBenefits(
  user._id.toString()
);

const {
  discount,
  payable,
} = calculateDiscount(
  amount,
  benefits.dataDiscount
);

const discountAmount = Number(discount.toFixed(2));
const payableAmount = Number(payable.toFixed(2));

const currentBalance = Number(user.walletBalance ?? 0);

if (currentBalance < payableAmount) {
  await session.abortTransaction();
  session.endSession();

  return NextResponse.json(
    {
      success: false,
      message: `Insufficient balance. Wallet: ₦${currentBalance}`,
    },
    { status: 400 }
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
          message: "Database connection failed",
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

    /* =========================================
       SAVE TRANSACTION
    ========================================= */

    const transaction = await Transaction.create(
      [
       {
  userId: user._id.toString(),
  type: "debit",
  category: "data",
  network,
  phone,
  amount,
  chargedAmount: payableAmount,

discount: discountAmount,
  plan: planName,
  reference,
  status: "success",
  description: `${network} ${planName} data purchase`,
  createdAt: new Date(),
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
  message: "Data purchase successful",

 balance: latestUser?.walletBalance,

  amount,

  chargedAmount: payableAmount,

discount: discountAmount,

lifetimeSavings: latestUser?.lifetimeSavings,

reference,

  membership: latestUser?.membershipLevel,

  transaction: transaction[0],
});
 } catch (error) {
  if (session.inTransaction()) {
    await session.abortTransaction();
  }

  session.endSession();

  console.error("ATOMIC DATA PURCHASE ERROR:", error);

  return NextResponse.json(
    {
      success: false,
      message: "Internal server error",
    },
    {
      status: 500,
    }
  );
}
}