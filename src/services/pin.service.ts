import bcrypt from "bcryptjs";
import { IUser } from "@/models/User";

export async function verifyPaymentPin(
  user: IUser,
  pin: string
) {
  if (!user.paymentPin) {
    throw new Error("Please set your payment PIN");
  }

  if (!/^\d{4}$/.test(pin)) {
    throw new Error("PIN must be 4 digits");
  }

  const valid = await bcrypt.compare(
    pin,
    user.paymentPin
  );

  if (!valid) {
    throw new Error("Incorrect payment PIN");
  }
}