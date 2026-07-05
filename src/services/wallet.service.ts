import User from "@/models/User";

export async function deductWallet({
  user,
  payable,
  discount,
}: {
  user: any;
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