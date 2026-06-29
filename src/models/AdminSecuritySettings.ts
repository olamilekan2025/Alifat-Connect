import { Schema, model, models } from "mongoose";

const AdminSecuritySettingsSchema = new Schema(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // Authentication
    twoFA: {
      type: Boolean,
      default: true,
    },

    emailVerification: {
      type: Boolean,
      default: true,
    },

    smsOtp: {
      type: Boolean,
      default: false,
    },

    biometric: {
      type: Boolean,
      default: false,
    },

    adminPin: {
      type: Boolean,
      default: true,
    },

    // Session
    sessionTimeout: {
      type: Number,
      default: 30,
      enum: [15, 30, 60, 120, 240],
    },

    // Security Scores
    passwordPolicy: {
      type: Number,
      default: 95,
      min: 0,
      max: 100,
    },

    apiSecurity: {
      type: Number,
      default: 95,
      min: 0,
      max: 100,
    },

    // Emergency Lockdown
    lockdown: {
      type: Boolean,
      default: false,
    },

    // Optional extra settings
    loginNotifications: {
      type: Boolean,
      default: true,
    },

    rememberDevices: {
      type: Boolean,
      default: true,
    },

    maxFailedAttempts: {
      type: Number,
      default: 5,
      min: 1,
      max: 20,
    },

    accountLockDuration: {
      type: Number,
      default: 30, // minutes
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default models.AdminSecuritySettings ||
  model("AdminSecuritySettings", AdminSecuritySettingsSchema);