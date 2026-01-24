import { useTranslations } from "next-intl";

import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import { Link } from "@/i18n/routing";

export const Footer = () => {
  const t = useTranslations();

  return (
    <footer className="bg-gray-100 dark:bg-black border-t border-gray-300 dark:border-white/10 text-gray-900 dark:text-white pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t("footer.brandLabel")}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t("footer.description")}
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/share/17pXSbQMJT/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 bg-gray-200 dark:bg-white/10 hover:bg-[#429de6] dark:hover:bg-[#429de6] rounded-lg flex items-center justify-center transition-all"
              >
                <Facebook aria-hidden="true" className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/prime_cars_am?igsh=MWF1ZzkxZnlsaTN4eg=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 bg-gray-200 dark:bg-white/10 hover:bg-[#429de6] dark:hover:bg-[#429de6] rounded-lg flex items-center justify-center transition-all"
              >
                <Instagram aria-hidden="true" className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-gray-900 dark:text-white mb-4">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {t("footer.links.home")}
                </Link>
              </li>
              <li>
                <Link
                  href="/cars"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {t("footer.links.browseCars")}
                </Link>
              </li>
              <li>
                <Link
                  href="/calculator"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {t("footer.links.costCalculator")}
                </Link>
              </li>
              <li>
                <Link
                  href="/partners"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {t("footer.links.partners")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 dark:text-white mb-4">
              {t("footer.contact")}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail aria-hidden="true" className="w-5 h-5 text-[#429de6] flex-shrink-0 mt-0.5" />
                <a
                  href="mailto:primecarsarm@gmail.com"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  primecarsarm@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone aria-hidden="true" className="w-5 h-5 text-[#429de6] flex-shrink-0 mt-0.5" />
                <a
                  href="tel:+37444771130"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  +374 44 771130
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin aria-hidden="true" className="w-5 h-5 text-[#429de6] flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-400">
                  {t("footer.address")}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-300 dark:border-white/10">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} {t("footer.copyright")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
