export const siteNavItems = [
  { key: "home", href: "/" },
  { key: "cars", href: "/cars" },
  { key: "calculator", href: "/calculator" },
  { key: "partners", href: "/partners" }
] as const;

export type SiteNavItem = (typeof siteNavItems)[number];
