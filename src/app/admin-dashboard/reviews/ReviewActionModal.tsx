"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, CheckCircle, XCircle, Trash2, Sparkles, Loader2 } from "lucide-react";

interface ReviewActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: {
    _id: string;
    displayName?: string;
    rating: number;
    content: string;
    status: string;
    isFeatured?: boolean;
  } | null;
  onAction: (reviewId: string, action: string, payload?: any) => Promise<void>;
}

export default function ReviewActionModal({
  isOpen,
  onClose,
  review,
  onAction,
}: ReviewActionModalProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAction = async (action: string, payload?: any) => {
    if (!review) return;
    setLoadingAction(action);
    try {
      await onAction(review._id, action, payload);
      onClose();
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setLoadingAction(null);
    }
  };

  if (!review) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Review Actions</DialogTitle>
          <DialogDescription>
            Manage review for {review.displayName || "Anonymous"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Rating Display */}
          <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= review.rating
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
              {review.rating}/5
            </span>
          </div>

          {/* Review Content */}
          <div className="p-4 bg-muted/50 rounded-xl">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {review.content}
            </p>
          </div>

          {/* Current Status */}
          <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-lg border">
            <span className="text-sm font-medium">Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                review.status === "approved"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : review.status === "rejected"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
              }`}
            >
              {review.status}
            </span>
          </div>

          {/* Featured Status */}
          <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-lg border">
            <span className="text-sm font-medium">Featured:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                (review.isFeatured ?? false)
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {(review.isFeatured ?? false) ? "Yes" : "No"}
            </span>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {review.status === "pending" && (
            <>
              <Button
                onClick={() => handleAction("approve", { action: "updateStatus", status: "approved" })}
                disabled={loadingAction !== null}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loadingAction === "approve" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                {loadingAction === "approve" ? "Processing..." : "Approve"}
              </Button>
              <Button
                onClick={() => handleAction("reject", { action: "updateStatus", status: "rejected" })}
                disabled={loadingAction !== null}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {loadingAction === "reject" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                {loadingAction === "reject" ? "Processing..." : "Reject"}
              </Button>
            </>
          )}

          <Button
            onClick={() => handleAction("toggleFeatured", { action: "toggleFeatured" })}
            disabled={loadingAction !== null}
            variant={(review.isFeatured ?? false) ? "outline" : "default"}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loadingAction === "toggleFeatured" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {loadingAction === "toggleFeatured" ? "Processing..." : ((review.isFeatured ?? false) ? "Unfeature" : "Feature")}
          </Button>

          <Button
            onClick={() => handleAction("delete")}
            disabled={loadingAction !== null}
            variant="destructive"
            className="flex-1"
          >
            {loadingAction === "delete" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
            {loadingAction === "delete" ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
