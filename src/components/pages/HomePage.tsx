import { getTranslations } from "next-intl/server";

import { Container, SectionHeader } from "@/components/layouts";
import { fetchAllAvailableCars } from "@/lib/cars/fetchCars";
import { CarsCarousel } from "@/components/pages/home/CarsCarousel";

import { HeroContent } from "@/components/pages/home/HeroContent";
import { HeroLogo } from "@/components/pages/home/HeroLogo";
import { PartnersStrip } from "@/components/pages/home/PartnersStrip";
import { ServicesSection } from "@/components/pages/home/ServicesSection";
import { AboutSection } from "@/components/pages/home/AboutSection";
import { ContactSection } from "@/components/pages/home/ContactSection";
import { ScrollSpy } from "@/components/pages/home/ScrollSpy";


export const HomePage = async () => {
  const t = await getTranslations();

  // Fetch cars data server-side
  const result = await fetchAllAvailableCars();
  const cars = result.success ? result.cars || [] : [];

  return (
    <div className="pt-20">
      <ScrollSpy />

      <section id="hero" className="relative overflow-hidden bg-gray-50 dark:bg-black min-h-[calc(100vh-5rem)] flex items-center transition-colors duration-300">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] dark:opacity-100 opacity-0 transition-opacity duration-300">
          <div className="glow-effect"></div>
        </div>

        <Container className="w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <HeroContent className="order-2 lg:order-1" />

            <div className="self-start order-1 lg:order-2">
              <HeroLogo />
            </div>
          </div>
        </Container>
      </section>

      <section id="our-partners" className="py-16 lg:py-20 bg-gray-50 dark:bg-[#1a1a1a] transition-colors duration-300">
        <Container>
          <PartnersStrip />
        </Container>
      </section>

      <section id="services" className="py-20 lg:py-28 bg-white dark:bg-black transition-colors duration-300">
        <Container>
          <ServicesSection />
        </Container>
      </section>

      <section id="popular-deals" className="py-20 lg:py-28 bg-gray-50 dark:bg-[#111111] transition-colors duration-300">
        <Container>
          <SectionHeader
            title={t("home.popularDeals.title")}
            description={t("home.popularDeals.description")}
          />

          <CarsCarousel cars={cars} />
        </Container>
      </section>

      <section id="about" className="py-20 lg:py-28 bg-white dark:bg-black transition-colors duration-300">
        <Container>
          <AboutSection />
        </Container>
      </section>

      <section id="contact" className="py-20 lg:py-28 bg-gray-50 dark:bg-[#111111] transition-colors duration-300">
        <Container>
          <ContactSection />
        </Container>
      </section>
    </div>
  );
};
