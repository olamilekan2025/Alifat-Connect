// src/components/pricing/data-pricing-section.tsx
import Link from "next/link";
import { ArrowRight, Wifi } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

const networks = [
  {
    name: "MTN",
    color: "bg-yellow-400",
    plans: [
      { size: "500MB", price: "₦0", validity: "30 days" },
      { size: "1GB", price: "₦550", validity: "30 days" },
      { size: "2GB", price: "₦1,100", validity: "30 days" },
      { size: "3GB", price: "₦1,650", validity: "30 days" },
      { size: "5GB", price: "₦2,750", validity: "30 days" },
      { size: "10GB", price: "₦5,500", validity: "60 days" },
    ],
  },
  {
    name: "Glo",
    color: "bg-green-500",
    plans: [
      { size: "200MB", price: "₦420", validity: "14 days" },
      { size: "500MB", price: "₦420", validity: "30 days" },
      { size: "1GB", price: "₦840", validity: "30 days" },
      { size: "2GB", price: "₦1,680", validity: "30 days" },
      { size: "5GB", price: "₦4,200", validity: "30 days" },
      { size: "10GB", price: "₦8,400", validity: "30 days" },
    ],
  },
  {
    name: "Airtel",
    color: "bg-red-500",
    plans: [
      { size: "100MB", price: "₦0", validity: "7 days" },
      { size: "300MB", price: "₦795", validity: "7 days" },
      { size: "500MB", price: "₦795", validity: "30 days" },
      { size: "1GB", price: "₦795", validity: "30 days" },
      { size: "2GB", price: "₦1,590", validity: "30 days" },
      { size: "5GB", price: "₦3,975", validity: "30 days" },
      { size: "10GB", price: "₦7,950", validity: "30 days" },
      { size: "15GB", price: "₦11,925", validity: "30 days" },
    ],
  },
  {
    name: "9mobile",
    color: "bg-emerald-600",
    plans: [
      { size: "1GB", price: "₦270", validity: "30 days" },
      { size: "1.5GB", price: "₦405", validity: "30 days" },
      { size: "2GB", price: "₦540", validity: "30 days" },
      { size: "2.5GB", price: "₦675", validity: "30 days" },
      { size: "3GB", price: "₦810", validity: "30 days" },
      { size: "4.5GB", price: "₦1,215", validity: "30 days" },
      { size: "5GB", price: "₦1,350", validity: "30 days" },
      { size: "6GB", price: "₦1,620", validity: "30 days" },
    ],
  },
];

export default function DataPricingSection() {
  return (
    <section className="bg-white py-20 md:py-10 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
            Data Pricing
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl dark:text-white">
            Affordable Data Plans and Prices
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-600 dark:text-slate-300">
            Enjoy competitive rates across all major networks in Nigeria.
          </p>
        </div>

        {/* Network Cards */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {networks.map((network) => (
            <Card
              key={network.name}
              className="group overflow-hidden rounded-[1.5rem] border border-black bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#D4AF37] hover:shadow-2xl dark:border-white dark:bg-black"
            >
              {/* Header */}
              <CardHeader className="pb-2">
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl ${network.color} text-white shadow-lg`}
                  >
                    <Wifi className="h-6 w-6" />
                  </div>

                  <h3 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                    {network.name}
                  </h3>
                </div>
              </CardHeader>

              {/* Content */}
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {network.plans.map((plan, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-3 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                    >
                      <span className="font-medium text-gray-700 dark:text-slate-200">
                        {plan.size}
                      </span>

                      <span className="text-center font-bold text-[#D4AF37]">
                        {plan.price}
                      </span>

                      <span className="text-right text-xs text-gray-500 dark:text-slate-400">
                        {plan.validity}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  asChild
                  className="mt-6 w-full rounded-full bg-black text-white hover:bg-[#D4AF37] hover:text-black dark:bg-white dark:text-black dark:hover:bg-[#E6C55A]"
                >
                  <Link href="/auth/signup">
                    Get Started
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