import mongoose, {
  Schema,
  model,
  models,
  Model,
} from "mongoose";

export interface ITransaction {
  userId: string;

  type: "credit" | "debit";

  category?:
    | "airtime"
    | "data"
    | "electricity"
    | "cable"
    | "recharge-card"
    | "education"
    | "betting"
    | "transfer"
    | "funding"
    | "withdrawal"
    | "subscription";

  amount: number;

  status:
    | "pending"
    | "processing"
    | "success"
    | "failed";

  description?: string;

  network?: string;

  phone?: string;

  plan?: string;

  provider?: string;

  meterNumber?: string;

  meterType?: string;

  customerName?: string;

  token?: string;

  discount?: number;

  chargedAmount?: number;

  reference?: string;

  approvedAt?: Date;

  approvedBy?: string;

  rejectionReason?: string;

  createdAt?: Date;

  updatedAt?: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },

    category: {
      type: String,
      enum: [
        "airtime",
        "data",
        "electricity",
        "cable",
        "recharge-card",
        "education",
        "betting",
        "transfer",
        "funding",
        "withdrawal",
        "subscription",
      ],
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "success",
        "failed",
      ],
      default: "pending",
      index: true,
    },

    description: {
      type: String,
      trim: true,
    },

    network: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    plan: {
      type: String,
      trim: true,
    },

    provider: {
      type: String,
      trim: true,
    },

    meterNumber: {
      type: String,
      trim: true,
    },

    meterType: {
      type: String,
      trim: true,
    },

    customerName: {
      type: String,
      trim: true,
    },

    token: {
      type: String,
      trim: true,
    },

    discount: {
      type: Number,
      default: 0,
    },

    chargedAmount: {
      type: Number,
      default: 0,
    },

    reference: {
      type: String,
      unique: true,
      index: true,
      default: () =>
        `TXN-${Date.now()}-${Math.floor(
          1000 + Math.random() * 9000
        )}`,
    },

    approvedAt: {
      type: Date,
    },

    approvedBy: {
      type: String,
    },

    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction: Model<ITransaction> =
  models.Transaction ||
  model<ITransaction>(
    "Transaction",
    TransactionSchema
  );

export default Transaction;