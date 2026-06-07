import { Schema, model, models, Model } from "mongoose";

export interface IRechargeCardHistory {
  userId: string;
  batchId: string;
  network: "mtn" | "airtel" | "glo" | "9mobile";
  amount: number;
  quantity: number;
  totalCost: number;
  businessName: string;
  status: "success" | "failed";
  pins: {
    id: string;
    pin: string;
    serial: string;
    expiryDate: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

const RechargeCardHistorySchema = new Schema<IRechargeCardHistory>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    batchId: {
      type: String,
      required: true,
      unique: true,
    },
    network: {
      type: String,
      required: true,
      enum: ["mtn", "airtel", "glo", "9mobile"],
    },
    amount: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    totalCost: {
      type: Number,
      required: true,
    },
    businessName: {
      type: String,
      default: "COMMERCIAL VENDOR",
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
    pins: [
      {
        id: { type: String, required: true },
        pin: { type: String, required: true },
        serial: { type: String, required: true },
        expiryDate: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const RechargeCardHistory: Model<IRechargeCardHistory> =
  models.RechargeCardHistory ||
  model<IRechargeCardHistory>("RechargeCardHistory", RechargeCardHistorySchema);

export default RechargeCardHistory;