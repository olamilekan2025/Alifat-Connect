// src/app/about/page.tsx

import AboutHero from "@/components/about/about-hero";
import MissionVision from "@/components/about/mission-vision";
import WhyChooseUs from "@/components/about/why-choose-us";
import StatsSection from "@/components/about/stats-section";
import CTASection from "@/components/about/cta-section";

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <MissionVision />
      <WhyChooseUs />
      <StatsSection />
      <CTASection />
    </>
  );
}
