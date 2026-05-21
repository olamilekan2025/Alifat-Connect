// src/app/(public)/pricing/page.tsx
import PricingHero from "@/components/pricing/pricing-hero";
import PricingPlans from "@/components/pricing/pricing-plans";
import DataPricingSection from "@/components/pricing/DataPricingSection";
import PricingFAQ from "@/components/pricing/pricing-faq";
import CTASection from "@/components/about/cta-section";

export default function PricingPage() {
  return (
    <main>
      <PricingHero />
      <PricingPlans />
         <DataPricingSection />
      <PricingFAQ />
      <CTASection />
    </main>
  );
}