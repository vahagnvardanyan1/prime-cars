import { getTranslations } from "next-intl/server";

import { ImportCalculator } from "@/components/ImportCalculator";
import { Container, SectionHeader } from "@/components/layouts";
import { fetchAllAvailableCars } from "@/lib/cars/fetchCars";
import { CarsCarousel } from "@/components/pages/home/CarsCarousel";

import { HeroContent } from "@/components/pages/home/HeroContent";
import { HeroLogo } from "@/components/pages/home/HeroLogo";
import { ScrollReveal } from "@/components/pages/home/ScrollReveal";
import { ScrollSpy } from "@/components/pages/home/ScrollSpy";


export const HomePage = async () => {
  const t = await getTranslations();
  
  // Fetch cars data server-side
  const result = await fetchAllAvailableCars();
  const cars = result.success ? result.cars || [] : [];

  return (
    <div className="pt-20 relative">
      <ScrollSpy />

      <section id="hero" className="relative overflow-hidden bg-gray-50 dark:bg-black min-h-[90vh] flex items-center transition-colors duration-300 scroll-mt-20">
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

      <section id="popular-deals" className="py-20 lg:py-28 bg-white dark:bg-black transition-colors duration-300 scroll-mt-20">
        <Container>
          <ScrollReveal>
            <SectionHeader
              title={t("home.popularDeals.title")}
              description={t("home.popularDeals.description")}
            />
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <CarsCarousel cars={cars} />
          </ScrollReveal>
        </Container>
      </section>

      <section id="import-calculator" className="py-20 lg:py-28 bg-white dark:bg-black border-t border-gray-200 dark:border-white/10 transition-colors duration-300 scroll-mt-20">
        <Container>
          <ScrollReveal>
            <SectionHeader
              title={t("home.importCosts.title")}
              description={t("home.importCosts.description")}
            />
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <ImportCalculator showPartnerMessage={true} />
          </ScrollReveal>
        </Container>
      </section>
    </div>
  );
};
     