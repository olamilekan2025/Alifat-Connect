import mongoose, { Schema, model, models } from "mongoose";

const SupportTicketSchema = new Schema(
  {
    ticketId: {
      type: String,
      unique: true,
      required: true,
    },

    name: String,

    email: String,

    phone: String,

    subject: String,

    category: {
      type: String,
      default: "General",
    },

    message: String,

    attachment: String,

    status: {
      type: String,
      enum: [
        "Open",
        "Pending",
        "Resolved",
        "Closed",
      ],
      default: "Open",
    },

    autoReply: {
  type: String,
  default: "",
},

    adminReply: {
      type: String,
      default: "",
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default models.SupportTicket ||
  model(
    "SupportTicket",
    SupportTicketSchema
  );