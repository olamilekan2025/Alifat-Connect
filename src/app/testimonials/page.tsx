import TestimonialsHero from "@/components/testimonials/testimonials-hero";
import TestimonialsGrid from "@/components/testimonials/testimonials-grid";
import StatsSection from "@/components/about/stats-section";
import CTASection from "@/components/about/cta-section";

export default function TestimonialsPage() {
  return (
    <>
      <TestimonialsHero />
      <TestimonialsGrid />
      <StatsSection />
      <CTASection />
    </>
  );
}