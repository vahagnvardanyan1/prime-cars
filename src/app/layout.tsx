import type { ReactNode } from "react";

// This is a pass-through root layout. The real <html> and <body> live in
// src/app/[locale]/layout.tsx so that the `lang` attribute is set dynamically
// per locale. Next.js 14 requires a root layout; returning children directly
// is the documented next-intl + App Router pattern.

const RootLayout = ({ children }: { children: ReactNode }) => children;

export default RootLayout;
