import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

import User from "@/models/User";
import Transaction from "@/models/transaction";

const SELLER_UPGRADE_FEE = 5000;

export async function POST() {
  try {
    await connectToDatabase();

    const session =
      await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const user = await User.findOne({
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    if (user.accountType === "seller") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Seller account already active",
        },
        { status: 400 }
      );
    }

    const walletBalance =
      user.walletBalance || 0;

    if (
      walletBalance <
      SELLER_UPGRADE_FEE
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Insufficient wallet balance",
        },
        { status: 400 }
      );
    }

    const balanceBefore =
      walletBalance;

    const balanceAfter =
      balanceBefore -
      SELLER_UPGRADE_FEE;

    user.walletBalance =
      balanceAfter;

    user.accountType = "seller";

    user.sellerSince =
      new Date();

    await user.save();

    try {
      await Transaction.create({
        userId: user._id.toString(),

        type: "debit",

        amount:
          SELLER_UPGRADE_FEE,

        status: "success",

        description:
          "Seller account upgrade",

        reference: `SELLER-${Date.now()}`,
      });
    } catch (transactionError) {
      console.error(
        "Transaction save failed:",
        transactionError
      );
    }

    return NextResponse.json({
      success: true,

      message:
        "Seller account activated successfully",

      data: {
        accountType:
          user.accountType,

        walletBalance:
          user.walletBalance,

        sellerSince:
          user.sellerSince,
      },
    });
  } catch (error) {
    console.error(
      "Seller Upgrade Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to process seller upgrade",
      },
      { status: 500 }
    );
  }
}