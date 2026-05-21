import {
  ShieldCheck,
  Zap,
  Clock3,
  Smartphone,
  BadgeCheck,
  Wallet,
} from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    title: "Instant Transactions",
    description:
      "Buy data, airtime, and pay bills instantly without delays.",
    icon: Zap,
  },
  {
    title: "Secure Payments",
    description:
      "Your transactions are protected with safe and reliable security.",
    icon: ShieldCheck,
  },
  {
    title: "24/7 Availability",
    description:
      "Access all services anytime and anywhere with zero downtime.",
    icon: Clock3,
  },
  {
    title: "Mobile Friendly",
    description:
      "Enjoy a smooth experience across mobile, tablet, and desktop devices.",
    icon: Smartphone,
  },
  {
    title: "Trusted Platform",
    description:
      "Thousands of users trust Alifat Connect for daily payments.",
    icon: BadgeCheck,
  },
  {
    title: "Easy Wallet Funding",
    description:
      "Fund your wallet quickly and make payments with ease.",
    icon: Wallet,
  },
];

export default function Features() {
  return (
    <section className="bg-white py-10 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
            Why Choose Us
          </p>

          <h2 className="mt-4 text-4xl font-bold text-gray-900 md:text-5xl dark:text-white">
            Built For Speed, Security & Convenience
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Experience a premium digital payment platform designed
            to make your daily transactions simple and stress-free.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card
                key={feature.title}
                className="group rounded-3xl border border-[#EAEAEA] bg-[#FAFAFA] shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#D4AF37] hover:bg-white hover:shadow-2xl dark:border-white-20 dark:bg-black dark:hover:border-[#D4AF37]"
              >
                <CardHeader>
                  {/* Icon */}
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] transition-all duration-300 group-hover:bg-[#D4AF37] group-hover:text-black">
                    <Icon className="h-8 w-8" />
                  </div>

                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    {feature.title}
                  </CardTitle>

                  <CardDescription className="pt-2 text-base leading-relaxed text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}