// src/components/faq/faq-page.tsx
"use client";

import { useState } from "react";
import { HelpCircle, Sparkles, Search, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How fast are transactions processed?",
    answer:
      "All transactions are processed instantly after successful payment.",
  },
  {
    question: "Is Alifat Connect secure?",
    answer:
      "Yes. We use secure infrastructure and encrypted payment processing to protect every transaction.",
  },
  {
    question: "Can I buy data for all networks?",
    answer:
      "Yes. You can purchase data bundles for MTN, Airtel, Glo, and 9mobile.",
  },
  {
    question: "How do I fund my wallet?",
    answer:
      "You can fund your wallet using bank transfer or other available payment methods on your dashboard.",
  },
  {
    question: "Do you offer electricity bill payments?",
    answer:
      "Yes. You can pay electricity bills for major distribution companies across Nigeria.",
  },
  {
    question: "Is customer support available?",
    answer:
      "Absolutely. Our support team is available to assist you whenever you need help.",
  },
];

export default function FAQPage() {
  const [query, setQuery] = useState("");

  const filteredFaqs = faqs.filter((faq) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    const inQuestion = faq.question.toLowerCase().includes(q);
    const inAnswer = faq.answer.toLowerCase().includes(q);
    return inQuestion || inAnswer;
  });

  return (
    <>
      {/* FAQ Hero with Search */}
      <section
        aria-labelledby="faq-hero-title"
        className="relative overflow-hidden bg-gradient-to-b from-white via-[#fffdf7] to-white py-16 md:py-20 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950"
      >
        {/* Background Glow */}
        <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-[#D4AF37]/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#D4AF37]/10 blur-3xl" />

        {/* Dot Pattern */}
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.04]"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          role="presentation"
        >
          <defs>
            <pattern
              id="faq-pattern"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="2" fill="#D4AF37" />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#faq-pattern)" />
        </svg>

        <div className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <Badge
              className="
                rounded-full
                border border-[#D4AF37]/20
                bg-[#D4AF37]/10
                px-4 py-2
                text-[#B8860B]
                transition-colors
                hover:bg-[#D4AF37]/20
                dark:border-[#D4AF37]/30
                dark:bg-[#D4AF37]/15
                dark:text-[#F7E28A]
                dark:hover:bg-[#D4AF37]/25
              "
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Frequently Asked Questions
            </Badge>

            {/* Icon */}
            <div
              className="
                mx-auto mt-10 flex
                h-22 w-22
                items-center justify-center
                rounded-3xl
                bg-[#D4AF37]/10
                text-[#D4AF37]
                shadow-sm
                dark:bg-[#D4AF37]/15
              "
            >
              <HelpCircle className="h-11 w-11" />
            </div>

            {/* Heading */}
            <h1
              id="faq-hero-title"
              className="mt-8 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl dark:text-white"
            >
              Answers to Your
              <span
                className="
                  block
                  bg-gradient-to-r from-[#D4AF37] via-[#E6C55A] to-[#B8860B]
                  bg-clip-text text-transparent
                "
              >
                Most Common Questions
              </span>
            </h1>

            {/* Description */}
            <p
              className="
                mx-auto mt-6
                max-w-3xl
                text-lg leading-8
                text-gray-600
                md:text-xl
                dark:text-zinc-300
              "
            >
              Find everything you need to know about Alifat Connect,
              including wallet funding, data purchases, bill payments,
              and account security.
            </p>

            {/* Search Bar */}
            <div className="mx-auto mt-8 max-w-2xl">
              <label
                htmlFor="faq-search"
                className="sr-only"
              >
                Search questions
              </label>
              <div
                className="
                  relative flex items-center
                  rounded-xl
                  border border-gray-200
                  bg-white
                  shadow-sm
                  transition-shadow
                  focus-within:border-[#D4AF37]
                  focus-within:ring-2 focus-within:ring-[#D4AF37]/20
                  dark:border-zinc-700
                  dark:bg-zinc-900
                  dark:focus-within:border-[#D4AF37]
                  dark:focus-within:ring-[#D4AF37]/30
                "
              >
                <Search
                  className="
                    ml-4 h-5 w-5
                    text-gray-400
                    dark:text-zinc-400
                  "
                />
                <input
                  id="faq-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for answers..."
                  className="
                    w-full
                    px-4 py-3
                    bg-transparent
                    text-gray-900
                    placeholder:text-gray-400
                    outline-none
                    dark:text-white
                    dark:placeholder:text-zinc-400
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion (filtered) */}
      <section className="bg-gray-100 py-24 dark:bg-black">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          {filteredFaqs.length === 0 ? (
            <div className="text-center">
              <p className="text-lg text-gray-600 dark:text-gray-400">
                No answers found for “{query}”. Try a different keyword or
                contact our support team.
              </p>
            </div>
          ) : (
            <Accordion
              type="single"
              collapsible
              className="space-y-4"
            >
              {filteredFaqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="overflow-hidden rounded-3xl border border-gray-200 bg-white px-6 shadow-sm transition-all duration-300 hover:border-[#D4AF37]/60 hover:bg-[#FAFAFA] hover:shadow-lg dark:bg-zinc-950"
                >
                  <AccordionTrigger className="py-6 text-left text-lg font-semibold text-gray-900 hover:no-underline dark:text-white">
                    {faq.question}
                  </AccordionTrigger>

                  <AccordionContent className="pb-6 text-base leading-7 text-gray-600 dark:text-gray-400">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#D4AF37]" />
                      <p>{faq.answer}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </section>
    </>
  );
}