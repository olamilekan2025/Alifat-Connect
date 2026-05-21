import mongoose, {
  Schema,
  model,
  models,
  Model,
} from "mongoose";

export interface IUser {
  name?: string;

  firstname?: string;

  lastname?: string;

  address?: string;

  phone?: string;

  email: string;

  password?: string;

  image?: string;

  role:
    | "admin"
    | "user"
    | "moderator";

  walletBalance?: number;

  // PAYMENT PIN
  paymentPin?: string | null;

  // SETTINGS
  notifications?: boolean;

  emailAlerts?: boolean;

  // EMAIL VERIFICATION
  emailVerified?: boolean;

  loginVerificationCode?: string;

  loginVerificationExpires?: Date;

  // RESET PAYMENT PIN VERIFICATION
  resetPinVerificationToken?: string | null;

  resetPinVerificationExpires?: Date | null;

  isResetPinVerified?: boolean;

  createdAt?: Date;

  updatedAt?: Date;
}

const UserSchema =
  new Schema<IUser>(
    {
      name: {
        type: String,
        trim: true,
      },

      firstname: {
        type: String,
        trim: true,
      },

      lastname: {
        type: String,
        trim: true,
      },

      address: {
        type: String,
        trim: true,
      },

      phone: {
        type: String,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },

      password: {
        type: String,
      },

      image: {
        type: String,
      },

      role: {
        type: String,
        enum: [
          "admin",
          "user",
          "moderator",
        ],
        default: "user",
      },

      walletBalance: {
        type: Number,
        default: 0,
      },

      // PAYMENT PIN
      paymentPin: {
        type: String,
        default: null,
      },

      // USER SETTINGS
      notifications: {
        type: Boolean,
        default: true,
      },

      emailAlerts: {
        type: Boolean,
        default: true,
      },

      // EMAIL VERIFICATION
      emailVerified: {
        type: Boolean,
        default: false,
      },

      loginVerificationCode: {
        type: String,
      },

      loginVerificationExpires: {
        type: Date,
      },

      // RESET PAYMENT PIN VERIFICATION
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
    },
    {
      timestamps: true,
    },
  );

const User: Model<IUser> =
  models.User ||
  model<IUser>(
    "User",
    UserSchema,
  );

export default User;