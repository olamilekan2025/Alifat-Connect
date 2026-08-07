"use client";

import { useState } from "react";
import { Star, MoreVertical } from "lucide-react";
import { IReview } from "@/models/Review";
import ReviewActionModal from "./ReviewActionModal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Review extends IReview {
  _id: string;
}

interface ReviewTableProps {
  reviews: Review[];
}

export default function ReviewTable({ reviews }: ReviewTableProps) {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAction = async (reviewId: string, action: string, payload?: any) => {
    try {
      if (action === "delete") {
        if (!confirm("Are you sure you want to delete this review?")) {
          return;
        }
      }

      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: action === "delete" ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: action !== "delete" ? JSON.stringify(payload) : undefined,
      });

      if (response.ok) {
        toast.success("Action completed successfully");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        toast.error(errorData.error || "Action failed. Please try again.");
      }
    } catch (error) {
      console.error("Error performing action:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const openModal = (review: Review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg">
        <div className="w-full overflow-x-auto">
          <table className="min-w-[800px] w-full">
            <thead className="bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 border-b border-zinc-200 dark:border-zinc-800">
              <tr className="text-left text-xs font-bold tracking-wider uppercase text-zinc-600 dark:text-zinc-400">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Review</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Featured</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {reviews.map((review) => (
                <tr
                  key={String(review._id)}
                  className="transition-all duration-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                >
                  <td className="px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white font-bold text-sm shadow-md">
                        {review.displayName?.charAt(0).toUpperCase() || "A"}
                      </div>

                      <div className="min-w-0">
                        <div className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
                          {review.displayName || "Anonymous"}
                        </div>
                        <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                          {review.userId}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-zinc-300 dark:text-zinc-600"
                          }`}
                        />
                      ))}
                    </div>
                  </td>

                  <td className="px-6 py-4 max-w-xs">
                    <div className="truncate text-sm text-zinc-700 dark:text-zinc-300" title={review.content}>
                      {review.content}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        review.status === "approved"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : review.status === "rejected"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}
                    >
                      {review.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {review.isFeatured ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        Featured
                      </span>
                    ) : (
                      <span className="text-zinc-400 dark:text-zinc-600 text-xs">-</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "-"}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <Button
                      onClick={() => openModal(review)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <MoreVertical className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                    </Button>
                  </td>
                </tr>
              ))}

              {reviews.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-zinc-500 dark:text-zinc-400"
                  >
                    No reviews found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ReviewActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        review={selectedReview}
        onAction={handleAction}
      />
    </>
  );
}
