import { Schema, model, models, Model } from "mongoose";

/**
 * KYC DOCUMENT INTERFACE
 */
export interface IKYCDocument {
  kycId: string;
  userId: string;
  
  documentType: "identity_document" | "proof_of_address" | "supporting_document";
  
  // Cloudinary storage reference
  storageReference: {
    publicId: string;
    secureUrl: string;
    resourceType: string;
    format: string;
    bytes: number;
  };
  
  // Original file metadata
  originalFileName: string;
  mimeType: string;
  
  // Verification status
  verificationStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  
  reviewedBy?: string;
  reviewedAt?: Date;
  
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * KYC DOCUMENT SCHEMA
 */
const KYCDocumentSchema = new Schema<IKYCDocument>(
  {
    kycId: {
      type: String,
      required: false,
      index: true,
    },
    
    userId: {
      type: String,
      required: true,
      index: true,
    },
    
    documentType: {
      type: String,
      enum: ["identity_document", "proof_of_address", "supporting_document"],
      required: true,
    },
    
    storageReference: {
      publicId: {
        type: String,
        required: true,
      },
      secureUrl: {
        type: String,
        required: true,
      },
      resourceType: {
        type: String,
        required: true,
      },
      format: {
        type: String,
        required: true,
      },
      bytes: {
        type: Number,
        required: true,
      },
    },
    
    originalFileName: {
      type: String,
      required: true,
    },
    
    mimeType: {
      type: String,
      required: true,
    },
    
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    
    rejectionReason: {
      type: String,
      default: null,
    },
    
    reviewedBy: {
      type: String,
      default: null,
    },
    
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
KYCDocumentSchema.index({ kycId: 1, documentType: 1 });
KYCDocumentSchema.index({ userId: 1 });
KYCDocumentSchema.index({ verificationStatus: 1 });

/**
 * SAFE MODEL EXPORT
 */
const KYCDocument: Model<IKYCDocument> =
  models.KYCDocument ||
  model<IKYCDocument>("KYCDocument", KYCDocumentSchema);

export default KYCDocument;
