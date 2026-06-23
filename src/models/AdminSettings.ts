import { Schema, model, models, Model } from "mongoose";

export type AdminSettingsDocument = {
  platformName?: string;
  supportEmail?: string;
  contactPhone?: string;
  defaultCurrency?: string;
  timeZone?: string;
  maintenanceMode?: boolean;

  branding?: {
    logoUrl?: string;
    faviconUrl?: string;
    loginImageUrl?: string;
    primaryAccentColor?: string;
    footerText?: string;
    copyrightText?: string;
  };

  adminProfile?: {
    adminName?: string;
    email?: string;
    phone?: string;
    role?: string;

    twoFactorEnabled?: boolean;

    lastLoginAt?: Date | null;
    lastPasswordChange?: Date | null;

    lastLoginIp?: string;
    lastDevice?: string;
    sessionCreatedAt?: Date | null;
  };

  // 🔐 ADD PASSWORD FIELD (IMPORTANT FIX)
  password?: string;

  security?: {
    forceEmailVerification?: boolean;
    maximumLoginAttempts?: number;
    sessionTimeoutMinutes?: number;
    passwordPolicy?: {
      minimumLength?: number;
      requireSpecialCharacters?: boolean;
    };
    ipWhitelist?: string[];
    registrationEnabled?: boolean;
    defaultRoleForNewUsers?: "admin" | "user" | "moderator";
    requireKycVerification?: boolean;
    autoBanSuspiciousAccounts?: boolean;
    maximumDevicesPerAccount?: number;
  };

  payment?: {
    depositEnabled?: boolean;
    withdrawalEnabled?: boolean;

    walletTransferEnabled?: boolean;
    walletFundingEnabled?: boolean;

    airtimeEnabled?: boolean;
    dataEnabled?: boolean;
    cableEnabled?: boolean;
    electricityEnabled?: boolean;

    minimumDepositAmount?: number;
    maximumDepositAmount?: number;
    minimumWithdrawalAmount?: number;
    maximumWithdrawalAmount?: number;

    transactionFeePercentage?: number;
  };

  email?: {
    smtpHost?: string;
    smtpPort?: number;
    smtpUsername?: string;
    smtpPassword?: string;
    senderEmail?: string;
    senderName?: string;
  };

  notifications?: {
    enableEmailNotifications?: boolean;
    enablePushNotifications?: boolean;
    enableLoginAlerts?: boolean;
    enableWithdrawalAlerts?: boolean;
    enableDepositAlerts?: boolean;
  };

  createdAt?: Date;
  updatedAt?: Date;
};

const AdminSettingsSchema = new Schema<AdminSettingsDocument>(
  {
    platformName: { type: String, trim: true, default: "Alifat Connect" },
    supportEmail: { type: String, trim: true, default: "" },
    contactPhone: { type: String, trim: true, default: "" },
    defaultCurrency: { type: String, default: "NGN" },
    timeZone: { type: String, default: "Africa/Lagos" },
    maintenanceMode: { type: Boolean, default: false },

    branding: {
      logoUrl: { type: String, trim: true, default: "" },
      faviconUrl: { type: String, trim: true, default: "" },
      loginImageUrl: { type: String, trim: true, default: "" },
      primaryAccentColor: { type: String, default: "#F59E0B" },
      footerText: { type: String, default: "" },
      copyrightText: { type: String, default: "" },
    },

    adminProfile: {
      adminName: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      role: { type: String, default: "admin" },

      twoFactorEnabled: { type: Boolean, default: false },

      lastLoginAt: { type: Date, default: null },
      lastPasswordChange: { type: Date, default: null },

      lastLoginIp: { type: String, default: "" },
      lastDevice: { type: String, default: "" },
      sessionCreatedAt: { type: Date, default: null },
    },

    // 🔐 PASSWORD (HIDDEN BY DEFAULT)
    password: {
      type: String,
      select: false,
    },

    security: {
      forceEmailVerification: { type: Boolean, default: false },
      maximumLoginAttempts: { type: Number, default: 5 },
      sessionTimeoutMinutes: { type: Number, default: 60 },

      passwordPolicy: {
        minimumLength: { type: Number, default: 8 },
        requireSpecialCharacters: { type: Boolean, default: true },
      },

      ipWhitelist: { type: [String], default: [] },
      registrationEnabled: { type: Boolean, default: true },

      defaultRoleForNewUsers: {
        type: String,
        enum: ["admin", "user", "moderator"],
        default: "user",
      },

      requireKycVerification: { type: Boolean, default: false },
      autoBanSuspiciousAccounts: { type: Boolean, default: false },
      maximumDevicesPerAccount: { type: Number, default: 5 },
    },

    payment: {
      depositEnabled: { type: Boolean, default: true },
      withdrawalEnabled: { type: Boolean, default: true },

      walletTransferEnabled: { type: Boolean, default: true },
      walletFundingEnabled: { type: Boolean, default: true },

      airtimeEnabled: { type: Boolean, default: true },
      dataEnabled: { type: Boolean, default: true },
      cableEnabled: { type: Boolean, default: true },
      electricityEnabled: { type: Boolean, default: true },

      minimumDepositAmount: { type: Number, default: 100 },
      maximumDepositAmount: { type: Number, default: 1000000 },

      minimumWithdrawalAmount: { type: Number, default: 100 },
      maximumWithdrawalAmount: { type: Number, default: 500000 },

      transactionFeePercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },

    email: {
      smtpHost: { type: String, trim: true, default: "" },
      smtpPort: { type: Number, default: 587 },
      smtpUsername: { type: String, trim: true, default: "" },
      smtpPassword: { type: String, default: "" },
      senderEmail: { type: String, trim: true, default: "" },
      senderName: { type: String, trim: true, default: "" },
    },

    notifications: {
      enableEmailNotifications: { type: Boolean, default: true },
      enablePushNotifications: { type: Boolean, default: false },
      enableLoginAlerts: { type: Boolean, default: true },
      enableWithdrawalAlerts: { type: Boolean, default: true },
      enableDepositAlerts: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

const AdminSettings: Model<AdminSettingsDocument> =
  models.AdminSettings ||
  model<AdminSettingsDocument>("AdminSettings", AdminSettingsSchema);

export default AdminSettings;