import Image from "next/image";

import { Globe, Mail, MapPin, Phone, Shield, TrendingUp, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { Container } from "@/components/layouts";

export const PartnersPage = () => {
  const t = useTranslations();

  return (
    <div className="pt-20 min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden transition-colors duration-300">
        <Container className="py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-full text-[#429de6] mb-6 transition-colors duration-300">
                <Users aria-hidden="true" className="w-4 h-4" />
                <span>{t("partners.badge")}</span>
              </div>
              <h1 className="text-gray-900 dark:text-white mb-6">
                {t("partners.title")}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
                {t("partners.description")}
              </p>
              
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-gray-900 dark:text-white mb-4">
                  {t("partners.getInTouch")}
                </h3>
                
                <a
                  href="tel:+37444771130"
                  className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-[#429de6] dark:hover:text-[#429de6] transition-colors group rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#429de6] focus-visible:ring-offset-2"
                >
                  <div aria-hidden="true" className="w-10 h-10 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center border border-gray-300 dark:border-white/10 group-hover:border-[#429de6]/50 transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span>+374 44 771130</span>
                </a>

                <a
                  href="mailto:primecarsarm@gmail.com"
                  className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-[#429de6] dark:hover:text-[#429de6] transition-colors group rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#429de6] focus-visible:ring-offset-2"
                >
                  <div aria-hidden="true" className="w-10 h-10 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center border border-gray-300 dark:border-white/10 group-hover:border-[#429de6]/50 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span>primecarsarm@gmail.com</span>
                </a>

                <a
                  href="https://maps.google.com/?q=Arshakunyats+26+Yerevan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-gray-600 dark:text-gray-400 hover:text-[#429de6] dark:hover:text-[#429de6] transition-colors group rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#429de6] focus-visible:ring-offset-2"
                >
                  <div aria-hidden="true" className="w-10 h-10 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center border border-gray-300 dark:border-white/10 flex-shrink-0 group-hover:border-[#429de6]/50 transition-colors">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span>{t("footer.address")}</span>
                </a>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative h-[500px] rounded-2xl overflow-hidden border border-white/10">
                <Image
                  src="https://images.unsplash.com/photo-1745847768380-2caeadbb3b71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHBhcnRuZXJzaGlwJTIwaGFuZHNoYWtlfGVufDF8fHx8MTc2NzM2MTMyNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt={t("partners.heroImageAlt")}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-100 dark:bg-[#111111] border-y border-gray-300 dark:border-white/10 transition-colors duration-300">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-gray-900 dark:text-white mb-4">
              {t("partners.benefits.title")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t("partners.benefits.description")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-black rounded-2xl border border-gray-300 dark:border-white/10 p-8 hover:border-yellow-400 dark:hover:border-[#429de6] hover:bg-yellow-50 dark:hover:bg-[#429de6]/10 transition-colors">
              <div aria-hidden="true" className="w-14 h-14 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center mb-6 border border-gray-300 dark:border-white/10">
                <TrendingUp className="w-7 h-7 text-[#429de6]" />
              </div>
              <h3 className="text-gray-900 dark:text-white mb-3">
                {t("partners.benefits.growth.title")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t("partners.benefits.growth.description")}
              </p>
            </div>

            <div className="bg-white dark:bg-black rounded-2xl border border-gray-300 dark:border-white/10 p-8 hover:border-yellow-400 dark:hover:border-[#429de6] hover:bg-yellow-50 dark:hover:bg-[#429de6]/10 transition-colors">
              <div aria-hidden="true" className="w-14 h-14 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center mb-6 border border-gray-300 dark:border-white/10">
                <Shield className="w-7 h-7 text-[#429de6]" />
              </div>
              <h3 className="text-gray-900 dark:text-white mb-3">
                {t("partners.benefits.trusted.title")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t("partners.benefits.trusted.description")}
              </p>
            </div>

            <div className="bg-white dark:bg-black rounded-2xl border border-gray-300 dark:border-white/10 p-8 hover:border-yellow-400 dark:hover:border-[#429de6] hover:bg-yellow-50 dark:hover:bg-[#429de6]/10 transition-colors">
              <div aria-hidden="true" className="w-14 h-14 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center mb-6 border border-gray-300 dark:border-white/10">
                <Globe className="w-7 h-7 text-[#429de6]" />
              </div>
              <h3 className="text-gray-900 dark:text-white mb-3">
                {t("partners.benefits.global.title")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t("partners.benefits.global.description")}
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
