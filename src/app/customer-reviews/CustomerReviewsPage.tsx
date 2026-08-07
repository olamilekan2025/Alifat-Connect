"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface PublicReview {
  _id: string;
  rating: number;
  content: string;
  displayName: string;
  avatar?: string;
  isFeatured: boolean;
  createdAt: Date;
}

interface ReviewStats {
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

export default function CustomerReviewsPage() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRating, setSelectedRating] = useState<number | null>(
    searchParams.get("rating") ? parseInt(searchParams.get("rating")!) : null
  );

  const reviewsPerPage = 12;

  const handleWriteReviewClick = () => {
    if (!session) {
      // User is not logged in - redirect to login with callback
      router.push("/auth/login?callbackUrl=/customer-reviews");
      return;
    }

    // User is logged in - check role
    const userRole = String(session.user.role || "user").toLowerCase();
    
    if (userRole === "admin") {
      router.push("/admin-dashboard/reviews");
    } else {
      router.push("/dashboard/reviews");
    }
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch reviews
        const ratingParam = selectedRating ? `&rating=${selectedRating}` : "";
        const reviewsResponse = await fetch(
          `/api/public/reviews?type=paginated&page=${currentPage}&limit=${reviewsPerPage}${ratingParam}`
        );
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData.reviews || []);
        setTotalPages(reviewsData.totalPages || 1);

        // Fetch stats
        const statsResponse = await fetch("/api/public/reviews?type=stats");
        const statsData = await statsResponse.json();
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentPage, selectedRating]);

  const handleRatingFilter = (rating: number | null) => {
    setSelectedRating(rating);
    setCurrentPage(1);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating
            ? "fill-[#D4AF37] text-[#D4AF37]"
            : "text-gray-300 dark:text-gray-600"
        }`}
      />
    ));
  };

  const renderRatingDistribution = () => {
    if (!stats || stats.totalReviews === 0) return null;

    const ratings = [5, 4, 3, 2, 1];
    const maxCount = Math.max(...Object.values(stats.ratingDistribution));

    return (
      <div className="space-y-2">
        {ratings.map((rating) => {
          const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
          const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-20">
                <span className="text-sm font-medium">{rating}</span>
                <Star className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" />
              </div>
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#D4AF37] rounded-full transition-all duration-300"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-zinc-950 py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (reviews.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-zinc-950 py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Users Reviews
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              No customer reviews yet.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Be one of the first users to share your experience.
            </p>
            <Button
              size="lg"
              onClick={handleWriteReviewClick}
              className="bg-[#D4AF37] hover:bg-[#B89430] text-black font-semibold px-8 py-6 rounded-full transition-all duration-300 hover:scale-105"
            >
              Write a Review
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-zinc-950  py-25">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Users Reviews
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            What our users are saying
          </p>
        </div>

        {/* Stats Section */}
        {stats && stats.totalReviews > 0 && (
          <div className="bg-white dark:bg-black rounded-3xl border border-black dark:border-white p-8 mb-12 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Average Rating */}
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                  <div className="text-5xl font-bold text-gray-900 dark:text-white">
                    {stats.averageRating.toFixed(1)}
                  </div>
                  <div className="text-2xl text-gray-400">/ 5</div>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-1 mb-4">
                  {renderStars(Math.round(stats.averageRating))}
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Based on {stats.totalReviews} approved users review{stats.totalReviews !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="flex flex-col justify-center">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Rating Distribution
                </h3>
                {renderRatingDistribution()}
              </div>
            </div>
          </div>
        )}

        {/* Rating Filter */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <Button
            variant={selectedRating === null ? "default" : "outline"}
            onClick={() => handleRatingFilter(null)}
            className="rounded-full"
          >
            All Ratings
          </Button>
          {[5, 4, 3, 2, 1].map((rating) => (
            <Button
              key={rating}
              variant={selectedRating === rating ? "default" : "outline"}
              onClick={() => handleRatingFilter(rating)}
              className="rounded-full"
            >
              {renderStars(rating)}
            </Button>
          ))}
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {reviews.map((review) => (
            <Card
              key={review._id}
              className="h-full rounded-3xl border border-black bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:bg-black dark:border-white"
            >
              <CardContent className="flex h-full flex-col p-8">
                {/* Stars */}
                <div className="mb-6 flex items-center gap-1">
                  {renderStars(review.rating)}
                </div>

                {/* Content */}
                <p className="flex-1 leading-8 text-gray-600 dark:text-white">
                  "{review.content}"
                </p>

                {/* Author */}
                <div className="mt-6 border-t border-black dark:border-white pt-6">
                  <div className="flex items-center gap-3">
                    {review.avatar && (
                      <img
                        src={review.avatar}
                        alt={review.displayName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-[#D4AF37]">
                        {review.displayName}
                      </h4>
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <span className="text-green-500">✓</span>
                        Verified Customer
                      </p>
                    </div>
                  </div>
                  {review.isFeatured && (
                    <span className="inline-block mt-2 text-xs font-semibold bg-[#D4AF37] text-black px-2 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mb-12">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-full"
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => setCurrentPage(page)}
                className="rounded-full"
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-full"
            >
              Next
            </Button>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center bg-white dark:bg-black rounded-3xl border border-black dark:border-white p-12 shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Have you used Alifat Connect?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Share your experience with other users.
          </p>
          <Button
            size="lg"
            onClick={handleWriteReviewClick}
            className="bg-[#D4AF37] hover:bg-[#B89430] text-black font-semibold px-8 py-6 rounded-full transition-all duration-300 hover:scale-105"
          >
            Write a Review
          </Button>
        </div>
      </div>
    </div>
  );
}
