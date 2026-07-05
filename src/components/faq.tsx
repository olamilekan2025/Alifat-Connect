"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    question: "How fast are transactions processed?",
    answer:
      "All transactions are processed instantly after successful payment.",
  },
  {
    question: "Is Alifat Connect secure?",
    answer:
      "Yes, all payments and wallet transactions are protected with secure encryption.",
  },
  {
    question: "Can I buy data for all networks?",
    answer:
      "Yes, you can purchase MTN, Airtel, Glo, and 9mobile data bundles easily.",
  },
  {
    question: "What payment methods are supported?",
    answer:
      "You can fund your wallet and pay securely using bank transfer, cards, and other supported payment methods.",
  },
];

export default function FAQ() {
  return (
    <section className="bg-white py-10 md:py-10 dark:bg-black">
      <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
            Frequently Asked Questions
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl dark:text-white">
            Got Questions?
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-600 dark:text-slate-400">
            Everything you need to know about Alifat Connect.
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion
          type="single"
          collapsible
          className="space-y-5"
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="overflow-hidden rounded-3xl border border-black bg-[#FAFAFA] px-6 shadow-sm transition-all duration-300 hover:border-[#D4AF37]/40 hover:shadow-lg dark:border-white dark:bg-zinc-950 dark:hover:border-[#D4AF37]/40 dark:hover:shadow-lg"
            >
              <AccordionTrigger className="py-6 text-left text-lg font-semibold text-gray-900 hover:no-underline md:text-xl dark:text-white">
                {faq.question}
              </AccordionTrigger>

              <AccordionContent className="pb-6 text-base leading-8 text-gray-600 dark:text-slate-400">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* CTA Button */}
        <div className="mt-12 flex justify-center">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-black px-8 text-white hover:bg-[#D4AF37] hover:text-black dark:bg-[#D4AF37] dark:text-black dark:hover:bg-white"
          >
            <Link href="/faq">
              View All FAQs
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}