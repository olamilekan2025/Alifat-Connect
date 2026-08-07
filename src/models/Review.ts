import { Schema, model, models, Model } from "mongoose";

/**
 * REVIEW INTERFACE
 */
export interface IReview {
  userId: string;
  rating: number; // 1-5 stars
  content: string;
  status: "pending" | "approved" | "rejected";
  isFeatured?: boolean;
  displayName?: string; // Public display name (e.g., "Olamilekan O.")
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * REVIEW SCHEMA
 */
const ReviewSchema = new Schema<IReview>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    displayName: {
      type: String,
      trim: true,
    },

    avatar: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
ReviewSchema.index({ status: 1, isFeatured: -1, createdAt: -1 });
ReviewSchema.index({ status: 1, rating: 1, createdAt: -1 });

/**
 * SAFE MODEL EXPORT
 */
const Review: Model<IReview> =
  models.Review ||
  model<IReview>("Review", ReviewSchema);

export default Review;
