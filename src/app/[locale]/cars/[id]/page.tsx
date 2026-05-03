import { cache } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { CarDetailsPage } from "@/components/pages/CarDetailsPage";
import { JsonLd } from "@/components/JsonLd";
import type { Locale } from "@/i18n/config";
import { fetchAvailableCarById } from "@/lib/cars/fetchCars";
import {
  createPageMetadata,
  NOINDEX_METADATA,
  buildCanonicalUrl,
} from "@/lib/seo";
import { breadcrumbJsonLd, vehicleJsonLd } from "@/lib/seo/jsonld";
import { extractCarIdFromSlug, carDetailPath } from "@/lib/seo/slug";
import {
  translateFuelType,
  translateTransmission,
} from "@/lib/utils/translateVehicleSpecs";

type PageProps = {
  params: {
    id: string;
    locale: Locale;
  };
};

// React's `cache()` memoises this per request: generateMetadata and the Page
// component both call it with the same id during a single render pass, so
// without memoisation we'd issue the backend request twice for every car view.
// `fetchAvailableCarById` uses a custom `fetch()` with `cache: "no-store"`,
// which Next.js does NOT auto-deduplicate — this is the required workaround.
const getCar = cache(async (id: string) => fetchAvailableCarById(id));

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "decimal",
  maximumFractionDigits: 0,
});

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const rawId = extractCarIdFromSlug(params.id);
  const { success, car } = await getCar(rawId);

  if (!success || !car) {
    return NOINDEX_METADATA;
  }

  const locale = params.locale;
  const [tSeo, tCarDetails] = await Promise.all([
    getTranslations({ locale, namespace: "seo.carDetail" }),
    getTranslations({ locale, namespace: "carDetails" }),
  ]);

  const priceStr = priceFormatter.format(car.priceUsd);
  const fuel = translateFuelType(car.fuelType, tCarDetails) || "-";
  const transmission = translateTransmission(car.transmission, tCarDetails) || "-";

  // The backend's `model` field often already contains the brand ("Toyota
  // RAV4"), because fetchCars.ts derives brand from splitting on " ". Strip
  // the leading brand from `model` before interpolation so we don't emit
  // "Toyota Toyota RAV4" in titles.
  const modelWithoutBrand = car.model.toLowerCase().startsWith(car.brand.toLowerCase())
    ? car.model.slice(car.brand.length).trim()
    : car.model;

  const templateVars = {
    year: String(car.year),
    brand: car.brand,
    model: modelWithoutBrand || car.model,
    price: priceStr,
    fuel,
    transmission,
  };

  const title = tSeo("titleTemplate", templateVars);
  const description = tSeo("descriptionTemplate", templateVars);
  const path = carDetailPath(car.id, car.year, car.brand, car.model);
  const ogImage = car.photos?.[0] || car.imageUrl || "/og/default.png";

  return createPageMetadata({
    title,
    description,
    path,
    locale,
    ogImage,
    // og:type "product.item" isn't supported by Next's Metadata union; the
    // Vehicle JSON-LD emitted below carries the structured product data.
    ogType: "website",
  });
};

const Page = async ({ params }: PageProps) => {
  const rawId = extractCarIdFromSlug(params.id);
  const { success, car } = await getCar(rawId);

  const tNav = await getTranslations({ locale: params.locale, namespace: "nav" });
  const locale = params.locale;

  const breadcrumb =
    success && car
      ? breadcrumbJsonLd([
          { name: tNav("home"), url: buildCanonicalUrl("/", locale) },
          { name: tNav("cars"), url: buildCanonicalUrl("/cars", locale) },
          {
            name: `${car.year} ${car.model}`,
            url: buildCanonicalUrl(
              carDetailPath(car.id, car.year, car.brand, car.model),
              locale,
            ),
          },
        ])
      : null;

  const canonicalUrl =
    success && car
      ? buildCanonicalUrl(
          carDetailPath(car.id, car.year, car.brand, car.model),
          locale,
        )
      : null;

  return (
    <>
      {success && car && canonicalUrl && breadcrumb && (
        <JsonLd id="car" data={[vehicleJsonLd(car, canonicalUrl), breadcrumb]} />
      )}
      <CarDetailsPage carId={rawId} />
    </>
  );
};

export default Page;
