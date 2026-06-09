import mongoose from "mongoose";

const LoginSessionSchema = new mongoose.Schema(
  {
    device: String,
    ipAddress: String,
    location: String,
    isCurrent: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const UserWalletSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    walletPin: {
      type: String,
      default: null,
      select: false,
    },
    dailySpendLimit: {
      type: Number,
      default: 50000,
      min: 0,
      max: 5000000,
    },
    twoFactorAuth: {
      type: Boolean,
      default: true,
    },
    biometricUnlock: {
      type: Boolean,
      default: false,
    },
    emailAlerts: {
      type: Boolean,
      default: true,
    },
    accountTier: {
      type: String,
      enum: ["Tier 1", "Tier 2", "Tier 3"],
      default: "Tier 1",
    },
    isIdentityVerified: {
      type: Boolean,
      default: false,
    },
    loginSessions: [LoginSessionSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.UserWalletSettings ||
  mongoose.model("UserWalletSettings", UserWalletSettingsSchema);