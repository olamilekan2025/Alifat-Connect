import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Transaction from "@/models/transaction";

const PREMIUM_MIN_TRANSACTIONS =
  Number(process.env.PREMIUM_MIN_TRANSACTIONS) || 15;

const ENTERPRISE_MIN_TRANSACTIONS =
  Number(process.env.ENTERPRISE_MIN_TRANSACTIONS) || 100;

const ENTERPRISE_MIN_VOLUME =
  Number(process.env.ENTERPRISE_MIN_VOLUME) || 500000;

export interface MembershipBenefits {
  level: "starter" | "premium" | "enterprise";

  airtimeDiscount: number;
  dataDiscount: number;
  cableDiscount: number;
  electricityDiscount: number;
  rechargeCardDiscount: number;
  educationDiscount: number;
  bettingDiscount: number;
  subscriptionDiscount: number;
}

export async function updateMembership(
  userId: string
) {
  try {
    await connectToDatabase();

    const user = await User.findById(userId);

    if (!user) {
      return null;
    }

    // Count successful debit transactions
    const successfulTransactions =
      await Transaction.countDocuments({
        userId,
        status: "success",
        type: "debit",
      });

    // Calculate total amount actually charged
    const volumeResult =
      await Transaction.aggregate([
        {
          $match: {
            userId,
            status: "success",
            type: "debit",
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

    const totalVolume =
      volumeResult[0]?.total ?? 0;

    let membershipLevel:
      | "starter"
      | "premium"
      | "enterprise" = "starter";

    // Enterprise
    if (
      user.emailVerified &&
      user.paymentPin &&
      successfulTransactions >=
        ENTERPRISE_MIN_TRANSACTIONS &&
      totalVolume >=
        ENTERPRISE_MIN_VOLUME
    ) {
      membershipLevel = "enterprise";
    }

    // Premium
    else if (
      user.emailVerified &&
      user.paymentPin &&
      successfulTransactions >=
        PREMIUM_MIN_TRANSACTIONS
    ) {
      membershipLevel = "premium";
    }

    // Save only if membership changed
    if (
      membershipLevel !==
      user.membershipLevel
    ) {
      user.membershipLevel =
        membershipLevel;

      user.membershipHistory ??= [];

      const alreadyExists =
        user.membershipHistory.some(
          (history) =>
            history.level === membershipLevel
        );

      if (!alreadyExists) {
        user.membershipHistory.push({
          level: membershipLevel,
          achievedAt: new Date(),
        });
      }

      await user.save();
    }

    return membershipLevel;
  } catch (error) {
    console.error(
      "Membership update failed:",
      error
    );

    return null;
  }
}

export async function getMembershipBenefits(
  userId: string
): Promise<MembershipBenefits> {
  await connectToDatabase();

  const user = await User.findById(userId).select(
    "membershipLevel"
  );

  switch (user?.membershipLevel) {
    case "enterprise":
      return {
        level: "enterprise",

        airtimeDiscount: 5,
        dataDiscount: 5,
        cableDiscount: 3,
        electricityDiscount: 3,
        rechargeCardDiscount: 4,
        educationDiscount: 4,
        bettingDiscount: 3,
        subscriptionDiscount: 3,
      };

    case "premium":
      return {
        level: "premium",

        airtimeDiscount: 2,
        dataDiscount: 2,
        cableDiscount: 1,
        electricityDiscount: 1,
        rechargeCardDiscount: 2,
        educationDiscount: 2,
        bettingDiscount: 1,
        subscriptionDiscount: 1,
      };

    default:
      return {
        level: "starter",

        airtimeDiscount: 0,
        dataDiscount: 0,
        cableDiscount: 0,
        electricityDiscount: 0,
        rechargeCardDiscount: 0,
        educationDiscount: 0,
        bettingDiscount: 0,
        subscriptionDiscount: 0,
      };
  }
}

export function calculateDiscount(
  amount: number,
  percentage: number
) {
  const discount = Number(
    ((amount * percentage) / 100).toFixed(2)
  );

  const payable = Number(
    (amount - discount).toFixed(2)
  );

  return {
    discount,
    payable,
  };
}