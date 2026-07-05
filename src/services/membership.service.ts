import User from "@/models/User";
import { updateMembership } from "@/lib/membership";

export async function refreshMembership(
  userId: string
) {
  await updateMembership(userId);

  return User.findById(userId).select(
    "membershipLevel lifetimeSavings walletBalance"
  );
}