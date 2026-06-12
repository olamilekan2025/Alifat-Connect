import mongoose, {
  Schema,
  Document,
  Model,
} from "mongoose";

export interface INewsletter
  extends Document {
  email: string;
  isActive: boolean;
  subscribedAt: Date;
}

const NewsletterSchema =
  new Schema<INewsletter>(
    {
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },

      isActive: {
        type: Boolean,
        default: true,
      },

      subscribedAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

const Newsletter: Model<INewsletter> =
  mongoose.models.Newsletter ||
  mongoose.model<INewsletter>(
    "Newsletter",
    NewsletterSchema
  );

export default Newsletter;