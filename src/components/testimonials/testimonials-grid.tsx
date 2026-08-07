// src/components/testimonials/testimonials-grid.tsx
"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PublicReview {
  _id: string;
  rating: number;
  content: string;
  displayName: string;
  avatar?: string;
  isFeatured: boolean;
  createdAt: Date;
}

export default function TestimonialsGrid() {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch("/api/public/reviews?type=homepage");
        const data = await response.json();
        setReviews(data.reviews || []);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  // Don't render section if no reviews and not loading
  if (!loading && reviews.length === 0) {
    return null;
  }

  // Loading skeleton
  if (loading) {
    return (
      <section className="bg-[#FAFAFA] py-24 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Users Reviews
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              What our users are saying
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Render stars based on rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating
            ? "fill-[#D4AF37] text-[#D4AF37]"
            : "text-gray-300 dark:text-gray-600"
        }`}
      />
    ));
  };

  return (
    <section className="bg-[#FAFAFA] py-24 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Users Reviews
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Real experiences from Alifat Connect users
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 4000,
              stopOnInteraction: true,
              stopOnMouseEnter: true,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {reviews.map((review) => (
              <CarouselItem
                key={review._id}
                className="pl-4 md:basis-1/2 lg:basis-1/3"
              >
                <Card className="h-full rounded-3xl border border-black bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:bg-black dark:border-white">
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
                            Verified Users
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <CarouselPrevious className="static h-12 w-12 translate-y-0 rounded-full border-gray-300 bg-white hover:bg-[#D4AF37] hover:text-black dark:bg-white dark:hover:bg-[#D4AF37] dark:text-black dark:hover:text-white" />
            <CarouselNext className="static h-12 w-12 translate-y-0 rounded-full border-gray-300 bg-white hover:bg-[#D4AF37] hover:text-black dark:bg-white dark:hover:bg-[#D4AF37] dark:text-black dark:hover:text-white" />
          </div>
        </Carousel>

        {/* View All Reviews Button */}
        <div className="mt-12 text-center">
          <Link href="/customer-reviews">
            <Button
              size="lg"
              className="bg-[#D4AF37] hover:bg-[#B89430] text-black font-semibold px-8 py-6 rounded-full transition-all duration-300 hover:scale-105"
            >
              View All Users Reviews
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}