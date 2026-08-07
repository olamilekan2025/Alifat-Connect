import { connectToDatabase } from "./mongodb";
import Review, { IReview } from "../models/Review";
import User from "../models/User";

/**
 * Public review interface (safe for frontend)
 */
export interface PublicReview {
  _id: string;
  rating: number;
  content: string;
  displayName: string;
  avatar?: string;
  isFeatured: boolean;
  createdAt: Date;
}

/**
 * Review statistics interface
 */
export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

/**
 * Get approved reviews for homepage (max 3, featured first)
 */
export async function getHomepageReviews(): Promise<PublicReview[]> {
  try {
    await connectToDatabase();

    const reviews = await Review.find({ status: "approved" })
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(3)
      .lean();

    // Enrich with user display names
    const enrichedReviews = await Promise.all(
      reviews.map(async (review) => {
        const user = await User.findById(review.userId).select(
          "name firstname lastname image"
        ).lean();

        let displayName = "Anonymous";
        if (user) {
          if (user.name) {
            // Format: "Olamilekan O."
            const nameParts = user.name.split(" ");
            if (nameParts.length > 1) {
              displayName = `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`;
            } else {
              displayName = user.name;
            }
          } else if (user.firstname && user.lastname) {
            displayName = `${user.firstname} ${user.lastname[0]}.`;
          } else if (user.firstname) {
            displayName = user.firstname;
          }
        }

        return {
          _id: review._id.toString(),
          rating: review.rating,
          content: review.content,
          displayName,
          avatar: user?.image || review.avatar,
          isFeatured: review.isFeatured || false,
          createdAt: review.createdAt!,
        };
      })
    );

    return enrichedReviews;
  } catch (error) {
    console.error("Error fetching homepage reviews:", error);
    return [];
  }
}

/**
 * Get paginated approved reviews
 */
export async function getPaginatedReviews(options: {
  page: number;
  limit: number;
  rating?: number;
}): Promise<{ reviews: PublicReview[]; total: number; totalPages: number }> {
  try {
    await connectToDatabase();

    const { page = 1, limit = 12, rating } = options;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = { status: "approved" };
    if (rating && rating >= 1 && rating <= 5) {
      query.rating = rating;
    }

    // Get total count
    const total = await Review.countDocuments(query);

    // Get reviews
    const reviews = await Review.find(query)
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Enrich with user display names
    const enrichedReviews = await Promise.all(
      reviews.map(async (review) => {
        const user = await User.findById(review.userId).select(
          "name firstname lastname image"
        ).lean();

        let displayName = "Anonymous";
        if (user) {
          if (user.name) {
            const nameParts = user.name.split(" ");
            if (nameParts.length > 1) {
              displayName = `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`;
            } else {
              displayName = user.name;
            }
          } else if (user.firstname && user.lastname) {
            displayName = `${user.firstname} ${user.lastname[0]}.`;
          } else if (user.firstname) {
            displayName = user.firstname;
          }
        }

        return {
          _id: review._id.toString(),
          rating: review.rating,
          content: review.content,
          displayName,
          avatar: user?.image || review.avatar,
          isFeatured: review.isFeatured || false,
          createdAt: review.createdAt!,
        };
      })
    );

    const totalPages = Math.ceil(total / limit);

    return {
      reviews: enrichedReviews,
      total,
      totalPages,
    };
  } catch (error) {
    console.error("Error fetching paginated reviews:", error);
    return { reviews: [], total: 0, totalPages: 0 };
  }
}

/**
 * Get review statistics (average rating, total count, distribution)
 */
export async function getReviewStats(): Promise<ReviewStats> {
  try {
    await connectToDatabase();

    const approvedReviews = await Review.find({ status: "approved" }).lean();

    if (approvedReviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    // Calculate average rating
    const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Math.round((totalRating / approvedReviews.length) * 10) / 10;

    // Calculate rating distribution
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    approvedReviews.forEach((review) => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });

    return {
      averageRating,
      totalReviews: approvedReviews.length,
      ratingDistribution,
    };
  } catch (error) {
    console.error("Error fetching review stats:", error);
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }
}

/**
 * Create a new review (linked to authenticated user)
 */
export async function createReview(data: {
  userId: string;
  rating: number;
  content: string;
}): Promise<IReview | null> {
  try {
    await connectToDatabase();

    // Get user info for display name
    const user = await User.findById(data.userId).select(
      "name firstname lastname image"
    ).lean();

    let displayName = "Anonymous";
    if (user) {
      if (user.name) {
        const nameParts = user.name.split(" ");
        if (nameParts.length > 1) {
          displayName = `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`;
        } else {
          displayName = user.name;
        }
      } else if (user.firstname && user.lastname) {
        displayName = `${user.firstname} ${user.lastname[0]}.`;
      } else if (user.firstname) {
        displayName = user.firstname;
      }
    }

    const review = await Review.create({
      userId: data.userId,
      rating: data.rating,
      content: data.content,
      status: "pending", // Reviews start as pending
      displayName,
      avatar: user?.image,
    });

    return review;
  } catch (error) {
    console.error("Error creating review:", error);
    return null;
  }
}

/**
 * Get all reviews (for admin)
 */
export async function getAllReviews(options: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<{ reviews: (IReview & { _id: string })[]; total: number; totalPages: number }> {
  try {
    await connectToDatabase();

    const { page = 1, limit = 20, status } = options;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      query.status = status;
    }

    const total = await Review.countDocuments(query);

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Convert ObjectId to string for serialization
    const reviewsWithStringIds = reviews.map((review) => ({
      ...review,
      _id: review._id.toString(),
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      reviews: reviewsWithStringIds,
      total,
      totalPages,
    };
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    return { reviews: [], total: 0, totalPages: 0 };
  }
}

/**
 * Update review status (for admin)
 */
export async function updateReviewStatus(
  reviewId: string,
  status: "pending" | "approved" | "rejected"
): Promise<IReview | null> {
  try {
    await connectToDatabase();

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status },
      { new: true }
    ).lean();

    return review;
  } catch (error) {
    console.error("Error updating review status:", error);
    return null;
  }
}

/**
 * Toggle featured status (for admin)
 */
export async function toggleReviewFeatured(reviewId: string): Promise<IReview | null> {
  try {
    await connectToDatabase();

    const review = await Review.findById(reviewId).lean();
    if (!review) return null;

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { isFeatured: !review.isFeatured },
      { new: true }
    ).lean();

    return updatedReview;
  } catch (error) {
    console.error("Error toggling review featured:", error);
    return null;
  }
}

/**
 * Delete review (for admin)
 */
export async function deleteReview(reviewId: string): Promise<boolean> {
  try {
    await connectToDatabase();

    await Review.findByIdAndDelete(reviewId);
    return true;
  } catch (error) {
    console.error("Error deleting review:", error);
    return false;
  }
}
