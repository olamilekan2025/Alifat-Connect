import mongoose, { Schema, Document, Model } from "mongoose";

export interface IContact extends Document {
  ticketId: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category?: string;
  status: "unread" | "in-progress" | "resolved" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      default: "",
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: "General",
    },

    status: {
      type: String,
      enum: ["unread", "in-progress", "resolved", "closed"],
      default: "unread",
    },
  },
  {
    timestamps: true, // automatically adds createdAt + updatedAt
  }
);

// Prevent model overwrite in dev (VERY IMPORTANT in Next.js)
const Contact: Model<IContact> =
  mongoose.models.Contact ||
  mongoose.model<IContact>("Contact", ContactSchema);

export default Contact;