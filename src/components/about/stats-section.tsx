// src/components/about/stats-section.tsx
"use client";

import CountUp from "react-countup";
import {
  CreditCard,
  Globe,
  Star,
  Users,
} from "lucide-react";

const stats = [
  {
    label: "Happy Customers",
    value: 100,
    suffix: "+",
    icon: Users,
  },
  {
    label: "Transactions Completed",
    value: 100,
    suffix: "+",
    icon: CreditCard,
  },
  {
    label: "Services Available",
    value: 20,
    suffix: "+",
    icon: Globe,
  },
  {
    label: "Customer Satisfaction",
    value: 99.9,
    suffix: "%",
    decimals: 1,
    icon: Star,
  },
];

export default function StatsSection() {
  return (
    <section className="bg-gray-100 py-24 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="
                  group relative overflow-hidden rounded-3xl
                  border border-black
                  bg-white
                  px-6 py-8
                  text-center
                  shadow-sm
                  transition-all duration-500
                  hover:-translate-y-2
                  hover:border-[#D4AF37]/40
                  hover:shadow-2xl
                  dark:border-white
                  dark:bg-zinc-950
                "
              >
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Icon */}
                <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] transition-transform duration-500 group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </div>

                {/* Count Up */}
                <div className="relative text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                  <CountUp
                    end={stat.value}
                    duration={2.5}
                    separator=","
                    decimals={stat.decimals ?? 0}
                    suffix={stat.suffix}
                    enableScrollSpy
                    scrollSpyOnce
                  />
                </div>

                {/* Label */}
                <p className="relative mt-2 text-sm font-medium text-gray-600 dark:text-slate-400">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}