// src/components/testimonials/testimonials-hero.tsx
import { Quote, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export default function TestimonialsHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#fffdf7] to-white py-10 md:py-10 dark:from-black dark:via-black dark:to-black">
      {/* Background Glow */}
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />

      {/* Dot Pattern */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.04]"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="testimonials-pattern"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="2" fill="#D4AF37" />
          </pattern>
        </defs>

        <rect
          width="100%"
          height="100%"
          fill="url(#testimonials-pattern)"
        />
      </svg>

      <div className="relative mx-auto max-w-4xl px-4 text-center md:px-6 lg:px-8">
        {/* Badge */}
        <Badge className="rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-4 py-2 text-[#B8860B] hover:bg-[#D4AF37]/10 dark:border-[#D4AF37]/30 dark:bg-[#D4AF37]/15 dark:text-[#F7E28A]">
          <Quote className="mr-2 h-4 w-4" />
          Customer Testimonials
        </Badge>

        {/* Heading */}
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl xl:text-7xl dark:text-white">
          Trusted by Thousands
          <span className="block bg-gradient-to-r from-[#D4AF37] via-[#E6C55A] to-[#B8860B] bg-clip-text text-transparent">
            Across Nigeria
          </span>
        </h1>

        {/* Description */}
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600 md:text-xl dark:text-slate-300">
          See what our customers are saying about their experience using
          Alifat Connect for data purchases, bill payments, and seamless
          digital transactions.
        </p>

        {/* Rating */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-2">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className="h-5 w-5 fill-[#D4AF37] text-[#D4AF37]"
              />
            ))}
          </div>

          <span className="text-sm font-medium text-gray-600 dark:text-slate-400">
            Rated 4.9/5 by our customers
          </span>
        </div>
      </div>
    </section>
  );
}