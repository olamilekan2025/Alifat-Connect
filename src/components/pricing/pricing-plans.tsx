// src/components/pricing/pricing-plans.tsx
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

const plans = [
  {
    title: "Starter",
    description: "Perfect for individuals getting started.",
    price: "Free",
    highlight: false,
    features: [
      "Create wallet account",
      "Buy data & airtime",
      "Pay utility bills",
      "Transaction history",
      "Email support",
    ],
  },
  {
    title: "Premium",
    description: "Best for frequent users and businesses.",
    price: "₦0",
    note: "No subscription fee",
    highlight: true,
    features: [
      "Discounted service rates",
      "Priority transaction processing",
      "24/7 customer support",
      "Advanced wallet management",
      "Exclusive promotional offers",
    ],
  },
  {
    title: "Enterprise",
    description: "Custom solutions for large-scale operations.",
    price: "Custom",
    highlight: false,
    features: [
      "Bulk transactions",
      "Dedicated account manager",
      "API integration",
      "Custom pricing",
      "Priority support",
    ],
  },
];

export default function PricingPlans() {
  return (
    <section className="bg-gray-100 py-16 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
            Choose Your Plan
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl dark:text-white">
            Simple, Fair, and Transparent
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-600 dark:text-slate-300">
            Start for free and enjoy competitive rates on every
            transaction. Upgrade anytime as your needs grow.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.title}
              className={`relative rounded-[2rem] border transition-all duration-300 dark:bg-zinc-950 ${
                plan.highlight
                  ? "border-[#D4AF37] shadow-2xl shadow-[#D4AF37]/10"
                  : "border-gray-200 bg-white shadow-sm hover:-translate-y-1 hover:shadow-xl dark:border-white dark:hover:-translate-y-1 dark:hover:shadow-xl dark:hover:shadow-white/10"
              }`}
            >
              {/* Most Popular Badge */}
              {plan.highlight && (
                <Badge className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4AF37] px-4 py-1.5 text-black hover:bg-[#D4AF37]">
                  <Sparkles className="mr-1 h-4 w-4" />
                  Most Popular
                </Badge>
              )}

              <CardHeader className="p-8 pb-4 text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {plan.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-slate-400">
                  {plan.description}
                </p>

                <div className="mt-6">
                  <span className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {plan.price}
                  </span>

                  {plan.note && (
                    <p className="mt-2 text-sm font-medium text-[#B8860B] dark:text-[#F7E28A]">
                      {plan.note}
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-8 pt-4">
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#D4AF37]" />
                      <span className="text-sm text-gray-600 dark:text-slate-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  size="lg"
                  className={`mt-8 w-full rounded-full ${
                    plan.highlight
                      ? "bg-black text-white hover:bg-[#D4AF37] hover:text-black dark:bg-[#D4AF37] dark:text-black dark:hover:bg-[#E6C55A]"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-white dark:text-black dark:hover:bg-[#D4AF37] dark:hover:text-white"
                  }`}
                >
                  <Link
                    href={
                      plan.title === "Enterprise"
                        ? "/contact"
                        : "/auth/signup"
                    }
                  >
                    {plan.title === "Enterprise"
                      ? "Contact Sales"
                      : "Get Started"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}