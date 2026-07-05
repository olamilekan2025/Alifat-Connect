import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#fffdf7] to-white py-10 md:py-10 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-950">
      {/* Background Glow */}
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />

      {/* Dot Pattern */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.04] dark:opacity-[0.03]"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="about-pattern"
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
          fill="url(#about-pattern)"
        />
      </svg>

      <div className="relative mx-auto max-w-7xl pt-20 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl text-center">
            {/* Badge */}
            <Badge className="inline-flex rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-4 py-2 text-[#B8860B] hover:bg-[#D4AF37]/10 dark:border-[#D4AF37]/30 dark:bg-[#D4AF37]/10 dark:text-[#D4AF37]">
              <Sparkles className="mr-2 h-4 w-4" />
              About Alifat Connect
            </Badge>

            {/* Heading */}
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl xl:text-7xl dark:text-white">
              Powering Nigeria&apos;s
              <span className="block bg-gradient-to-r from-[#D4AF37] via-[#E6C55A] to-[#B8860B] bg-clip-text text-transparent">
                Digital Payments
              </span>
            </h1>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600 md:text-xl dark:text-slate-400">
              Alifat Connect makes it easy to buy data, airtime,
              pay bills, and fund wallets instantly through one
              secure and reliable platform.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="w-full rounded-full bg-black px-8 text-white hover:bg-[#D4AF37] hover:text-black dark:bg-[#D4AF37] dark:text-black dark:hover:bg-white sm:w-auto"
              >
                <Link href="/auth/signup">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full rounded-full border-gray-300 px-8 text-gray-900 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black dark:border-slate-700 dark:bg-transparent dark:text-white dark:hover:border-[#D4AF37] dark:hover:bg-[#D4AF37] dark:hover:text-black sm:w-auto"
              >
                <Link href="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}