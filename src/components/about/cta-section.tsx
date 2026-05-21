// src/components/about/cta-section.tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-white py-24 md:py-32 dark:bg-zinc-950">
      {/* Background Glow */}
      {/* <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-[#D4AF37]/10 blur-3xl" /> */}

      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div
          className="
            relative overflow-hidden rounded-[2.5rem]
            bg-black
            px-8 py-16
            text-center
            shadow-[0_30px_100px_rgba(0,0,0,0.25)]
            md:px-16 md:py-20
            dark:border dark:border-white
            dark:bg-black
          "
        >
          {/* Gold Gradient Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(179,150,55,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(212,175,55,0.10),transparent_35%)]" />

          {/* Top Accent */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

          {/* Content */}
          <div className="relative z-10 mx-auto max-w-3xl">
            {/* Eyebrow */}
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
              Get Started Today
            </p>

            {/* Heading */}
            <h2 className="mt-6 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
              Ready to Simplify Your
              <span className="block bg-gradient-to-r from-[#D4AF37] via-[#F7E28A] to-[#D4AF37] bg-clip-text text-transparent">
                Digital Transactions?
              </span>
            </h2>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-300 dark:text-slate-300">
              Join thousands of customers who trust Alifat Connect for fast,
              secure, and reliable digital payments.
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-[#D4AF37] px-8 font-semibold text-black hover:bg-[#E6C55A]"
              >
                <Link href="/auth/signup">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="
                  rounded-full
                  border-white/20
                  bg-white/5
                  px-8
                  text-white
                  backdrop-blur-sm
                  hover:bg-white/10
                  hover:text-white
                  dark:border-slate-700
                  dark:bg-slate-800/50
                  dark:hover:bg-slate-800
                "
              >
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}