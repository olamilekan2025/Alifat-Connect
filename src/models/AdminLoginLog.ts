import { Schema, model, models } from "mongoose";

const AdminLoginLogSchema = new Schema(
  {
    adminId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },

    ip: { type: String, default: "" },
    device: { type: String, default: "" },

    userAgent: { type: String, default: "" },

    success: { type: Boolean, default: true },
  },
  { 
    timestamps: true,
    versionKey: false,
  }
);

export default models.AdminLoginLog ||
  model("AdminLoginLog", AdminLoginLogSchema);