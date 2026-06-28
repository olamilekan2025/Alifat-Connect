import mongoose, { Schema, models, model } from "mongoose";

const WalletSchema = new Schema(
  {
    walletType: {
      type: String,
      enum: ["SYSTEM"],
      default: "SYSTEM",
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    balance: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalInflow: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalOutflow: {
      type: Number,
      default: 0,
      min: 0,
    },

    pendingCredits: {
      type: Number,
      default: 0,
      min: 0,
    },

    pendingDebits: {
      type: Number,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      default: "NGN",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Wallet =
  models.Wallet || model("Wallet", WalletSchema);

export default Wallet;