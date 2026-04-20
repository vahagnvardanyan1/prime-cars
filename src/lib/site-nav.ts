export const siteNavItems = [
  { key: "home", href: "/" },
  { key: "cars", href: "/cars" },
  { key: "calculator", href: "/calculator" },
  { key: "services", href: "#services" },
  { key: "about", href: "#about" },
  { key: "contact", href: "#contact" },
] as const;

export type SiteNavItem = (typeof siteNavItems)[number];
