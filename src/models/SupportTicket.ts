import mongoose, { Schema, model, models } from "mongoose";

export interface ISupportTicket {
  ticketNumber: string;
  userId: mongoose.Types.ObjectId;
  subject: string;
  description: string;
  
  // VTU-specific categorization
  category: "Airtime" | "Data" | "Electricity" | "Cable TV" | "Exam PIN" | 
           "Wallet Funding" | "Wallet Withdrawal" | "Bank Transfer" | 
           "Payment" | "Transaction" | "Account" | "KYC" | "Referral" | 
           "Login & Authentication" | "Verification" | "Notifications" | 
           "Refund" | "Failed Transaction" | "Pending Transaction" | "Other";
  
  // Priority levels
  priority: "Low" | "Medium" | "High" | "Urgent";
  
  // Status workflow
  status: "Open" | "Pending" | "In Progress" | "Resolved" | "Closed";
  
  // Assignment
  assignedAdminId?: mongoose.Types.ObjectId;
  
  // Transaction context (VTU-specific)
  transactionId?: mongoose.Types.ObjectId;
  transactionReference?: string;
  transactionType?: string;
  transactionAmount?: number;
  transactionStatus?: string;
  
  // Response tracking
  firstResponseAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  
  // Activity tracking
  lastMessageAt: Date;
  messageCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: [
        "Airtime",
        "Data", 
        "Electricity",
        "Cable TV",
        "Exam PIN",
        "Wallet Funding",
        "Wallet Withdrawal",
        "Bank Transfer",
        "Payment",
        "Transaction",
        "Account",
        "KYC",
        "Referral",
        "Login & Authentication",
        "Verification",
        "Notifications",
        "Refund",
        "Failed Transaction",
        "Pending Transaction",
        "Other",
      ],
      default: "Other",
      index: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
      index: true,
    },

    status: {
      type: String,
      enum: ["Open", "Pending", "In Progress", "Resolved", "Closed"],
      default: "Open",
      index: true,
    },

    assignedAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    // Transaction context for VTU-related issues
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      index: true,
    },

    transactionReference: {
      type: String,
      trim: true,
    },

    transactionType: {
      type: String,
      trim: true,
    },

    transactionAmount: {
      type: Number,
    },

    transactionStatus: {
      type: String,
      trim: true,
    },

    // Response time tracking
    firstResponseAt: {
      type: Date,
    },

    resolvedAt: {
      type: Date,
    },

    closedAt: {
      type: Date,
    },

    // Activity tracking
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    messageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
SupportTicketSchema.index({ userId: 1, status: 1, createdAt: -1 });
SupportTicketSchema.index({ status: 1, priority: 1, createdAt: -1 });
SupportTicketSchema.index({ assignedAdminId: 1, status: 1 });
SupportTicketSchema.index({ category: 1, status: 1 });
SupportTicketSchema.index({ transactionId: 1 });

const SupportTicket =
  models.SupportTicket ||
  model<ISupportTicket>("SupportTicket", SupportTicketSchema);

export default SupportTicket;