import { Container } from "@/components/layouts";
import { fetchAllAvailableCars } from "@/lib/cars/fetchCars";
import { CarsCarousel } from "@/components/pages/home/CarsCarousel";

import { HeroContent } from "@/components/pages/home/HeroContent";
import { HeroLogo } from "@/components/pages/home/HeroLogo";
import { PartnersStrip } from "@/components/pages/home/PartnersStrip";
import { ServicesSection } from "@/components/pages/home/ServicesSection";
import { AboutSection } from "@/components/pages/home/AboutSection";
import { ContactSection } from "@/components/pages/home/ContactSection";
import { ShippingMap } from "@/components/pages/home/ShippingMap";
import { ScrollReveal } from "@/components/pages/home/ScrollReveal";
import { ScrollSpy } from "@/components/pages/home/ScrollSpy";
import { PopularDealsHeader } from "@/components/pages/home/PopularDealsHeader";


export const HomePage = async () => {
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
          <ScrollReveal>
            <PartnersStrip />
          </ScrollReveal>
        </Container>
      </section>

      <section id="services" className="py-20 lg:py-28 bg-white dark:bg-black transition-colors duration-300">
        <Container>
          <ScrollReveal>
            <ServicesSection />
          </ScrollReveal>
        </Container>
      </section>

      <section id="shipping" className="py-20 lg:py-28 bg-gray-50 dark:bg-[#111111] transition-colors duration-300">
        <Container>
          <ScrollReveal>
            <ShippingMap />
          </ScrollReveal>
        </Container>
      </section>

      <section id="popular-deals" className="py-20 lg:py-28 bg-white dark:bg-black transition-colors duration-300">
        <Container>
          <PopularDealsHeader />

          <ScrollReveal delay={0.2}>
            <CarsCarousel cars={cars} />
          </ScrollReveal>
        </Container>
      </section>

      <section id="about" className="py-20 lg:py-28 bg-gray-50 dark:bg-[#111111] transition-colors duration-300">
        <Container>
          <ScrollReveal>
            <AboutSection />
          </ScrollReveal>
        </Container>
      </section>

      <section id="contact" className="py-20 lg:py-28 bg-white dark:bg-black transition-colors duration-300">
        <Container>
          <ScrollReveal>
            <ContactSection />
          </ScrollReveal>
        </Container>
      </section>
    </div>
  );
};
