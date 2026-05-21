// src/components/about/why-choose-us.tsx
import {
  ShieldCheck,
  Zap,
  Clock3,
  BadgeCheck,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

const reasons = [
  {
    title: "Instant Delivery",
    description:
      "Transactions are processed immediately after successful payment.",
    icon: Zap,
  },
  {
    title: "Bank-Level Security",
    description:
      "Your payments and personal information are protected with advanced security.",
    icon: ShieldCheck,
  },
  {
    title: "24/7 Availability",
    description:
      "Access all our services anytime, anywhere with zero downtime.",
    icon: Clock3,
  },
  {
    title: "Trusted Platform",
    description:
      "Thousands of satisfied customers rely on Alifat Connect every day.",
    icon: BadgeCheck,
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-white py-10 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
            Why Choose Us
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl dark:text-white">
            Built for Reliability
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-600 dark:text-slate-400">
            Experience a premium platform designed for speed,
            security, and convenience.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason) => {
            const Icon = reason.icon;

            return (
              <Card
                key={reason.title}
                className="
                  group rounded-3xl
                  border border-gray-200
                  bg-[#FAFAFA]
                  shadow-sm
                  transition-all duration-300
                  hover:-translate-y-2
                  hover:border-[#D4AF37]
                  hover:bg-white
                  hover:shadow-2xl
                  dark:border-white
                  dark:bg-black
                  dark:hover:border-[#D4AF37]
                  // dark:hover:bg-black
                "
              >
                <CardContent className="p-8">
                  {/* Icon */}
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] transition-all duration-300 group-hover:bg-[#D4AF37] group-hover:text-black dark:border dark:border-white">
                    <Icon className="h-6 w-6" />
                  </div>  

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {reason.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-3 leading-7 text-gray-600 dark:text-slate-400">
                    {reason.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}