import { Schema, model, models, Model } from "mongoose";

/**
 * KYC VERIFICATION INTERFACE
 */
export interface IKYCVerification {
  userId: string;
  status: "not_started" | "pending" | "under_review" | "approved" | "rejected" | "requires_resubmission";
  
  // Personal Information
  personalInformation?: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    dateOfBirth?: Date;
    gender?: "male" | "female" | "other";
    phone?: string;
  };
  
  // Identity Information
  identityInformation?: {
    idType?: "nin" | "bvn" | "international_passport" | "drivers_license" | "voter_card";
    idNumber?: string;
  };
  
  // Address Information
  addressInformation?: {
    address?: string;
    city?: string;
    state?: string;
    lga?: string;
    country?: string;
  };
  
  // Document IDs (references to KYCDocument)
  documentIds?: string[];
  
  // Review Information
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  adminNotes?: string;
  
  // Version tracking for resubmission history
  version: number;
  previousVersionId?: string;
  
  submittedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * KYC VERIFICATION SCHEMA
 */
const KYCVerificationSchema = new Schema<IKYCVerification>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    
    status: {
      type: String,
      enum: ["not_started", "pending", "under_review", "approved", "rejected", "requires_resubmission"],
      default: "not_started",
      index: true,
    },
    
    personalInformation: {
      firstName: {
        type: String,
        trim: true,
      },
      middleName: {
        type: String,
        trim: true,
      },
      lastName: {
        type: String,
        trim: true,
      },
      dateOfBirth: {
        type: Date,
      },
      gender: {
        type: String,
        enum: ["male", "female", "other"],
      },
      phone: {
        type: String,
        trim: true,
      },
    },
    
    identityInformation: {
      idType: {
        type: String,
        enum: ["nin", "bvn", "international_passport", "drivers_license", "voter_card"],
      },
      idNumber: {
        type: String,
        trim: true,
      },
    },
    
    addressInformation: {
      address: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      lga: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
      },
    },
    
    documentIds: {
      type: [String],
      default: [],
    },
    
    reviewedBy: {
      type: String,
      default: null,
    },
    
    reviewedAt: {
      type: Date,
      default: null,
    },
    
    rejectionReason: {
      type: String,
      default: null,
    },
    
    adminNotes: {
      type: String,
      default: null,
    },
    
    version: {
      type: Number,
      default: 1,
    },
    
    previousVersionId: {
      type: String,
      default: null,
    },
    
    submittedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
KYCVerificationSchema.index({ userId: 1, status: 1 });
KYCVerificationSchema.index({ status: 1, createdAt: -1 });
KYCVerificationSchema.index({ reviewedBy: 1 });

/**
 * SAFE MODEL EXPORT
 */
const KYCVerification: Model<IKYCVerification> =
  models.KYCVerification ||
  model<IKYCVerification>("KYCVerification", KYCVerificationSchema);

export default KYCVerification;
