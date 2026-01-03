import {
  Award,
  CheckCircle2,
  Globe,
  Shield,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";

export const AboutPage = () => {
  const t = useTranslations();

  return (
    <div className="pt-20 min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-100 dark:from-[#111111] to-white dark:to-black py-20 border-b border-gray-300 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-full text-[#429de6] mb-6 transition-colors duration-300">
              <Award className="w-4 h-4" />
              <span>{t("about.badge")}</span>
            </div>
            <h1 className="text-gray-900 dark:text-white mb-6">
              {t("about.heroTitle")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {t("about.heroBody")}
            </p>
          </div>
        </div>
      </section>

      {/* Mission Cards */}
      <section className="py-20 bg-white dark:bg-black transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-[#429de6] to-[#3a8acc] rounded-2xl p-8 text-white">
              <Target className="w-12 h-12 mb-6 opacity-90" />
              <h2 className="text-white mb-4">{t("about.missionTitle")}</h2>
              <p className="text-blue-50">
                {t("about.missionBody")}
              </p>
            </div>

            <div className="bg-white dark:bg-[#111111] rounded-2xl p-8 text-white border border-gray-300 dark:border-white/10 transition-colors duration-300">
              <Zap className="w-12 h-12 mb-6 text-[#da565b]" />
              <h2 className="text-gray-900 dark:text-white mb-4">{t("about.visionTitle")}</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t("about.visionBody")}
              </p>
            </div>

            <div className="bg-white dark:bg-[#111111] rounded-2xl p-8 border border-gray-300 dark:border-white/10 transition-colors duration-300">
              <Users className="w-12 h-12 mb-6 text-[#429de6]" />
              <h2 className="text-gray-900 dark:text-white mb-4">{t("about.valuesTitle")}</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t("about.valuesBody")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gray-100 dark:bg-[#111111] border-y border-gray-300 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-gray-900 dark:text-white mb-4">{t("about.journeyTitle")}</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t("about.journeyBody")}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              {[
                { year: "2013", key: "companyFounded" },
                { year: "2015", key: "europeanExpansion" },
                { year: "2018", key: "platformLaunch" },
                { year: "2020", key: "globalNetwork" },
                { year: "2023", key: "industryLeader" },
                { year: "2024", key: "innovationGrowth" },
              ].map((milestone, index) => (
                <div key={index} className="flex gap-8">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-[#429de6] text-white rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span>{milestone.year}</span>
                    </div>
                    {index < 5 && (
                      <div className="w-0.5 h-full bg-gradient-to-b from-[#429de6] to-transparent mt-4" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <h3 className="text-gray-900 dark:text-white mb-2">
                      {t(`about.timeline.${milestone.key}.title`)}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t(`about.timeline.${milestone.key}.description`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-white dark:bg-black transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-gray-900 dark:text-white mb-4">{t("about.statsTitle")}</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t("about.statsBody")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-300 dark:border-white/10 p-8 text-center transition-colors duration-300">
              <div className="text-[#429de6] mb-2">15,000+</div>
              <div className="text-gray-600 dark:text-gray-400">{t("about.stats.happyCustomers")}</div>
            </div>
            <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-300 dark:border-white/10 p-8 text-center transition-colors duration-300">
              <div className="text-[#429de6] mb-2">$450M+</div>
              <div className="text-gray-600 dark:text-gray-400">{t("about.stats.transactionValue")}</div>
            </div>
            <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-300 dark:border-white/10 p-8 text-center transition-colors duration-300">
              <div className="text-[#429de6] mb-2">98%</div>
              <div className="text-gray-600 dark:text-gray-400">{t("about.stats.satisfactionRate")}</div>
            </div>
            <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-300 dark:border-white/10 p-8 text-center transition-colors duration-300">
              <div className="text-[#429de6] mb-2">50+</div>
              <div className="text-gray-600 dark:text-gray-400">{t("about.stats.globalPartners")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-100 dark:bg-[#111111] border-y border-gray-300 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-gray-900 dark:text-white mb-4">{t("about.whyTitle")}</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t("about.whyBody")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              { icon: CheckCircle2, key: "endToEnd" },
              { icon: Shield, key: "transparency" },
              { icon: TrendingUp, key: "expertise" },
              { icon: Award, key: "quality" },
              { icon: Users, key: "support" },
              { icon: Globe, key: "network" },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-black rounded-2xl border border-gray-300 dark:border-white/10 p-8 hover:shadow-lg hover:border-[#429de6]/50 transition-all"
              >
                <div className="w-14 h-14 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center mb-6 border border-gray-300 dark:border-white/10">
                  <item.icon className="w-7 h-7 text-[#429de6]" />
                </div>
                <h3 className="text-gray-900 dark:text-white mb-3">
                  {t(`about.whyCards.${item.key}.title`)}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t(`about.whyCards.${item.key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#429de6] to-[#3a8acc]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-white mb-4">{t("about.cta.title")}</h2>
          <p className="text-blue-50 max-w-2xl mx-auto mb-8 text-lg">
            {t("about.cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-[#429de6] rounded-lg hover:shadow-xl transition-all">
              {t("about.cta.browse")}
            </button>
            <button className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-all">
              {t("about.cta.contact")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
