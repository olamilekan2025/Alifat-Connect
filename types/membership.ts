export interface MembershipBenefits {
  level: "starter" | "premium" | "enterprise";
  airtimeDiscount: number;
  dataDiscount: number;
  cableDiscount: number;
  electricityDiscount: number;
  rechargeCardDiscount: number;
}

export interface MembershipData {
  level: "starter" | "premium" | "enterprise";

  transactionCount: number;

  transactionVolume: number;

  nextLevel: string | null;

  remainingTransactions: number;

  remainingVolume: number;

  benefits: {
    airtimeDiscount: number;
    dataDiscount: number;
    cableDiscount: number;
    electricityDiscount: number;
    rechargeCardDiscount: number;
    educationDiscount: number;
  };

  requirements: {
    premium: {
      transactions: number;
    };

    enterprise: {
      transactions: number;
      volume: number;
    };
  };
}