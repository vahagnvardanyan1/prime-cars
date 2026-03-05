import { useTranslations } from "next-intl";

import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import { Container } from "@/components/layouts";
import { Link } from "@/i18n/routing";

export const Footer = () => {
  const t = useTranslations();

  return (
    <footer className="bg-blue-900 dark:bg-blue-800 border-t border-gray-300 dark:border-white/10 text-gray-900 dark:text-white pt-16 pb-8 transition-colors duration-300">
      <Container>
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
                className="w-10 h-10 bg-gray-200 dark:bg-white/10 hover:bg-[#429de6] dark:hover:bg-[#429de6] rounded-lg flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#429de6] focus-visible:ring-offset-2"
              >
                <Facebook aria-hidden="true" className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/prime_cars_am?igsh=MWF1ZzkxZnlsaTN4eg=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 bg-gray-200 dark:bg-white/10 hover:bg-[#429de6] dark:hover:bg-[#429de6] rounded-lg flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#429de6] focus-visible:ring-offset-2"
              >
                <Instagram aria-hidden="true" className="w-5 h-5" />
              </a>
            </div>
          </div>

          <nav aria-label={t("footer.quickLinks")}> 
            <h3 className="text-gray-900 dark:text-white mb-4">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none focus-visible:text-[#429de6] focus-visible:underline"
                >
                  {t("footer.links.home")}
                </Link>
              </li>
              <li>
                <Link
                  href="/cars"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none focus-visible:text-[#429de6] focus-visible:underline"
                >
                  {t("footer.links.browseCars")}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </Container>
    </footer>
  );
};
