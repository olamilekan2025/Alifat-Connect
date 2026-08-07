"use client";

import { useState } from "react";
import { Star, ShieldCheck, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ReviewSubmissionPageProps {
  session: any;
}

const ratingLabels: Record<number, string> = {
  1: "Poor experience",
  2: "Could be better",
  3: "Good experience",
  4: "Very good experience",
  5: "Excellent experience",
};

export default function ReviewSubmissionPage({
  session,
}: ReviewSubmissionPageProps) {
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const activeRating = hoverRating || rating;
  const characterCount = content.length;
  const characterProgress = Math.min((characterCount / 1000) * 100, 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (content.trim().length < 10) {
      toast.error("Review must be at least 10 characters");
      return;
    }

    if (content.length > 1000) {
      toast.error("Review must be less than 1000 characters");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          content: content.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Review submitted successfully");
        router.push("/customer-reviews");
      } else {
        toast.error(data.error || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-black">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-0 lg:py-0">
        {/* Back */}
        <button
          type="button"
          onClick={() => router.push("/customer-reviews")}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Header */}
        <div className="mb-10 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#9A7610] dark:text-[#D4AF37]">
            <Star className="h-3.5 w-3.5 fill-current" />
            Customer Feedback
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl dark:text-white">
            Share your experience.
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-400">
            Your feedback helps us improve Alifat Connect and helps other
            customers know what they can expect from our platform.
          </p>
        </div>

        {/* Main layout */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Review form */}
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)] dark:border-zinc-800 dark:bg-zinc-900">
            {/* Form header */}
            <div className="border-b border-slate-100 px-6 py-6 sm:px-8 dark:border-zinc-800">
              <h2 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                Your review
              </h2>

              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                Tell us honestly about your experience with Alifat Connect.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 p-6 sm:p-8">
              {/* Rating */}
              <div>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <label className="text-sm font-semibold text-slate-900 dark:text-white">
                    How would you rate us?
                  </label>

                  {rating > 0 && (
                    <span className="text-sm font-medium text-[#9A7610] dark:text-[#D4AF37]">
                      {ratingLabels[rating]}
                    </span>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = star <= activeRating;

                      return (
                        <button
                          key={star}
                          type="button"
                          aria-label={`Rate ${star} out of 5 stars`}
                          aria-pressed={rating === star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="group rounded-xl p-2 transition-all duration-200 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                        >
                          <Star
                            className={`h-9 w-9 transition-all duration-200 sm:h-10 sm:w-10 ${
                              isActive
                                ? "fill-[#D4AF37] text-[#D4AF37] drop-shadow-[0_3px_8px_rgba(212,175,55,0.3)]"
                                : "text-slate-300 group-hover:text-[#D4AF37] dark:text-zinc-700"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 text-center">
                    {rating > 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        You selected{" "}
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {rating} out of 5
                        </span>
                      </p>
                    ) : (
                      <p className="text-sm text-slate-400 dark:text-slate-500">
                        Select a rating
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Review textarea */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label
                    htmlFor="review"
                    className="text-sm font-semibold text-slate-900 dark:text-white"
                  >
                    Your experience
                  </label>

                  <span
                    className={`text-xs font-medium ${
                      characterCount > 900
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {characterCount}/1000
                  </span>
                </div>

                <Textarea
                  id="review"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What did you like about Alifat Connect? How was your experience with our services?"
                  maxLength={1000}
                  className="min-h-[190px] resize-none rounded-2xl border-slate-200 bg-white px-5 py-4 text-[15px] leading-7 shadow-none transition-all placeholder:text-slate-400 focus-visible:border-[#D4AF37] focus-visible:ring-[#D4AF37]/20 dark:border-zinc-800 dark:bg-zinc-950 dark:placeholder:text-zinc-600"
                />

                {/* Character progress */}
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-[#D4AF37] transition-all duration-200"
                    style={{ width: `${characterProgress}%` }}
                  />
                </div>
              </div>

              {/* Guidelines */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-zinc-900">
                    <ShieldCheck className="h-5 w-5 text-[#9A7610] dark:text-[#D4AF37]" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      A few things to keep in mind
                    </h3>

                    <ul className="mt-2 space-y-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      <li>• Keep your feedback honest and respectful.</li>
                      <li>• Avoid sharing personal or sensitive information.</li>
                      <li>• Reviews are checked before being published.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end dark:border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/customer-reviews")}
                  disabled={submitting}
                  className="h-12 rounded-xl border-slate-200 px-6 font-semibold dark:border-zinc-700"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-12 rounded-xl bg-[#D4AF37] px-7 font-semibold text-black shadow-[0_8px_25px_-10px_rgba(212,175,55,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#C29F2F] hover:shadow-[0_12px_30px_-10px_rgba(212,175,55,0.8)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Review
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Side information */}
          <aside className="space-y-4">
            {/* Trust card */}
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D4AF37]/10">
                <CheckCircle2 className="h-5 w-5 text-[#9A7610] dark:text-[#D4AF37]" />
              </div>

              <h3 className="font-semibold text-slate-950 dark:text-white">
                Your voice matters
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Your experience helps us understand what we're doing well and
                where we can improve.
              </p>
            </div>

            {/* Moderation card */}
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />

                <div>
                  <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                    Review moderation
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Your review will be checked by our team before it appears
                    publicly. This helps us maintain a trustworthy community.
                  </p>
                </div>
              </div>
            </div>

            {/* Rating hint */}
            <div className="rounded-[24px] border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-6">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]"
                  />
                ))}
              </div>

              <p className="mt-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                Had a great experience?
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Let other customers know what you think.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}