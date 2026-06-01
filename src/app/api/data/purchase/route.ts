// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import bcrypt from "bcryptjs";

// import { authOptions } from "@/lib/auth";
// import { connectToDatabase } from "@/lib/mongodb";

// import User from "@/models/User";
// import Transaction from "@/models/transaction";

// export async function POST(
//   request: Request,
// ) {
//   try {
//     const mongoose =
//       await connectToDatabase();

//     const db =
//       mongoose.connection.db;

//     if (!db) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Database connection failed",
//         },
//         {
//           status: 500,
//         },
//       );
//     }

//     // SESSION
//     const session =
//       await getServerSession(
//         authOptions,
//       );

//     if (!session?.user?.email) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unauthorized",
//         },
//         {
//           status: 401,
//         },
//       );
//     }

//     // BODY
//     const body =
//       await request.json();

//     const network =
//       String(
//         body.network || "",
//       ).trim();

//     const phone = String(
//       body.phone || "",
//     ).trim();

//     const planName = String(
//       body.planName || "",
//     ).trim();

//     const pin = String(
//       body.pin || "",
//     ).trim();

//     const amount = Number(
//       body.amount,
//     );

//     // VALIDATION
//     if (
//       !network ||
//       !phone ||
//       !planName ||
//       !pin
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "All fields are required",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     if (
//       isNaN(amount) ||
//       amount <= 0
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Invalid amount",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     if (!/^0\d{10}$/.test(phone)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Invalid phone number",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     if (!/^\d{4}$/.test(pin)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "PIN must be 4 digits",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // USER
//     const user =
//       await User.findOne({
//         email:
//           session.user.email,
//       });

//     if (!user) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "User not found",
//         },
//         {
//           status: 404,
//         },
//       );
//     }

//     // PIN CHECK
//     if (!user.paymentPin) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Set payment PIN first",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     const isPinCorrect =
//       await bcrypt.compare(
//         pin,
//         user.paymentPin,
//       );

//     if (!isPinCorrect) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Incorrect payment PIN",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // SAFE BALANCE
//     const currentBalance =
//       Math.max(
//         0,
//         Number(
//           user.walletBalance,
//         ) || 0,
//       );

//     // CHECK BALANCE
//     if (
//       currentBalance < amount
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: `Insufficient balance. Wallet: ₦${currentBalance}`,
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     // NEW BALANCE
// const newBalance =
//   currentBalance - amount;

// // FINAL SAFETY
// if (newBalance < 0) {
//   return NextResponse.json(
//     {
//       success: false,
//       message:
//         "Invalid balance calculation",
//     },
//     {
//       status: 400,
//     },
//   );
// }

// // UPDATE USER BALANCE
// user.walletBalance =
//   newBalance;

// await user.save();

// // ENSURE WALLET EXISTS
// const existingWallet =
//   await db
//     .collection("wallets")
//     .findOne({
//       userId:
//         user._id.toString(),
//     });

// if (!existingWallet) {
//   await db
//     .collection("wallets")
//     .insertOne({
//       userId:
//         user._id.toString(),

//       balance:
//         newBalance,

//       accountNumber:
//         Math.floor(
//           1000000000 +
//             Math.random() *
//               9000000000,
//         ).toString(),

//       bankName:
//         "Alifat Connect Pay",

//       createdAt:
//         new Date(),

//       updatedAt:
//         new Date(),
//     });
// } else {
//   await db
//     .collection("wallets")
//     .updateOne(
//       {
//         userId:
//           user._id.toString(),
//       },
//       {
//         $set: {
//           balance:
//             newBalance,

//           updatedAt:
//             new Date(),
//         },
//       },
//     );
// }

//    const transaction =
//   await Transaction.create({
//     userId:
//       user._id.toString(),

//     type: "debit",

//     category: "data",

//     network,

//     phone,

//     amount,

//     plan: planName,

//     status: "success",

//     description: `${network} ${planName} data purchase`,

//     createdAt:
//       new Date(),
//   });
//     // RESPONSE
//     return NextResponse.json(
//       {
//         success: true,

//         message:
//           "Data purchase successful",

//         balance:
//           newBalance,

//         transaction,
//       },
//       {
//         status: 200,
//       },
//     );
//   } catch (error) {
//     console.error(
//       "DATA PURCHASE ERROR:",
//       error,
//     );

//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           "Internal server error",
//       },
//       {
//         status: 500,
//       },
//     );
//   }
// }



import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

import User from "@/models/User";
import Transaction from "@/models/transaction";

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

    const network = String(body.network || "").trim();
    const phone = String(body.phone || "").trim();
    const planName = String(body.planName || "").trim();
    const pin = String(body.pin || "").trim();
    const amount = Number(body.amount);

    if (!network || !phone || !planName || !pin) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid amount" },
        { status: 400 }
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
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // PIN CHECK (inside transaction safety boundary)
    if (!user.paymentPin) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, message: "No payment PIN set for user" },
        { status: 400 }
      );
    }

    const isPinCorrect = await bcrypt.compare(pin, user.paymentPin as string);

    if (!isPinCorrect) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, message: "Incorrect payment PIN" },
        { status: 400 }
      );
    }

    const currentBalance = Number(user.walletBalance) || 0;

    if (currentBalance < amount) {
      await session.abortTransaction();
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
       - prevents double spending
    ========================================= */
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id,
        walletBalance: { $gte: amount }, // prevents overdraft
      },
      {
        $inc: { walletBalance: -amount },
      },
      {
        new: true,
        session,
      }
    );

    if (!updatedUser) {
      await session.abortTransaction();
      return NextResponse.json(
        {
          success: false,
          message: "Balance update failed (possible concurrent request)",
        },
        { status: 409 }
      );
    }

    /* =========================================
       WALLET LEDGER UPDATE (SAFE INSIDE TX)
    ========================================= */
    const db = mongoose.connection?.db;

    if (!db) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { success: false, message: "Database connection failed" },
        { status: 500 }
      );
    }

    await db.collection("wallets").updateOne(
      { userId: user._id.toString() },
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
      { upsert: true, session }
    );

    /* =========================================
       LEDGER-FIRST TRANSACTION RECORD
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
          plan: planName,
          status: "success",
          description: `${network} ${planName} data purchase`,
          createdAt: new Date(),
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({
      success: true,
      message: "Data purchase successful",
      balance: updatedUser.walletBalance,
      transaction: transaction[0],
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("ATOMIC DATA PURCHASE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}