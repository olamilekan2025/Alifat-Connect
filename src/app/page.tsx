import Hero from "@/components/hero";
import Services from "@/components/services";
import Features from "@/components/features";
import HowItWorks from "@/components/how-it-work";
import TestimonialsGrid from "@/components/testimonials/testimonials-grid";
import FAQ from "@/components/faq";

export default function HomePage() {
  return (
    <>
      <Hero />
      {/* <TrustedBrands /> */}
      <Services />
      <Features />
      <HowItWorks />
      <TestimonialsGrid />
      <FAQ />
    </>
  );
}

