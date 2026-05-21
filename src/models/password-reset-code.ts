import mongoose, {
  Schema,
  models,
  model,
} from "mongoose";

const PasswordResetCodeSchema =
  new Schema(
    {
      email: {
        type: String,
        required: true,
      },

      code: {
        type: String,
        required: true,
      },

      purpose: {
        type: String,
        required: true,
      },

      expiresAt: {
        type: Date,
        required: true,
      },

      createdAt: {
        type: Date,
        default: Date.now,
      },

      usedAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: false,
    }
  );

const PasswordResetCode =
  models.PasswordResetCode ||
  model(
    "PasswordResetCode",
    PasswordResetCodeSchema
  );

export default PasswordResetCode;