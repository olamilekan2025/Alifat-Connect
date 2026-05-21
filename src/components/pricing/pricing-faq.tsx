// src/components/pricing/pricing-faq.tsx
"use client";

import { CheckCircle2 } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const pricingFAQs = [
  {
    question: "Do I pay a monthly subscription fee?",
    answer:
      "No. Alifat Connect is completely free to join. You only pay for the services you use.",
  },
  {
    question: "Are there any hidden charges?",
    answer:
      "No. All pricing is transparent, and you will always see the total amount before completing a transaction.",
  },
  {
    question: "Do premium users pay extra?",
    answer:
      "No subscription is required. Premium users simply enjoy better rates and exclusive offers.",
  },
  {
    question: "Can businesses get custom pricing?",
    answer:
      "Yes. We offer tailored pricing and API integration for businesses and high-volume users.",
  },
  {
    question: "How do I access discounted rates?",
    answer:
      "Create an account and start transacting. Eligible users automatically enjoy our best available pricing.",
  },
];

export default function PricingFAQ() {
  return (
    <section className="bg-[#FAFAFA] py-10 dark:bg-black">
      <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
            Pricing Questions
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
            Everything You Need to Know
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Clear answers about our pricing, billing, and service rates.
          </p>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {pricingFAQs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="overflow-hidden rounded-3xl border border-gray-200 bg-white px-6 shadow-sm transition-all duration-300 hover:border-[#D4AF37]/40 hover:shadow-lg dark:border-white dark:bg-zinc-950 dark:hover:border-[#D4AF37]/40"
            >
              <AccordionTrigger className="py-6 text-left text-lg font-semibold text-gray-900 hover:no-underline dark:text-white">
                {faq.question}
              </AccordionTrigger>

              <AccordionContent className="pb-6">
                <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#D4AF37]" />
                  <p className="leading-7">{faq.answer}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}