import User from "@/models/User";

export interface MembershipBenefits {
  level: "starter" | "premium" | "enterprise";
  airtimeDiscount: number;
  dataDiscount: number;
  cableDiscount: number;
  electricityDiscount: number;
  rechargeCardDiscount: number;
}

export async function getMembershipBenefits(userId: string): Promise<MembershipBenefits> {
  const user = await User.findById(userId).select("membershipLevel");

  switch (user?.membershipLevel) {
    case "enterprise":
      return {
        level: "enterprise",
        airtimeDiscount: 5,
        dataDiscount: 5,
        cableDiscount: 3,
        electricityDiscount: 3,
        rechargeCardDiscount: 4,
      };

    case "premium":
      return {
        level: "premium",
        airtimeDiscount: 2,
        dataDiscount: 2,
        cableDiscount: 1,
        electricityDiscount: 1,
        rechargeCardDiscount: 2,
      };

    default:
      return {
        level: "starter",
        airtimeDiscount: 0,
        dataDiscount: 0,
        cableDiscount: 0,
        electricityDiscount: 0,
        rechargeCardDiscount: 0,
      };
  }
}