import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

import User from "@/models/User";
import Transaction from "@/models/transaction";

import {
  getMembershipBenefits,
} from "@/lib/membership";

const PREMIUM_MIN_TRANSACTIONS =
  Number(process.env.PREMIUM_MIN_TRANSACTIONS) || 15;

const ENTERPRISE_MIN_TRANSACTIONS =
  Number(process.env.ENTERPRISE_MIN_TRANSACTIONS) || 100;

const ENTERPRISE_MIN_VOLUME =
  Number(process.env.ENTERPRISE_MIN_VOLUME) || 500000;

export async function GET() {
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
        {
          status: 401,
        },
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
        {
          status: 404,
        },
      );
    }

    const transactionCount =
      await Transaction.countDocuments({
        userId: user._id.toString(),
        type: "debit",
        status: "success",
      });

    const volumeResult =
      await Transaction.aggregate([
        {
          $match: {
            userId: user._id.toString(),
            type: "debit",
            status: "success",
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $ifNull: [
                  "$chargedAmount",
                  "$amount",
                ],
              },
            },
          },
        },
      ]);

    const transactionVolume =
      volumeResult[0]?.total ?? 0;

    const benefits =
      await getMembershipBenefits(
        user._id.toString(),
      );

    let nextLevel = null;
    let remainingTransactions = 0;
    let remainingVolume = 0;

    if (
      user.membershipLevel === "starter"
    ) {
      nextLevel = "premium";

      remainingTransactions =
        Math.max(
          0,
          PREMIUM_MIN_TRANSACTIONS -
            transactionCount,
        );
    }

    if (
      user.membershipLevel === "premium"
    ) {
      nextLevel = "enterprise";

      remainingTransactions =
        Math.max(
          0,
          ENTERPRISE_MIN_TRANSACTIONS -
            transactionCount,
        );

      remainingVolume =
        Math.max(
          0,
          ENTERPRISE_MIN_VOLUME -
            transactionVolume,
        );
    }

    return NextResponse.json({
  success: true,

  membership: {
    level: benefits.level,

    transactionCount,

    transactionVolume,

    benefits: {
      airtimeDiscount: benefits.airtimeDiscount,
      dataDiscount: benefits.dataDiscount,
      cableDiscount: benefits.cableDiscount,
      electricityDiscount:
        benefits.electricityDiscount,
      rechargeCardDiscount:
        benefits.rechargeCardDiscount,
      educationDiscount:
        benefits.educationDiscount,
    },

    requirements: {
      premium: {
        transactions:
          PREMIUM_MIN_TRANSACTIONS,
      },

      enterprise: {
        transactions:
          ENTERPRISE_MIN_TRANSACTIONS,

        volume:
          ENTERPRISE_MIN_VOLUME,
      },
    },

    nextLevel,

    remainingTransactions,

    remainingVolume,
  },
});
  } catch (error) {
    console.error(
      "Membership API Error:",
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