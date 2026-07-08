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

// Server-controlled pricing
const PRICES: Record<string, number> = {
  waec: 3500,
  neco: 1200,
  jamb: 4700,
  nabteb: 3000,
};

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

  const provider = String(body.provider ?? "").trim();
const profileId = String(body.profileId ?? "").trim();
const pin = String(body.pin ?? "").trim();
const parsedQuantity = Number(body.quantity);

    // Validation
  if (
  !provider ||
  !profileId ||
  !pin ||
  !Number.isFinite(parsedQuantity)
) {
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
      isNaN(parsedQuantity) ||
      parsedQuantity < 1 ||
      parsedQuantity > 5
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Quantity must be between 1 and 5.",
        },
        {
          status: 400,
        }
      );
    }

    const cleanProvider = provider.toLowerCase();

   const unitPrice =
  PRICES[cleanProvider as keyof typeof PRICES];

    if (!unitPrice) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid exam provider.",
        },
        {
          status: 400,
        }
      );
    }

    const totalCost = unitPrice * parsedQuantity;

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

    // Verify PIN
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

    const isPinCorrect = await bcrypt.compare(
      String(pin),
      user.paymentPin
    );

    if (!isPinCorrect) {
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

    // Wallet check
   // Get membership benefits
const benefits = await getMembershipBenefits(
  user._id.toString()
);

const {
  discount,
  payable: chargedAmount,
} = calculateDiscount(
  totalCost,
  benefits.educationDiscount
);

// Wallet check
const walletBalance = Number(
  user.walletBalance ?? 0
);

if (walletBalance < chargedAmount) {
  await session.abortTransaction();
  session.endSession();
  return NextResponse.json(
    {
      success: false,
      error: "Insufficient wallet balance.",
    },
    {
      status: 400,
    }
  );
}

/* =========================================
   CRITICAL: ATOMIC BALANCE DEDUCTION
========================================= */
const updatedUser = await User.findOneAndUpdate(
  {
    _id: user._id,
    walletBalance: { $gte: chargedAmount },
  },
  {
    $inc: {
      walletBalance: -chargedAmount,
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

    // Generate reference
   const reference = `EDU-${Date.now()}-${Math.random()
  .toString(36)
  .substring(2, 8)
  .toUpperCase()}`;

    // Generate exam pins
    const generatedPins = Array.from(
      { length: parsedQuantity },
      () => ({
        pin: Math.floor(
          100000000000 +
            Math.random() * 900000000000
        ).toString(),
        serial: `SN-${Math.floor(
          100000 + Math.random() * 900000
        )}`,
      })
    );

    // Save transaction
    const transaction = await Transaction.create(
      [
        {
          userId: user._id.toString(),

          type: "debit",

          category: "education",

          amount: totalCost,

          chargedAmount,

          discount,

          status: "success",

          provider: cleanProvider,

          plan: profileId,

          reference,

          description: `${cleanProvider.toUpperCase()} exam PIN purchase`,
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

    return NextResponse.json(
      {
        success: true,
        message: "Purchase completed successfully",

        data: {
  transactionId: reference,

  provider: cleanProvider,

  profileId,

  quantity: parsedQuantity,

  items: generatedPins,

  amount: totalCost,

  chargedAmount,

  discount,

  lifetimeSavings: latestUser?.lifetimeSavings,

  membership: latestUser?.membershipLevel,

  newBalance: latestUser?.walletBalance,

  transaction: transaction[0],
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
      "EDUCATION PURCHASE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}