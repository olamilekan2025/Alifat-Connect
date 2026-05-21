import Hero from "@/components/hero";
import Services from "@/components/services";
import Features from "@/components/features";
import HowItWorks from "@/components/how-it-work";
import FAQ from "@/components/faq";

export default function HomePage() {
  return (
    <>
      <Hero />
      {/* <TrustedBrands /> */}
      <Services />
      <Features />
      <HowItWorks />
      <FAQ />
    </>
  );
}

