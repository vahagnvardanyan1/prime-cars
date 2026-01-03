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

export const AboutPage = () => {
  return (
    <div className="pt-20 min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-100 dark:from-[#111111] to-white dark:to-black py-20 border-b border-gray-300 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-full text-[#429de6] mb-6 transition-colors duration-300">
              <Award className="w-4 h-4" />
              <span>Since 2013</span>
            </div>
            <h1 className="text-gray-900 dark:text-white mb-6">
              Transforming Global Automotive Trade
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Prime Cars was founded on a simple belief: importing a car
              shouldn&apos;t be complicated. We&apos;ve built a platform that
              combines cutting-edge technology with deep industry expertise to
              make international car trading accessible to everyone.
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
              <h2 className="text-white mb-4">Our Mission</h2>
              <p className="text-blue-50">
                To democratize access to the global automotive market by providing transparent, efficient, and trustworthy import services that empower buyers worldwide.
              </p>
            </div>

            <div className="bg-white dark:bg-[#111111] rounded-2xl p-8 text-white border border-gray-300 dark:border-white/10 transition-colors duration-300">
              <Zap className="w-12 h-12 mb-6 text-[#da565b]" />
              <h2 className="text-gray-900 dark:text-white mb-4">Our Vision</h2>
              <p className="text-gray-600 dark:text-gray-400">
                To become the world&apos;s most trusted platform for
                international vehicle trading, setting new standards for
                transparency and customer experience.
              </p>
            </div>

            <div className="bg-white dark:bg-[#111111] rounded-2xl p-8 border border-gray-300 dark:border-white/10 transition-colors duration-300">
              <Users className="w-12 h-12 mb-6 text-[#429de6]" />
              <h2 className="text-gray-900 dark:text-white mb-4">Our Values</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Integrity, transparency, and customer-first thinking guide every decision we make and every service we provide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gray-100 dark:bg-[#111111] border-y border-gray-300 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-gray-900 dark:text-white mb-4">Our Journey</h2>
            <p className="text-gray-600 dark:text-gray-400">
              From a small team with a big vision to a global leader in automotive imports
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              {[
                {
                  year: '2013',
                  title: 'Company Founded',
                  description:
                    'Started operations with a focus on Japanese car imports. Processed our first 50 vehicles.',
                },
                {
                  year: '2015',
                  title: 'European Expansion',
                  description:
                    'Expanded operations to include premium European vehicles. Established partnerships with German and UK auction houses.',
                },
                {
                  year: '2018',
                  title: 'Platform Launch',
                  description:
                    'Launched our digital platform, introducing the first online cost calculator and real-time tracking for customers.',
                },
                {
                  year: '2020',
                  title: 'Global Network',
                  description:
                    'Reached 15 countries in our network. Surpassed 10,000 vehicles imported with a 98% satisfaction rate.',
                },
                {
                  year: '2023',
                  title: 'Industry Leader',
                  description:
                    'Recognized as one of the top import services globally. Introduced AI-powered vehicle matching and expanded to electric vehicle imports.',
                },
                {
                  year: '2024',
                  title: 'Innovation & Growth',
                  description:
                    'Launched blockchain-based documentation system. Achieved carbon-neutral shipping on all routes.',
                },
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
                    <h3 className="text-gray-900 dark:text-white mb-2">{milestone.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{milestone.description}</p>
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
            <h2 className="text-gray-900 dark:text-white mb-4">By The Numbers</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Our track record speaks to our commitment to excellence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-300 dark:border-white/10 p-8 text-center transition-colors duration-300">
              <div className="text-[#429de6] mb-2">15,000+</div>
              <div className="text-gray-600 dark:text-gray-400">Happy Customers</div>
            </div>
            <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-300 dark:border-white/10 p-8 text-center transition-colors duration-300">
              <div className="text-[#429de6] mb-2">$450M+</div>
              <div className="text-gray-600 dark:text-gray-400">Transaction Value</div>
            </div>
            <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-300 dark:border-white/10 p-8 text-center transition-colors duration-300">
              <div className="text-[#429de6] mb-2">98%</div>
              <div className="text-gray-600 dark:text-gray-400">Satisfaction Rate</div>
            </div>
            <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-300 dark:border-white/10 p-8 text-center transition-colors duration-300">
              <div className="text-[#429de6] mb-2">50+</div>
              <div className="text-gray-600 dark:text-gray-400">Global Partners</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-100 dark:bg-[#111111] border-y border-gray-300 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-gray-900 dark:text-white mb-4">Why Prime Cars</h2>
            <p className="text-gray-600 dark:text-gray-400">
              What sets us apart in the global automotive import industry
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: CheckCircle2,
                title: 'End-to-End Service',
                description:
                  'From vehicle sourcing to delivery at your door, we manage every step of the import process with precision and care.',
              },
              {
                icon: Shield,
                title: 'Full Transparency',
                description:
                  'No hidden fees, no surprises. Our cost calculator and tracking system keep you informed at every stage.',
              },
              {
                icon: TrendingUp,
                title: 'Market Expertise',
                description:
                  'Over a decade of experience gives us unmatched insights into global automotive markets and import regulations.',
              },
              {
                icon: Award,
                title: 'Quality Assurance',
                description:
                  'Every vehicle undergoes rigorous inspection and comes with comprehensive documentation and history reports.',
              },
              {
                icon: Users,
                title: 'Dedicated Support',
                description:
                  '24/7 customer support from import specialists who understand your needs and guide you through the process.',
              },
              {
                icon: Globe,
                title: 'Global Network',
                description:
                  'Strategic partnerships with leading auction houses, logistics providers, and inspection agencies worldwide.',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-black rounded-2xl border border-gray-300 dark:border-white/10 p-8 hover:shadow-lg hover:border-[#429de6]/50 transition-all"
              >
                <div className="w-14 h-14 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center mb-6 border border-gray-300 dark:border-white/10">
                  <item.icon className="w-7 h-7 text-[#429de6]" />
                </div>
                <h3 className="text-gray-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#429de6] to-[#3a8acc]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-white mb-4">Ready to Start Your Import Journey?</h2>
          <p className="text-blue-50 max-w-2xl mx-auto mb-8 text-lg">
            Join thousands of satisfied customers who trust Prime Cars for their international automotive needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-[#429de6] rounded-lg hover:shadow-xl transition-all">
              Browse Inventory
            </button>
            <button className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-all">
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
