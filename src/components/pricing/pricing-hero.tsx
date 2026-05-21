// src/components/pricing/pricing-hero.tsx
import { BadgeDollarSign, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export default function PricingHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#fffdf7] to-white py-10 md:py-10 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
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
            id="pricing-pattern"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="2"
              cy="2"
              r="2"
              fill="#D4AF37"
            />
          </pattern>
        </defs>

        <rect
          width="100%"
          height="100%"
          fill="url(#pricing-pattern)"
        />
      </svg>

      <div className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <Badge className="rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-4 py-2 text-[#B8860B] hover:bg-[#D4AF37]/10 dark:border-[#D4AF37]/30 dark:bg-[#D4AF37]/15 dark:text-[#F7E28A]">
            <Sparkles className="mr-2 h-4 w-4" />
            Transparent Pricing
          </Badge>

          {/* Icon */}
          <div className="mx-auto mt-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#D4AF37]/10 text-[#D4AF37] dark:bg-[#D4AF37]/15">
            <BadgeDollarSign className="h-10 w-10" />
          </div>

          {/* Heading */}
          <h1 className="mt-8 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl xl:text-7xl dark:text-white">
            Affordable Rates for
            <span className="block bg-gradient-to-r from-[#D4AF37] via-[#E6C55A] to-[#B8860B] bg-clip-text text-transparent">
              Every Transaction
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600 md:text-xl dark:text-slate-300">
            Enjoy competitive pricing on data bundles, airtime,
            utility bills, TV subscriptions, and more with no
            hidden charges.
          </p>
        </div>
      </div>
    </section>
  );
}