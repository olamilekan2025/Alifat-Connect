// src/components/faq/faq-accordion.tsx
"use client";

import { CheckCircle2 } from "lucide-react";

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

export default function FAQAccordion() {
  return (
    <section className="bg-gray-100 py-24 dark:bg-black">
      <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
        <Accordion
          type="single"
          collapsible
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="overflow-hidden rounded-3xl border border-gray-200 bg-white px-6 shadow-sm transition-all duration-300 hover:border-[#D4AF37]/60 hover:bg-[#FAFAFA]  hover:shadow-lg dark:bg-zinc-950"
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
      </div>
    </section>
  );
}