import mongoose, {
  Schema,
  model,
  models,
  Model,
} from "mongoose";

export interface ITransaction {
  userId: string;

  type:
    | "credit"
    | "debit";

  category?:
    | "airtime"
    | "data"
    | "transfer"
    | "funding"
    | "withdrawal";

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

  reference?: string;

  approvedAt?: Date;

  approvedBy?: string;

  rejectionReason?: string;

  createdAt?: Date;

  updatedAt?: Date;
}

const TransactionSchema =
  new Schema<ITransaction>(
    {
      userId: {
        type: String,
        required: true,
        index: true,
      },

      type: {
        type: String,
        enum: [
          "credit",
          "debit",
        ],
        required: true,
      },

      category: {
        type: String,
        enum: [
          "airtime",
          "data",
          "transfer",
          "funding",
          "withdrawal",
        ],
        default: "airtime",
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