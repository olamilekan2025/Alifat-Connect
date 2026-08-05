import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Referral from "@/models/Referral";
import AdminSettings from "@/models/AdminSettings";

/**
 * Process a referral when a new user registers
 * @param newUserId - The ID of the newly registered user
 * @param referralCode - The referral code used during registration (optional)
 * @returns Object with success status and referral information
 */
export async function processReferral(
  newUserId: string,
  referralCode?: string | null
) {
  try {
    await connectToDatabase();

    // If no referral code provided, return early
    if (!referralCode) {
      return { success: true, referral: null };
    }

    // Find the referrer by referral code
    const referrer = await User.findOne({ referralCode });

    if (!referrer) {
      return { success: false, message: "Invalid referral code" };
    }

    // Prevent self-referral
    if (String(referrer._id) === newUserId) {
      return { success: false, message: "Self-referral not allowed" };
    }

    // Check if this referral already exists
    const existingReferral = await Referral.findOne({
      referrerId: String(referrer._id),
      referredUserId: newUserId,
    } as Record<string, string>);

    if (existingReferral) {
      return { success: false, message: "Referral already exists" };
    }

    // Get referral settings
    const settings = await AdminSettings.findOne();
    const referralSettings = settings?.referral || {
      enabled: false,
      rewardType: "fixed",
      fixedRewardAmount: 0,
      percentageReward: 0,
      minimumQualificationAmount: 0,
      maximumReward: 0,
      autoCreditReward: true,
      qualificationCondition: "first_transaction",
    };

    // Check if referral system is enabled
    if (!referralSettings.enabled) {
      return { success: true, referral: null, message: "Referral system disabled" };
    }

    // Calculate reward amount
    let rewardAmount = 0;
    if (referralSettings.rewardType === "fixed") {
      rewardAmount = referralSettings.fixedRewardAmount || 0;
    } else {
      // Percentage-based - will be calculated based on qualification amount later
      rewardAmount = 0;
    }

    // Apply maximum reward limit
    if (referralSettings.maximumReward && referralSettings.maximumReward > 0 && rewardAmount > referralSettings.maximumReward) {
      rewardAmount = referralSettings.maximumReward;
    }

    // Create referral record
    const referral = await Referral.create({
      referrerId: String(referrer._id),
      referredUserId: newUserId,
      referralCode,
      rewardAmount,
      rewardType: referralSettings.rewardType,
      status: referralSettings.autoCreditReward ? "rewarded" : "pending",
      qualificationStatus: "pending",
      qualificationCondition: referralSettings.qualificationCondition,
    });

    // If auto-credit is enabled, update referrer's stats and wallet
    if (referralSettings.autoCreditReward && rewardAmount > 0) {
      referrer.referralsCount = (referrer.referralsCount || 0) + 1;
      referrer.referralEarnings = (referrer.referralEarnings || 0) + rewardAmount;
      referrer.walletBalance = (referrer.walletBalance || 0) + rewardAmount;
      await referrer.save();
    } else {
      // Just update the count if not auto-crediting
      referrer.referralsCount = (referrer.referralsCount || 0) + 1;
      await referrer.save();
    }

    return {
      success: true,
      referral,
      message: referralSettings.autoCreditReward ? "Referral processed and reward credited" : "Referral processed, pending qualification",
    };
  } catch (error) {
    console.error("Referral processing error:", error);
    return { success: false, message: "Failed to process referral" };
  }
}

/**
 * Qualify a referral and credit the reward
 * @param referralId - The ID of the referral to qualify
 * @param qualificationAmount - The amount that triggered qualification (for percentage-based rewards)
 * @returns Object with success status
 */
export async function qualifyReferral(
  referralId: string,
  qualificationAmount?: number
) {
  try {
    await connectToDatabase();

    const referral = await Referral.findById(referralId);

    if (!referral) {
      return { success: false, message: "Referral not found" };
    }

    if (referral.status === "rewarded" || referral.qualificationStatus === "qualified") {
      return { success: false, message: "Referral already qualified" };
    }

    // Get referral settings
    const settings = await AdminSettings.findOne();
    const referralSettings = settings?.referral || {
      rewardType: "fixed",
      fixedRewardAmount: 0,
      percentageReward: 0,
      minimumQualificationAmount: 0,
      maximumReward: 0,
    };

    // Check minimum qualification amount
    if (referralSettings.minimumQualificationAmount && referralSettings.minimumQualificationAmount > 0) {
      if (!qualificationAmount || qualificationAmount < referralSettings.minimumQualificationAmount) {
        return { success: false, message: "Qualification amount not met" };
      }
    }

    // Calculate reward
    let rewardAmount = referral.rewardAmount;
    if (referralSettings.rewardType === "percentage" && qualificationAmount && referralSettings.percentageReward) {
      rewardAmount = (qualificationAmount * referralSettings.percentageReward) / 100;
    }

    // Apply maximum reward limit
    if (referralSettings.maximumReward && referralSettings.maximumReward > 0 && rewardAmount > referralSettings.maximumReward) {
      rewardAmount = referralSettings.maximumReward;
    }

    // Update referral
    referral.status = "rewarded";
    referral.qualificationStatus = "qualified";
    referral.qualifiedAt = new Date();
    referral.rewardedAt = new Date();
    referral.rewardAmount = rewardAmount;
    referral.qualificationAmount = qualificationAmount;

    await referral.save();

    // Update referrer
    const referrer = await User.findById(referral.referrerId);
    if (referrer) {
      referrer.referralEarnings = (referrer.referralEarnings || 0) + rewardAmount;
      referrer.walletBalance = (referrer.walletBalance || 0) + rewardAmount;
      await referrer.save();
    }

    return {
      success: true,
      message: "Referral qualified and reward credited",
      rewardAmount,
    };
  } catch (error) {
    console.error("Referral qualification error:", error);
    return { success: false, message: "Failed to qualify referral" };
  }
}

/**
 * Validate a referral code
 * @param referralCode - The referral code to validate
 * @returns Object with success status and referrer information
 */
export async function validateReferralCode(referralCode: string) {
  try {
    await connectToDatabase();

    const referrer = await User.findOne({ referralCode });

    if (!referrer) {
      return { success: false, message: "Invalid referral code" };
    }

    return {
      success: true,
      referrer: {
        id: referrer._id,
        name: referrer.name,
        email: referrer.email,
      },
    };
  } catch (error) {
    console.error("Referral code validation error:", error);
    return { success: false, message: "Failed to validate referral code" };
  }
}
