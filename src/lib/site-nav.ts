export const siteNavItems = [
  { label: "Home", href: "/" },
  { label: "Cars", href: "/cars" },
  { label: "Calculator", href: "/calculator" },
  { label: "For Partners", href: "/partners" },
  { label: "About Us", href: "/about" },
] as const;

export type SiteNavItem = (typeof siteNavItems)[number];
