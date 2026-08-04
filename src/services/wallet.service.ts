import User from "@/models/User";

export async function deductWallet({
  user,
  payable,
  discount,
}: {
  user: { walletBalance?: number; lifetimeSavings?: number; save: () => Promise<void> };
  payable: number;
  discount: number;
}) {
  const balance = Number(
    user.walletBalance ?? 0
  );

  if (balance < payable) {
    throw new Error(
      "Insufficient wallet balance"
    );
  }

  user.walletBalance = Number(
    (balance - payable).toFixed(2)
  );

  user.lifetimeSavings =
    Number(user.lifetimeSavings ?? 0) +
    discount;

  await user.save();

  return user.walletBalance;
}

export async function creditWallet({
  userId,
  amount,
}: {
  userId: string;
  amount: number;
}) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const currentBalance = Number(user.walletBalance ?? 0);
  user.walletBalance = Number((currentBalance + amount).toFixed(2));

  await user.save();

  return user.walletBalance;
}