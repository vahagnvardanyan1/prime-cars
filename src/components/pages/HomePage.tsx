import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { ImportCalculator } from "@/components/ImportCalculator";
import { Container, SectionHeader } from "@/components/layouts";
import { Link } from "@/i18n/routing";
import { fetchAllAvailableCars } from "@/lib/cars/fetchCars";
import { CarsCarousel } from "@/components/pages/home/CarsCarousel";

export const HomePage = async () => {
  const t = await getTranslations();
  
  // Fetch cars data server-side
  const result = await fetchAllAvailableCars();
  const cars = result.success ? result.cars || [] : [];

  return (
    <div className="pt-20">
      <section className="relative overflow-hidden bg-gray-50 dark:bg-black min-h-[90vh] flex items-center transition-colors duration-300">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] dark:opacity-100 opacity-0 transition-opacity duration-300">
          <div className="glow-effect"></div>
        </div>

        <Container className="w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="mb-6 text-gray-900 dark:text-white">
                {t("home.hero.title")}
              </h1>

              <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
                {t("home.hero.description")}
              </p>

              <Link
                href="/calculator"
                className="px-8 py-3 bg-[#429de6] text-white rounded-lg hover:bg-[#3a8acc] transition-all hover:shadow-lg hover:shadow-blue-500/20 mx-auto lg:mx-0 block lg:inline-block"
              >
                {t("home.hero.primaryCta")}
              </Link>
            </div>

            <div className="relative">
              <Image
                src="/logo.png"
                alt={t("home.hero.heroImageAlt")}
                className="w-full h-auto relative z-10"
                width={1000}
                height={600}
                priority
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20 lg:py-28 bg-white dark:bg-black transition-colors duration-300">
        <Container>
          <SectionHeader
            title={t("home.popularDeals.title")}
            description={t("home.popularDeals.description")}
          />

          <CarsCarousel cars={cars} />
        </Container>
      </section>

      <section className="py-20 lg:py-28 bg-white dark:bg-black border-t border-gray-200 dark:border-white/10 transition-colors duration-300">
        <Container>
          <SectionHeader
            title={t("home.importCosts.title")}
            description={t("home.importCosts.description")}
          />

          <ImportCalculator showPartnerMessage={true} />
        </Container>
      </section>
    </div>
  );
};
