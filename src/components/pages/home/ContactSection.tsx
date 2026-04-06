"use client";

import { useTranslations } from "next-intl";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { FaInstagram, FaFacebookF, FaWhatsapp, FaViber } from "react-icons/fa";

export function ContactSection() {
  const t = useTranslations();

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="mb-4">{t("home.contactUs.title")}</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t("home.contactUs.description")}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <a
            href="mailto:primecarsarm@gmail.com"
            className="flex items-center gap-4 p-5 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-[#429de6]/50 transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-[#429de6]/10 flex items-center justify-center flex-shrink-0">
              <FiMail className="w-5 h-5 text-[#429de6]" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              primecarsarm@gmail.com
            </span>
          </a>

          <a
            href="tel:+37444771130"
            className="flex items-center gap-4 p-5 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-[#429de6]/50 transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-[#429de6]/10 flex items-center justify-center flex-shrink-0">
              <FiPhone className="w-5 h-5 text-[#429de6]" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              +374 44 771130
            </span>
          </a>

          <div className="flex items-center gap-4 p-5 rounded-2xl border border-gray-200 dark:border-white/10">
            <div className="w-10 h-10 rounded-lg bg-[#429de6]/10 flex items-center justify-center flex-shrink-0">
              <FiMapPin className="w-5 h-5 text-[#429de6]" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Arshakunyats 26
            </span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <a
              href="https://www.instagram.com/prime_cars_am?igsh=MWF1ZzkxZnlsaTN4eg=="
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-[#429de6]/10 flex items-center justify-center hover:bg-[#429de6]/20 transition-colors"
              aria-label="Instagram"
            >
              <FaInstagram className="w-5 h-5 text-[#429de6]" />
            </a>
            <a
              href="https://www.facebook.com/share/17pXSbQMJT/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-[#429de6]/10 flex items-center justify-center hover:bg-[#429de6]/20 transition-colors"
              aria-label="Facebook"
            >
              <FaFacebookF className="w-5 h-5 text-[#429de6]" />
            </a>
            <a
              href="https://wa.me/37444771130"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-[#429de6]/10 flex items-center justify-center hover:bg-[#429de6]/20 transition-colors"
              aria-label="WhatsApp"
            >
              <FaWhatsapp className="w-5 h-5 text-[#429de6]" />
            </a>
            <a
              href="viber://chat?number=37444771130"
              className="w-10 h-10 rounded-lg bg-[#429de6]/10 flex items-center justify-center hover:bg-[#429de6]/20 transition-colors"
              aria-label="Viber"
            >
              <FaViber className="w-5 h-5 text-[#429de6]" />
            </a>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 min-h-[300px]">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3049.0219736966833!2d44.50152187655012!3d40.16406447097785!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x406aa30e0f7d7797%3A0xcba3d8fc5f852725!2sPrime%20Cars%20LLC!5e0!3m2!1sen!2sam!4v1775486151372!5m2!1sen!2sam"
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: 300 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Prime Cars Location"
          />
        </div>
      </div>
    </div>
  );
}
