import type { Car, CarCategory, CarStatus } from "@/lib/cars/types";
import type { Locale } from "@/i18n/config";

import { SITE_URL, SITE_NAME } from "./metadata";

// ---------- Shared business data ----------

const BUSINESS = {
  legalName: "Prime Cars LLC",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  telephone: "+37444771130",
  email: "primecarsarm@gmail.com",
  address: {
    streetAddress: "Arshakunyats 26",
    addressLocality: "Gyumri",
    addressRegion: "Shirak",
    postalCode: "3101",
    addressCountry: "AM",
  },
  geo: { latitude: 40.16406, longitude: 44.50152 },
  // Coordinates come from the Google Maps embed in ContactSection.
  sameAs: [
    "https://www.instagram.com/prime_cars_am",
    "https://www.facebook.com/share/17pXSbQMJT/",
    "https://wa.me/37444771130",
  ],
  priceRange: "$$",
  foundingDate: "2016",
  areaServed: { "@type": "Country", name: "Armenia" },
} as const;

// ---------- Organization / AutoDealer / LocalBusiness ----------

export const organizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": ["Organization", "AutoDealer", "LocalBusiness"],
  "@id": `${SITE_URL}/#organization`,
  name: BUSINESS.name,
  legalName: BUSINESS.legalName,
  url: BUSINESS.url,
  logo: {
    "@type": "ImageObject",
    url: BUSINESS.logo,
  },
  image: BUSINESS.logo,
  telephone: BUSINESS.telephone,
  email: BUSINESS.email,
  address: {
    "@type": "PostalAddress",
    ...BUSINESS.address,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: BUSINESS.geo.latitude,
    longitude: BUSINESS.geo.longitude,
  },
  sameAs: BUSINESS.sameAs,
  priceRange: BUSINESS.priceRange,
  foundingDate: BUSINESS.foundingDate,
  areaServed: BUSINESS.areaServed,
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: BUSINESS.telephone,
      contactType: "customer service",
      availableLanguage: ["hy", "en", "ru"],
    },
  ],
});

// ---------- WebSite ----------
// SearchAction is intentionally omitted: the /cars listing doesn't currently
// filter by a `?search=` query param, so announcing one in JSON-LD would make
// Google's sitelinks search box send users to a URL the app ignores. Re-add a
// `potentialAction` block once the cars listing supports a `?search=` filter.

export const websiteJsonLd = (locale: Locale) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  inLanguage: locale,
  publisher: { "@id": `${SITE_URL}/#organization` },
});

// ---------- BreadcrumbList ----------

type BreadcrumbItem = { name: string; url: string };

export const breadcrumbJsonLd = (items: BreadcrumbItem[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

// ---------- Vehicle / Product for car-detail pages ----------

const FUEL_MAP: Record<string, string> = {
  gasoline: "https://schema.org/Gasoline",
  petrol: "https://schema.org/Gasoline",
  diesel: "https://schema.org/Diesel",
  hybrid: "https://schema.org/HybridFuel",
  electric: "https://schema.org/ElectricFuel",
  ev: "https://schema.org/ElectricFuel",
  lpg: "https://schema.org/LPG",
  cng: "https://schema.org/CNG",
};

const normaliseFuel = (fuel?: string) => {
  if (!fuel) return undefined;
  return FUEL_MAP[fuel.toLowerCase()] ?? fuel;
};

const TRANSMISSION_MAP: Record<string, string> = {
  AUTOMATIC: "Automatic",
  MECHANIC: "Manual",
  VARIATOR: "CVT",
  ROBOT: "Automated manual",
};

// Map our internal CarCategory + CarStatus to schema.org ItemAvailability.
// `status` is authoritative when set to a terminal state (sold/reserved);
// otherwise fall back to `category` for the lifecycle stage.
const availabilityFor = (
  status: CarStatus | undefined,
  category: CarCategory | undefined,
): string => {
  if (status === "sold") return "https://schema.org/SoldOut";
  if (status === "reserved") return "https://schema.org/Reserved";
  if (category === "AVAILABLE" || status === "available") return "https://schema.org/InStock";
  // ONROAD + TRANSIT + "available_to_order" + "in_transit" all map to PreOrder.
  return "https://schema.org/PreOrder";
};

export const vehicleJsonLd = (car: Car, canonicalUrl: string) => {
  const photos = car.photos && car.photos.length > 0 ? car.photos : [car.imageUrl].filter(Boolean);
  const fuel = normaliseFuel(car.fuelType);
  const transmission = car.transmission ? TRANSMISSION_MAP[car.transmission] ?? car.transmission : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    "@id": `${canonicalUrl}#vehicle`,
    name: `${car.year} ${car.model}`,
    description: car.description,
    brand: { "@type": "Brand", name: car.brand },
    model: car.model,
    vehicleModelDate: String(car.year),
    vehicleIdentificationNumber: car.vin,
    url: canonicalUrl,
    image: photos,
    ...(fuel ? { fuelType: fuel } : {}),
    ...(transmission ? { vehicleTransmission: transmission } : {}),
    ...(car.engineSize
      ? {
          engineSize: {
            "@type": "QuantitativeValue",
            value: car.engineSize,
            unitCode: "CMQ",
          },
        }
      : {}),
    ...(car.horsepower
      ? {
          vehicleEngine: {
            "@type": "EngineSpecification",
            enginePower: {
              "@type": "QuantitativeValue",
              value: car.horsepower,
              unitCode: "BHP",
            },
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      price: car.priceUsd,
      priceCurrency: "USD",
      availability: availabilityFor(car.status, car.category),
      itemCondition: "https://schema.org/UsedCondition",
      seller: { "@id": `${SITE_URL}/#organization` },
    },
  };
};

