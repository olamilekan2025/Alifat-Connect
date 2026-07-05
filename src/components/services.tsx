"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Wifi,
  Smartphone,
  Tv,
  Lightbulb,
  GraduationCap,
  Wallet,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const services = [
  {
    title: "Data Bundle",
    description: "Buy affordable data instantly on all networks.",
    icon: Wifi,
    features: ["Instant Delivery", "All Networks", "Cheap Rates"],
    href: "/services/data",
  },
  {
    title: "Airtime Topup",
    description: "Recharge airtime fast and securely anytime.",
    icon: Smartphone,
    features: ["24/7 Available", "Fast Recharge", "Secure Payment"],
    href: "/services/airtime",
  },
  {
    title: "TV Subscription",
    description: "Pay for DStv, GOtv & Startimes easily.",
    icon: Tv,
    features: ["Instant Activation", "Easy Renewal", "Affordable"],
    href: "/services/tv",
  },
  {
    title: "Electricity Bills",
    description: "Pay utility bills without stress.",
    icon: Lightbulb,
    features: ["Fast Token", "No Delay", "All DISCO Supported"],
    href: "/services/electricity",
  },
  {
    title: "Education Pins",
    description: "Purchase WAEC, NECO & JAMB pins instantly.",
    icon: GraduationCap,
    features: ["Instant PIN", "Reliable", "24/7 Access"],
    href: "/services/education",
  },
  {
    title: "Wallet Funding",
    description: "Fund betting and digital wallets quickly.",
    icon: Wallet,
    features: ["Secure Funding", "Fast Payment", "Easy Transfer"],
    href: "/services/wallet",
  },
];

export default function Services() {
  const [showAll, setShowAll] = useState(false);

  const displayedServices = showAll
    ? services
    : services.slice(0, 3);

  return (
    <section className="bg-[#FAFAFA] py-10 dark:bg-zinc-950 ">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
            Our Services
          </p>

          <h2 className="mt-4 text-4xl font-bold text-gray-900 md:text-5xl dark:text-white">
            Everything You Need In One Place
          </h2>

          <p className="mt-5 text-lg text-gray-600 dark:text-gray-300">
            Fast, secure, and reliable digital services designed for
            everyday convenience.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {displayedServices.map((service) => {
            const Icon = service.icon;

            return (
              <Card
                key={service.title}
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-black bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-[#D4AF37] hover:shadow-2xl dark:border-white dark:bg-black dark:hover:border-[#D4AF37] dark:hover:shadow-2xl"
              >
                {/* Top Accent Bar */}
                <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-[#D4AF37] transition-transform duration-500 group-hover:scale-x-100" />

                <CardHeader>
                  {/* Icon */}
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-[#D4AF37] transition-all duration-300 group-hover:bg-[#D4AF37] group-hover:text-black dark: border border-white">
                    <Icon className="h-6 w-6" />
                  </div>

                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    {service.title}
                  </CardTitle>

                  <CardDescription className="pt-2 text-base leading-relaxed text-gray-600 dark:text-gray-300">
                    {service.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 ">
                  {/* Features */}
                  <div className="space-y-3">
                    {service.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#D4AF37]" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

              </Card>
            );
          })}
        </div>

        {/* View All Button */}
        {!showAll && (
          <div className="mt-14 flex justify-center">
            <Button
              onClick={() => setShowAll(true)}
              size="lg"
              className="rounded-full bg-black px-8 text-white hover:bg-[#D4AF37] hover:text-black dark:bg-[#D4AF37] dark:text-black dark:hover:bg-white"
            >
              View All Services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}