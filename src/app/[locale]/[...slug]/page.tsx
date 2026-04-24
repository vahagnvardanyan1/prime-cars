import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

import type { Locale } from "@/i18n/config";

// Anchor sections on the home page — redirect /services → /#services
const ANCHOR_SECTIONS = ["services", "about", "contact"];

type PageProps = {
  params: { locale: Locale; slug: string[] };
};

export default function CatchAllPage({ params }: PageProps) {
  const path = params.slug.join("/");

  if (ANCHOR_SECTIONS.includes(path)) {
    redirect(`/${params.locale}/#${path}`);
  }

  notFound();
}
