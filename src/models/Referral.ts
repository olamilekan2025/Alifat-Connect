import { Schema, model, models, Model } from "mongoose";

/**
 * REFERRAL INTERFACE
 */
export interface IReferral {
  referrerId: string;
  referredUserId: string;
  referralCode: string;
  
  // Reward details
  rewardAmount: number;
  rewardType: "fixed" | "percentage";
  
  // Status tracking
  status: "pending" | "qualified" | "rewarded" | "cancelled" | "failed";
  qualificationStatus: "pending" | "qualified" | "not_qualified";
  
  // Transaction reference
  transactionId?: string;
  reference?: string;
  
  // Qualification details
  qualificationCondition?: string;
  qualificationAmount?: number;
  
  // Timestamps
  qualifiedAt?: Date;
  rewardedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * REFERRAL SCHEMA
 */
const ReferralSchema = new Schema<IReferral>(
  {
    referrerId: {
      type: String,
      required: true,
      index: true,
    },
    
    referredUserId: {
      type: String,
      required: true,
      index: true,
    },
    
    referralCode: {
      type: String,
      required: true,
      index: true,
    },
    
    rewardAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    rewardType: {
      type: String,
      enum: ["fixed", "percentage"],
      default: "fixed",
    },
    
    status: {
      type: String,
      enum: ["pending", "qualified", "rewarded", "cancelled", "failed"],
      default: "pending",
      index: true,
    },
    
    qualificationStatus: {
      type: String,
      enum: ["pending", "qualified", "not_qualified"],
      default: "pending",
    },
    
    transactionId: {
      type: String,
      index: true,
    },
    
    reference: {
      type: String,
      index: true,
    },
    
    qualificationCondition: {
      type: String,
    },
    
    qualificationAmount: {
      type: Number,
      min: 0,
    },
    
    qualifiedAt: {
      type: Date,
    },
    
    rewardedAt: {
      type: Date,
    },
    
    cancelledAt: {
      type: Date,
    },
    
    cancellationReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for referrer + referred user to prevent duplicates
ReferralSchema.index({ referrerId: 1, referredUserId: 1 }, { unique: true });

// Index for efficient queries
ReferralSchema.index({ status: 1, createdAt: -1 });
ReferralSchema.index({ referralCode: 1, status: 1 });

/**
 * SAFE MODEL EXPORT
 */
const Referral: Model<IReferral> =
  models.Referral ||
  model<IReferral>("Referral", ReferralSchema);

export default Referral;
