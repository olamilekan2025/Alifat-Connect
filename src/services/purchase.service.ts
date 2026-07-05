import User from "@/models/User";
import Transaction from "@/models/transaction";

import {
  calculateDiscount,
  updateMembership,
} from "@/lib/membership";

interface ProcessPurchaseParams {
  user: any;

  category:
    | "airtime"
    | "data"
    | "electricity"
    | "cable"
    | "education"
    | "betting"
    | "recharge-card";

  amount: number;

  discountPercentage: number;

  transaction: Record<string, any>;
}

export async function processPurchase({
  user,
  category,
  amount,
  discountPercentage,
  transaction,
}: ProcessPurchaseParams) {
  const { discount, payable } = calculateDiscount(
    amount,
    discountPercentage
  );

  const discountAmount = Number(
    discount.toFixed(2)
  );

  const payableAmount = Number(
    payable.toFixed(2)
  );

  const walletBalance = Number(
    user.walletBalance ?? 0
  );

  if (walletBalance < payableAmount) {
    throw new Error("Insufficient wallet balance.");
  }

  user.walletBalance = Number(
    (walletBalance - payableAmount).toFixed(2)
  );

  user.lifetimeSavings =
    Number(user.lifetimeSavings ?? 0) +
    discountAmount;

  await user.save();

  const savedTransaction =
    await Transaction.create({
      userId: user._id.toString(),

      type: "debit",

      category,

      amount,

      chargedAmount: payableAmount,

      discount: discountAmount,

      status: "success",

      ...transaction,
    });

  await updateMembership(user._id.toString());

  const latestUser = await User.findById(
    user._id
  ).select(
    "walletBalance membershipLevel lifetimeSavings"
  );

  return {
    transaction: savedTransaction,

    balance: latestUser?.walletBalance,

    membership:
      latestUser?.membershipLevel,

    lifetimeSavings:
      latestUser?.lifetimeSavings,

    chargedAmount: payableAmount,

    discount: discountAmount,
  };
}