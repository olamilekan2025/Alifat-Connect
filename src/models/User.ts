import {
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

  accountType:
    | "user"
    | "seller";

  walletBalance: number;

  sellerSince?: Date | null;

  // SUBSCRIPTION
  subscriptionType?:
    | "monthly"
    | "quarterly"
    | "yearly"
    | null;

  subscriptionActive?: boolean;

  subscriptionExpires?: Date | null;

  // PAYMENT PIN
  paymentPin?: string | null;

  // SETTINGS
  notifications?: boolean;
  emailAlerts?: boolean;

  // EMAIL VERIFICATION
  emailVerified?: boolean;
  loginVerificationCode?: string;
  loginVerificationExpires?: Date;

  // RESET PIN
  resetPinVerificationToken?:
    | string
    | null;

  resetPinVerificationExpires?:
    | Date
    | null;

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

      // ACCOUNT TYPE
      accountType: {
        type: String,
        enum: [
          "user",
          "seller",
        ],
        default: "user",
      },

      // WALLET
      walletBalance: {
        type: Number,
        default: 0,
      },

      // SELLER INFO
      sellerSince: {
        type: Date,
        default: null,
      },

      // SUBSCRIPTION
      subscriptionType: {
        type: String,
        enum: [
          "monthly",
          "quarterly",
          "yearly",
        ],
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

      // PAYMENT PIN
      paymentPin: {
        type: String,
        default: null,
      },

      // SETTINGS
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
        default: null,
      },

      loginVerificationExpires: {
        type: Date,
        default: null,
      },

      // RESET PIN
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
    }
  );

const User: Model<IUser> =
  models.User ||
  model<IUser>(
    "User",
    UserSchema
  );

export default User;