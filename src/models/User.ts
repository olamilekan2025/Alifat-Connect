import { Schema, model, models, Model } from "mongoose";

/**
 * USER INTERFACE
 */
export interface IUser {
  name?: string;
  firstname?: string;
  lastname?: string;
  address?: string;
  phone?: string;

  email: string;
  password?: string;
  image?: string;

  role: "admin" | "user" | "moderator";
  accountType: "user" | "seller";

  walletBalance: number;

  sellerSince?: Date | null;

  // SUBSCRIPTION
  subscriptionType?: "monthly" | "quarterly" | "yearly" | null;
  subscriptionActive?: boolean;
  subscriptionExpires?: Date | null;

  // PAYMENT PIN
  paymentPin?: string | null;

  // SETTINGS
  notifications?: boolean;
  emailAlerts?: boolean;

  // EMAIL VERIFICATION
  emailVerified?: boolean;
  loginVerificationCode?: string | null;
  loginVerificationExpires?: Date | null;

  // RESET PIN
  resetPinVerificationToken?: string | null;
  resetPinVerificationExpires?: Date | null;
  isResetPinVerified?: boolean;

  // =========================
  // 🚀 REFERRAL SYSTEM (FIXED)
  // =========================
  referralCode: string;
  referredBy?: string | null;

  referralsCount?: number;
  referralEarnings?: number;

  // timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * USER SCHEMA
 */
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, trim: true },
    firstname: { type: String, trim: true },
    lastname: { type: String, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String },
    image: { type: String },

    role: {
      type: String,
      enum: ["admin", "user", "moderator"],
      default: "user",
    },

    accountType: {
      type: String,
      enum: ["user", "seller"],
      default: "user",
    },

    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    sellerSince: {
      type: Date,
      default: null,
    },

    subscriptionType: {
      type: String,
      enum: ["monthly", "quarterly", "yearly"],
      default: null,
    },

    subscriptionActive: {
      type: Boolean,
      default: false,
    },

    subscriptionExpires: {
      type: Date,
      default: null,
    },

    paymentPin: {
      type: String,
      default: null,
    },

    notifications: {
      type: Boolean,
      default: true,
    },

    emailAlerts: {
      type: Boolean,
      default: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    loginVerificationCode: {
      type: String,
      default: null,
    },

    loginVerificationExpires: {
      type: Date,
      default: null,
    },

    resetPinVerificationToken: {
      type: String,
      default: null,
    },

    resetPinVerificationExpires: {
      type: Date,
      default: null,
    },

    isResetPinVerified: {
      type: Boolean,
      default: false,
    },

    // =========================
    // 🚀 REFERRAL SYSTEM
    // =========================

    referralCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    referredBy: {
      type: String,
      default: null,
      index: true,
    },

    referralsCount: {
      type: Number,
      default: 0,
    },

    referralEarnings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * SAFE MODEL EXPORT (PREVENT OVERWRITE ERROR)
 */
const User: Model<IUser> =
  models.User || model<IUser>("User", UserSchema);

export default User;