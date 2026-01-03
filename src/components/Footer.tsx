import Link from "next/link";

import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-black border-t border-gray-300 dark:border-white/10 text-gray-900 dark:text-white pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Logo
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your trusted partner in international car imports and auctions since
              2013.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 bg-gray-200 dark:bg-white/10 hover:bg-[#429de6] dark:hover:bg-[#429de6] rounded-lg flex items-center justify-center transition-all"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-200 dark:bg-white/10 hover:bg-[#429de6] dark:hover:bg-[#429de6] rounded-lg flex items-center justify-center transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-200 dark:bg-white/10 hover:bg-[#429de6] dark:hover:bg-[#429de6] rounded-lg flex items-center justify-center transition-all"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-200 dark:bg-white/10 hover:bg-[#429de6] dark:hover:bg-[#429de6] rounded-lg flex items-center justify-center transition-all"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-gray-900 dark:text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/cars"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Browse Cars
                </Link>
              </li>
              <li>
                <Link
                  href="/calculator"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Cost Calculator
                </Link>
              </li>
              <li>
                <Link
                  href="/partners"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  For Partners
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 dark:text-white mb-4">Services</h3>
            <ul className="space-y-3">
              <li className="text-gray-600 dark:text-gray-400">
                Vehicle Sourcing
              </li>
              <li className="text-gray-600 dark:text-gray-400">Auction Bidding</li>
              <li className="text-gray-600 dark:text-gray-400">
                Import Management
              </li>
              <li className="text-gray-600 dark:text-gray-400">Customs Clearance</li>
              <li className="text-gray-600 dark:text-gray-400">
                Shipping & Logistics
              </li>
              <li className="text-gray-600 dark:text-gray-400">
                Inspection Services
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 dark:text-white mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#429de6] flex-shrink-0 mt-0.5" />
                <a
                  href="mailto:info@primecars.com"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  info@primecars.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#429de6] flex-shrink-0 mt-0.5" />
                <a
                  href="tel:+18005551234"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  +1 (800) 555-1234
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#429de6] flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-400">
                  123 Import Avenue
                  <br />
                  New York, NY 10001
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-300 dark:border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 dark:text-gray-400 text-center md:text-left">
              © 2024 Prime Cars. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
