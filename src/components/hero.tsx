"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-black">
      {/* SVG Background */}
      <div className="pointer-events-none absolute inset-0">
        <svg
          className="absolute left-0 top-0 h-full w-full"
          viewBox="0 0 1440 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Blue Blur */}
          <circle
            cx="250"
            cy="150"
            r="220"
            fill="#2563EB"
            fillOpacity="0.12"
          />

          {/* Green Blur */}
          <circle
            cx="1200"
            cy="600"
            r="260"
            fill="#10B981"
            fillOpacity="0.12"
          />

          {/* Lines */}
          <path
            d="M0 200C250 350 450 50 700 200C950 350 1150 150 1440 300"
            stroke="#2563EB"
            strokeOpacity="0.1"
            strokeWidth="3"
          />

          <path
            d="M0 500C250 650 450 350 700 500C950 650 1150 450 1440 600"
            stroke="#10B981"
            strokeOpacity="0.1"
            strokeWidth="3"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 py-15 md:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-4 py-2 text-sm font-medium text-[#B8860B]">
            Fast & Secure VTU Platform
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-extrabold leading-tight text-gray-900 md:text-6xl dark:text-white">
            Buy Data,
            <span className="text-[#D4AF37]"> Airtime </span>
            & Pay Bills Instantly
          </h1>

          {/* Description */}
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Simple, fast, and reliable digital payment services for everyone.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3 font-semibold text-black transition hover:bg-black hover:text-white"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-black px-6 py-3 font-semibold text-white transition hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black dark:border-slate-700 dark:bg-white dark:text-black"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}