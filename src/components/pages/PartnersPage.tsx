import Image from "next/image";

import { Globe, Mail, MapPin, Phone, Shield, TrendingUp, Users } from "lucide-react";

export const PartnersPage = () => {
  return (
    <div className="pt-20 min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-full text-[#429de6] mb-6 transition-colors duration-300">
                <Users className="w-4 h-4" />
                <span>Partnership Opportunities</span>
              </div>
              <h1 className="text-gray-900 dark:text-white mb-6">
                Together we create success
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
                Join Prime Cars&apos; global network and unlock new opportunities
                in the automotive import industry. We&apos;re looking for
                strategic partners who share our vision of excellence and
                innovation.
              </p>
              
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-gray-900 dark:text-white mb-4">Get in Touch</h3>
                
                <a 
                  href="tel:+37460670000"
                  className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-[#429de6] dark:hover:text-[#429de6] transition-colors group"
                >
                  <div className="w-10 h-10 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center border border-gray-300 dark:border-white/10 group-hover:border-[#429de6]/50 transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span>+374 60 670000</span>
                </a>
                
                <a 
                  href="tel:+37498787171"
                  className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-[#429de6] dark:hover:text-[#429de6] transition-colors group"
                >
                  <div className="w-10 h-10 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center border border-gray-300 dark:border-white/10 group-hover:border-[#429de6]/50 transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span>+374 98 787171</span>
                </a>
                
                <a 
                  href="mailto:sales@autobuy.am"
                  className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-[#429de6] dark:hover:text-[#429de6] transition-colors group"
                >
                  <div className="w-10 h-10 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center border border-gray-300 dark:border-white/10 group-hover:border-[#429de6]/50 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span>sales@autobuy.am</span>
                </a>
                
                <div className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center border border-gray-300 dark:border-white/10 flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span>Armenia, Yerevan, Kilikia District 3/24</span>
                </div>
              </div>

              <button className="mt-8 px-8 py-4 bg-[#429de6] text-white rounded-lg hover:bg-[#3a8acc] transition-all hover:shadow-xl hover:shadow-blue-500/30">
                Become a Partner
              </button>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative h-[500px] rounded-2xl overflow-hidden border border-white/10">
                <Image
                  src="https://images.unsplash.com/photo-1745847768380-2caeadbb3b71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHBhcnRuZXJzaGlwJTIwaGFuZHNoYWtlfGVufDF8fHx8MTc2NzM2MTMyNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Business Partnership"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-100 dark:bg-[#111111] border-y border-gray-300 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-gray-900 dark:text-white mb-4">Why Partner With Prime Cars</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Join a network of successful partners and benefit from our expertise, resources, and global reach
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-black rounded-2xl border border-gray-300 dark:border-white/10 p-8 hover:border-[#429de6]/50 transition-all">
              <div className="w-14 h-14 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center mb-6 border border-gray-300 dark:border-white/10">
                <TrendingUp className="w-7 h-7 text-[#429de6]" />
              </div>
              <h3 className="text-gray-900 dark:text-white mb-3">Growth Opportunities</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Access to expanding markets and continuous business growth through our established network and proven track record.
              </p>
            </div>

            <div className="bg-white dark:bg-black rounded-2xl border border-gray-300 dark:border-white/10 p-8 hover:border-[#429de6]/50 transition-all">
              <div className="w-14 h-14 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center mb-6 border border-gray-300 dark:border-white/10">
                <Shield className="w-7 h-7 text-[#429de6]" />
              </div>
              <h3 className="text-gray-900 dark:text-white mb-3">Trusted Partnership</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Build a long-term relationship based on transparency, reliability, and mutual success in the automotive industry.
              </p>
            </div>

            <div className="bg-white dark:bg-black rounded-2xl border border-gray-300 dark:border-white/10 p-8 hover:border-[#429de6]/50 transition-all">
              <div className="w-14 h-14 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center mb-6 border border-gray-300 dark:border-white/10">
                <Globe className="w-7 h-7 text-[#429de6]" />
              </div>
              <h3 className="text-gray-900 dark:text-white mb-3">Global Reach</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Leverage our international network spanning 15+ countries and connections with major auction houses worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-black transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="bg-gradient-to-br from-[#429de6] to-[#3a8acc] rounded-2xl p-12 text-center">
            <h2 className="text-white mb-4">Ready to Start a Partnership?</h2>
            <p className="text-blue-50 max-w-2xl mx-auto mb-8 text-lg">
              Let&apos;s discuss how we can work together to achieve success in
              the global automotive market.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:+37460670000"
                className="px-8 py-4 bg-white text-[#429de6] rounded-lg hover:shadow-xl transition-all"
              >
                Call Us Now
              </a>
              <a 
                href="mailto:sales@autobuy.am"
                className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-all"
              >
                Send Email
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
