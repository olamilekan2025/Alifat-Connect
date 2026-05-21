// src/app/(public)/faq/page.tsx
import FAQHero from "@/components/faq/faq-hero";
import FAQAccordion from "@/components/faq/faq-accordion";
import CTASection from "@/components/about/cta-section";

export default function FAQPage() {
  return (
    <main>
      <FAQHero />
      <FAQAccordion />
      <CTASection />
    </main>
  );
}