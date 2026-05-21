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
    | "success"
    | "failed";

  description?: string;

  // AIRTIME / DATA
  network?: string;

  phone?: string;

  plan?: string;

  reference?: string;

  createdAt?: Date;

  updatedAt?: Date;
}

const TransactionSchema =
  new Schema<ITransaction>(
    {
      userId: {
        type: String,
        required: true,
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
      },

      status: {
        type: String,
        enum: [
          "pending",
          "success",
          "failed",
        ],
        default: "success",
      },

      description: {
        type: String,
      },

      network: {
        type: String,
      },

      phone: {
        type: String,
      },

      plan: {
        type: String,
      },

      reference: {
        type: String,
        default: () =>
          `TXN-${Date.now()}`,
      },
    },
    {
      timestamps: true,
    },
  );

const Transaction: Model<ITransaction> =
  models.Transaction ||
  model<ITransaction>(
    "Transaction",
    TransactionSchema,
  );

export default Transaction;