import mongoose, {
  Schema,
  model,
  models,
  Model,
} from "mongoose";

export interface IVirtualAccount {
  userId: mongoose.Types.ObjectId;

  bankName: string;

  accountName: string;

  accountNumber: string;

  provider: string;

  createdAt?: Date;

  updatedAt?: Date;
}

const VirtualAccountSchema =
  new Schema<IVirtualAccount>(
    {
      userId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,
      },

      bankName: {
        type: String,
        required: true,
      },

      accountName: {
        type: String,
        required: true,
      },

      accountNumber: {
        type: String,
        required: true,
      },

      provider: {
        type: String,
        default: "Monnify",
      },
    },
    {
      timestamps: true,
    }
  );

const VirtualAccount: Model<IVirtualAccount> =
  models.VirtualAccount ||
  model<IVirtualAccount>(
    "VirtualAccount",
    VirtualAccountSchema
  );

export default VirtualAccount;