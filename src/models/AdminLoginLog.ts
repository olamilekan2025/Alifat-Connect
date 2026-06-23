import { Schema, model, models } from "mongoose";

const AdminLoginLogSchema = new Schema(
  {
    adminId: { type: String, required: true },

    ip: { type: String, default: "" },
    device: { type: String, default: "" },

    userAgent: { type: String, default: "" },

    success: { type: Boolean, default: true },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default models.AdminLoginLog ||
  model("AdminLoginLog", AdminLoginLogSchema);