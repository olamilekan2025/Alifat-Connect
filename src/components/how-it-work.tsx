import {
  UserPlus,
  Wallet,
  Smartphone,
  CheckCircle2,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const steps = [
  {
    title: "Create Account",
    description:
      "Sign up in minutes and access all digital payment services.",
    icon: UserPlus,
  },
  {
    title: "Fund Wallet",
    description:
      "Add money securely to your wallet using your preferred payment method.",
    icon: Wallet,
  },
  {
    title: "Choose Service",
    description:
      "Buy data, airtime, pay bills, or subscribe to TV instantly.",
    icon: Smartphone,
  },
  {
    title: "Transaction Completed",
    description:
      "Receive instant confirmation after every successful payment.",
    icon: CheckCircle2,
  },
];

export default function HowItWorks() {
  return (
    <section className="overflow-hidden bg-[#FAFAFA] py-10 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
            How It Works
          </p>

          <h2 className="mt-4 text-4xl font-bold text-gray-900 md:text-5xl dark:text-white">
            Get Started In Simple Steps
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Enjoy fast and seamless transactions with a smooth
            payment experience from start to finish.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Connecting Line */}
          <div className="absolute left-0 top-20 hidden w-full border-t border-dashed border-[#D4AF37]/40 lg:block" />

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.title}
                className="group relative"
              >
                {/* Step Number */}
                <div className="absolute left-8 top-0 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-4 border-[#FAFAFA] bg-black text-sm font-bold text-[#D4AF37] dark:border-slate-950 dark:bg-white dark:text-black">
                  0{index + 1}
                </div>

                <Card className="relative z-10 rounded-3xl border border-[#EAEAEA] bg-white pt-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-[#D4AF37] hover:shadow-2xl dark:border-white-20 dark:bg-black dark:hover:border-[#D4AF37]">
                  <CardHeader>
                    {/* Icon */}
                    <div className="mb-6 flex h-13 w-13 items-center justify-center rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] transition-all duration-300 group-hover:bg-[#D4AF37] group-hover:text-black">
                      <Icon className="h-5 w-5" />
                    </div>

                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                      {step.title}
                    </CardTitle>

                    <CardDescription className="pt-2 text-base leading-relaxed text-gray-600 dark:text-gray-300">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}