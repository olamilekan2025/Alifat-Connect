// src/components/testimonials/testimonials-grid.tsx
"use client";

import { Star } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Adebayo T.",
    role: "Entrepreneur",
    content:
      "Alifat Connect is incredibly fast and reliable. I buy data and pay bills within seconds.",
  },
  {
    name: "Chioma E.",
    role: "Student",
    content:
      "The platform is simple to use, and transactions are always processed instantly.",
  },
  {
    name: "Ibrahim M.",
    role: "Business Owner",
    content:
      "I trust Alifat Connect for all my daily transactions. The service is excellent.",
  },
  {
    name: "Blessing O.",
    role: "Freelancer",
    content:
      "Wallet funding is seamless, and I love how secure the platform feels.",
  },
  {
    name: "Samuel A.",
    role: "Developer",
    content:
      "One of the best VTU platforms I've used. Fast, affordable, and dependable.",
  },
  {
    name: "Fatima U.",
    role: "Teacher",
    content:
      "Their customer support is responsive, and every transaction goes through smoothly.",
  },
];

export default function TestimonialsGrid() {
  return (
    <section className="bg-[#FAFAFA] py-24 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
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
            {testimonials.map((testimonial, index) => (
              <CarouselItem
                key={index}
                className="pl-4 md:basis-1/2 lg:basis-1/3"
              >
                <Card className="h-full rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:bg-black ">
                  <CardContent className="flex h-full flex-col p-8">
                    {/* Stars */}
                    <div className="mb-6 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]"
                        />
                      ))}
                    </div>

                    {/* Content */}
                    <p className="flex-1 leading-8 text-gray-600 dark:text-white">
                      “{testimonial.content}”
                    </p>

                    {/* Author */}
                    <div className="mt-6 border-t border-gray-100 pt-6">
                      <h4 className="font-semibold text-gray-900 dark:text-[#D4AF37]">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-400">
                        {testimonial.role}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <CarouselPrevious className="static translate-y-0 rounded-full border-gray-300 bg-white hover:bg-[#D4AF37] hover:text-black dark:bg-white dark:hover:bg-[#D4AF37] dark:text-black dark:hover:text-white" />
            <CarouselNext className="static translate-y-0 rounded-full border-gray-300 bg-white hover:bg-[#D4AF37] hover:text-black dark:bg-white dark:hover:bg-[#D4AF37] dark:text-black dark:hover:text-white" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}